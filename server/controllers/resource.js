const { mongoose} = require('../utils/db_connect');

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

module.exports = {
    getResources,
    getTokenResource,
    getResourceNum
}