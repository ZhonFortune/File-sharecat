const { mongoose} = require('../utils/db_connect');
const { objectGet } = require('../utils/os_connect');
const CryptoJS = require('crypto-js');
const path = require('path');
const mime = require('mime-types');

// 获取公共资源
async function getResources(req, res) {
    const filter = req.query.filter;
    const type = req.query.type;
    
    // 从数据库中获取资源
    let resourceList = [];
    try {
        const publicResources = mongoose.connection.db.collection('publicResources');
        const tempList = await publicResources.find().toArray();
        resourceList = tempList.map(item => {
            const { fileName, ...rest } = item;
            return rest;
        })
    } catch (err) {
        console.error("[数据库] - 公共资源获取失败:", err);
        return res.status(500).send({
            code: 500,
            msg: '服务器错误'
        });
    }
    
    if(!filter || !type) {
        // 若无筛选条件，则返回所有资源
        res.status(200).send({
            code: 200,
            data: resourceList
        })
    } else if(type === 'tag') {
        // 根据筛选条件返回资源
        // filter=xxx,xxx,xxx
        const filterArr = filter.split(",");
        console.log(`[公共资源] - 筛选 ${type} : ${filterArr}`)
        if(filterArr.length === 0) {
            res.status(200).send({
                code: 200,
                data: resourceList
            })
        }else {
            // 若有多个筛选条件，则返回同时满足所有条件的资源
            const result = resourceList.filter(item => {
                return filterArr.every(tag => item.tags.includes(tag))
            })
            res.status(200).send({
                code: 200,
                data: result
            })
        }
    } else if(type === 'title') {
        // 根据筛选条件返回资源
        const result = resourceList.filter(item => {
            return item.title.includes(filter)
        })
        res.status(200).send({
            code: 200,
            data: result
        })
    } else {
        res.status(400).send({
            code: 400,
            msg: '请求参数错误'
        })
    }
}

// 获取私密资源
async function getTokenResource(req, res) {
    const token = req.query.token;

    if (!token) {
        return res.status(200).json({
            code: 200,
            msg: '请求参数错误',
        });
    }

    // 从数据库中获取资源
    let resourceList = [];
    try {
        const tokenResources = mongoose.connection.db.collection('tokenResources');
        resourceList = await tokenResources.find().toArray();
    }catch (err) {
        console.error("[数据库] - 私密资源获取失败:", err);
        return res.status(500).send({
            code: 500,
            msg: '服务器错误'
        });
    }

    const result = resourceList.filter(item => item.token === token);

    if (result.length === 0) {
        return res.status(200).json({
            code: 200,
            msg: '资源不存在',
        });
    }

    // 检查是否过期 校验时间戳
    const now = new Date();
    const nowStr = now.getTime().toString();
    const timeout = result[0].timeout;

    // 转换为时间戳
    const timeoutDate = new Date(timeout);
    const timeoutStr = timeoutDate.getTime().toString();

    if (nowStr > timeoutStr) {
        return res.status(200).json({
            code: 200,
            msg: '资源已过期',
        });
    }

    return res.status(200).json({
        code: 200,
        msg: '资源获取成功',
        data: result
    });
}

// 获取资源数量
async function getResourceNum(req, res) {
    // 获取资源数量
    try {
        const publicResources = mongoose.connection.db.collection('publicResources');
        const tokenResources = mongoose.connection.db.collection('tokenResources');
        const publicNum = await publicResources.countDocuments();
        const tokenNum = await tokenResources.countDocuments();
        res.status(200).send({
            code: 200,
            data: {
                publicNum,
                tokenNum
            }
        })  
    } catch (err) {
        console.error("[数据库] - 获取资源数量失败:", err);
        res.status(500).send({
            code: 500,
            msg: '服务器错误'
        })
    }
}

// 下载资源
let DOWNLOAD_TOKENS = {};
function generateDownloadToken() {
    const raw = CryptoJS.MD5(Date.now().toString() + Math.random().toString()).toString(); 
    const base = raw.substring(0, 25); 
    const groups = base.match(/.{1,5}/g); 
    return groups.join('-'); 
}
async function handlePushDownloadToken(req, res) {
    const { key, modal } = req.body;

    if (!key || !modal) {
        return res.status(400).send({
            code: 400,
            msg: '请求参数错误'
        });
    }

    let resource;

    try {
        const collectionName = modal === 'public' ? 'publicResources'
            : modal === 'token' ? 'tokenResources'
                : null;

        if (!collectionName) {
            return res.status(400).send({
                code: 400,
                msg: '请求参数错误'
            });
        }

        const collection = mongoose.connection.db.collection(collectionName);
        const query = modal === 'public' ? { filekey: key } : { token: key };
        const result = await collection.findOne(query);

        if (!result) {
            return res.status(404).send({
                code: 404,
                msg: '资源不存在'
            });
        }

        resource = result;
    } catch (err) {
        console.error("[下载文件] - 资源查询失败:", err);
        return res.status(500).send({
            code: 500,
            msg: '服务器错误'
        });
    }

    const fileName = resource.fileName;

    const token = generateDownloadToken();
    DOWNLOAD_TOKENS[token] = {
        fileName,
        modal,
        expires: Date.now() + 60 * 1000 // 1分钟有效
    };

    console.log(`[下载文件] - 请求下载, 返回令牌 ${token}`);
    res.send({
        code: 200,
        msg: '成功',
        data: {
            token
        }
    });
}

// 下载器
async function handleDownload(req, res) {
    const downloadToken = req.query.token;
    const title = req.query.title || 'file';

    if (!downloadToken) {
        return res.status(401).send({ code: 401, msg: '请求参数缺失' });
    }

    if (!DOWNLOAD_TOKENS[downloadToken]) {
        return res.status(401).send({ code: 401, msg: '下载链接不存在' });
    }

    const tokenData = DOWNLOAD_TOKENS[downloadToken];
    if (Date.now() > tokenData.expires) {
        delete DOWNLOAD_TOKENS[downloadToken];
        console.log(`[下载文件] - 验证令牌 ${downloadToken} 失败, 该令牌已失效被清理`);
        return res.status(401).send({ code: 401, msg: '下载链接已失效' });
    }

    const fileName = tokenData.fileName;
    const fileExt = path.extname(fileName);
    const newFileName = title + fileExt;

    let file;
    try {
        file = await objectGet(fileName);
    } catch (err) {
        return res.status(404).send({ code: 404, msg: '文件不存在' });
    }

    console.log(`[下载文件] - 验证令牌 ${downloadToken} 成功`);
    delete DOWNLOAD_TOKENS[downloadToken];
    
    res.set('Content-Type', mime.lookup(fileName) || 'application/octet-stream');
    res.set('Content-Disposition', `attachment; filename="${encodeURIComponent(newFileName)}"`);
    res.send(file);
}

module.exports = {
    getResources,
    getTokenResource,
    getResourceNum,
    handlePushDownloadToken,
    handleDownload,
}