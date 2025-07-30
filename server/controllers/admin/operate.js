// 管理员操作

const cryptoJs = require('crypto-js');
const mime = require('mime-types');
const { mongoose } = require('../../utils/db_connect');
const { objectUpload, objectDelete } = require('../../utils/os_connect');
const jwt = require('jsonwebtoken');

const ObjectId = mongoose.Types.ObjectId;
const SECRET_KEY = process.env.SECRET_KEY;

const env = (process.env.ENV || '').trim().toLowerCase();
const needVerify = env === 'development' ? false : true;

const db = mongoose.connection

// 校验登录状态
async function isLoggedIn(req) {
    if (!needVerify) return true;

    const token = req.cookies?.logintoken;
    if (!token) {
        return false;
    }
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const now = Math.floor(Date.now() / 1000);
        const exp = decoded.exp;
        return exp > now;
    } catch {
        return false;
    }
}

// 标签操作
async function labelsOperate(req, res) {
    loginStatus = await isLoggedIn(req);
    if (!loginStatus && needVerify) {
        return res.status(401).json({
            code: 401,
            message: '请先登录',
        });
    }

    const data = req.body.data;
    const type = req.body.type;

    // 执行操作
    try {
        const logAndRespond = (success, type, successMsg, failMsg) => {
            if (success) {
                console.log(`[管理员操作] - 标签: ${type} 成功`);
                return res.status(200).json({ code: 200, message: successMsg });
            } else {
                console.log(`[管理员操作] - 标签: ${type} 失败`);
                return res.status(500).json({ code: 500, message: failMsg });
            }
        };

        switch (type) {
            case 'add': {
                const result = await db.collection('labels').insertOne(data);
                return logAndRespond(
                    result.acknowledged && result.insertedId,
                    req.body.type,
                    '添加标签组成功',
                    '添加标签组失败'
                );
            }
            case 'delete': {
                const id = new ObjectId(String(data._id));
                const result = await db.collection('labels').deleteOne({ _id: id });
                return logAndRespond(
                    result.acknowledged && result.deletedCount > 0,
                    req.body.type,
                    '删除标签组成功',
                    '删除标签组失败'
                );
            }
            case 'edit': {
                const id = new ObjectId(String(data._id));
                const updateData = { ...data };
                delete updateData._id;
                const result = await db.collection('labels').updateOne({ _id: id }, { $set: updateData });
                return logAndRespond(
                    result.acknowledged && result.modifiedCount > 0,
                    req.body.type,
                    '修改标签组成功',
                    '修改标签组失败'
                );
            }
            default:
                return res.status(400).json({ code: 400, message: '无效操作类型' });
        }
    } catch (error) {
        console.error('[后台] - 标签操作异常', error);
        return res.status(500).json({ code: 500, message: '服务器错误' });
    }
}

// 获取私密资源
async function getTokenResource(req, res) {
    loginStatus = await isLoggedIn(req);
    if (!loginStatus && needVerify) {
        return res.status(401).json({
            code: 401,
            message: '请先登录',
        });
    }

    // 获取私密资源
    try {
        const result = await db.collection('tokenResources').find().toArray();
        console.log(`[管理员操作] - 请求获取私密资源: 成功`);

        // 排除fileName
        const returnData = result.map((item) => {
            const { fileName, ...rest } = item;
            return rest;
        })
        return res.status(200).json({ code: 200, message: '获取私密资源成功', data: returnData });
    } catch (error) {
        console.error('[管理员操作] - 请求获取私密资源: 失败 ', error);
        return res.status(500).json({ code: 500, message: '服务器错误' });
    }
}

// 公共资源上传
async function publicResourceUpload(req, res) {
    const loginStatus = await isLoggedIn(req);
    if (!loginStatus && needVerify) {
        return res.status(401).json({
            code: 401,
            message: '请先登录',
        });
    }

    if (!req.body.meta || !req.file) {
        return res.status(400).json({ code: 400, message: '无效请求' });
    }

    const logAndRespond = (success, successMsg, failMsg, filekey) => {
        if (success) {
            console.log(`[管理员操作] - 公共资源 ${filekey ? filekey : ''} 上传成功`);
            return res.status(200).json({ code: 200, message: successMsg });
        } else {
            console.log(`[管理员操作] - 公共资源上传失败`);
            return res.status(500).json({ code: 500, message: failMsg });
        }
    };

    try {        
        const data = JSON.parse(req.body.meta);

        // 从 multer 解析的文件里拿 buffer
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ code: 400, message: '未接收到文件内容' });
        }
        const fileBuffer = req.file.buffer;
        const fileMime = req.file.mimetype;
        // console.log(fileMime)
        const fileExt = mime.extension(fileMime) || 'bin'

        const { title, desc, tags, time, size } = data;

        // 生成 filekey
        const now = new Date();
        const tagToString = tags.join('');
        const random = Math.random().toString(36).substring(2, 15);
        const filekey = cryptoJs.MD5('public' + tagToString + now + size + desc + time + title + random).toString();
        const os_key = cryptoJs.MD5(filekey + SECRET_KEY).toString();
        const fileKeyName = `${os_key}.${fileExt}`

        // 组装数据库数据
        const latestData = {
            title,
            desc,
            tags,
            time,
            size,
            filekey,
            fileName: fileKeyName,
        };

        const start = new Date().getTime();
        // 上传对象存储，第二个参数传入 buffer
        const uploadResult = await objectUpload(fileKeyName, fileBuffer, fileMime);
        if (!uploadResult) {
            return logAndRespond(false, '添加公共资源失败', '添加公共资源失败');
        }
        const end = new Date().getTime();
        const resumeTime = ( end - start ) / 1000;
        console.log(`[管理员操作] - 文件 ${filekey} 已保存, 耗时: ${resumeTime}s`);

        const result = await db.collection('publicResources').insertOne(latestData);
        return logAndRespond(
            result.acknowledged && result.insertedId,
            '添加公共资源成功',
            '添加公共资源失败',
            filekey
        );
    } catch (error) {
        console.error('[后台] - 公共资源操作异常', error);
        return res.status(500).json({ code: 500, message: '服务器错误' });
    }
}

// 公共资源删除
async function publicResourceDelete(req, res) {
    const loginStatus = await isLoggedIn(req);
    if (!loginStatus && needVerify) {
        return res.status(401).json({
            code: 401,
            message: '请先登录',
        });
    }

    if(!req.body || !req.body.key ) {
        return res.status(400).json({ code: 400, message: '无效请求' });
    }

    try {
        const { key } = req.body;
        
        // 查找资源
        const result = await db.collection('publicResources').findOne({ _id: new ObjectId(key) });
        if (!result) {
            return res.status(400).json({ code: 400, message: '该资源不存在' });
        }

        // 拿到资源的 fileName 
        const fileName = result.fileName;
        const fileKey = result.filekey;
        if (!fileName) {
            return res.status(400).json({ code: 400, message: '资源本体出现错误' });
        }

        // 删除对象存储
        const deleteResult = await objectDelete(fileName);
        if (!deleteResult) {
            console.error(`[管理员操作] - 删除资源 ${fileKey} 失败`);
            return res.status(500).json({ code: 500, message: '删除资源失败' });
        }

        // 删除数据库
        const deleteDBResult = await db.collection('publicResources').deleteOne({ _id: new ObjectId(key) });
        if (!deleteDBResult.acknowledged) {
            console.error(`[管理员操作] - 删除资源 ${fileKey} 失败`);
            return res.status(500).json({ code: 500, message: '删除资源失败' });
        }

        console.log(`[管理员操作] - 删除资源 ${fileKey} 成功`);
        return res.status(200).json({ code: 200, message: '删除资源成功' });
    }catch (error) {
        console.error('[后台] - 公共资源删除异常', error);
        return res.status(500).json({ code: 500, message: '服务器错误' });
    }
}

// 公共资源编辑
async function publicResourceUpdate(req, res) {
    const loginStatus = await isLoggedIn(req);
    if (!loginStatus && needVerify) {
        return res.status(401).json({
            code: 401,
            message: '请先登录',
        });
    }

    if(!req.body || !req.body.title || !req.body.desc || !req.body.tags) {
        return res.status(400).json({ code: 400, message: '无效请求' });
    }

    try {
        const { title, desc, tags, key } = req.body;

        // 查找资源
        const result = await db.collection('publicResources').findOne({ _id: new ObjectId(key) });
        if (!result) {
            return res.status(400).json({ code: 400, message: '该资源不存在' });
        }

        // 拿到该资源的全部信息
        const or_time = result.time;
        const or_size = result.size;
        const or_filekey = result.filekey;
        const or_fileName = result.fileName;

        if(!or_filekey || !or_fileName || !or_size || !or_time) {
            console.error(`[管理员操作] - 编辑资源: ${or_filekey} 失败`);
            return res.status(400).json({ code: 400, message: '资源本体出现错误' });
        }

        // 组装数据库数据
        const latestData = {
            title: title,
            desc: desc,
            tags: tags,
            time: or_time,
            size: or_size,
            filekey: or_filekey,
            fileName: or_fileName,
        }

        // 更新数据库
        const updateResult = await db.collection('publicResources').updateOne({ _id: new ObjectId(key) }, { $set: latestData });
        if (!updateResult.acknowledged) {
            console.error(`[管理员操作] - 编辑资源: ${or_filekey} 失败`);
        }
        console.log(`[管理员操作] - 编辑资源: ${or_filekey} 成功`);
        return res.status(200).json({ code: 200, message: '编辑资源成功' });
    }catch (error) {
        console.error('[后台] - 公共资源编辑异常', error);
    }
}

// 私密资源上传
function generatePrivateResourceToken(Object) {
    if (!Object || !Object.filekey || !Object.time || !Object.timeout) {
        return false
    }
    
    const char = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const token = `${Object.filekey}-${Object.time}-${Object.timeout}`;
    const random = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const hash = cryptoJs.MD5(new Date().getTime() + token + random).toString();

    let result = '';
    // 哈希插值映射 hash > char > result
    for (let i = 0; i < 8; i++) {
        const byteHex = hash.substr(i * 4, 4);
        const num = parseInt(byteHex, 16);
        result += char[num % char.length];
    }

    return result;

}
async function tokenResourceUpload(req, res) {
    const loginStatus = await isLoggedIn(req);
    if (!loginStatus && needVerify) {
        return res.status(401).json({
            code: 401,
            message: '请先登录',
        });
    }

    if (!req.body.meta || !req.file) {
        return res.status(400).json({ code: 400, message: '无效请求' });
    }

    const logAndRespond = (success, successMsg, failMsg, filekey, token) => {
        if (success) {
            console.log(`[管理员操作] - 私密资源 ${filekey ? filekey : ''} 上传成功, 提取码: ${token ? token : ''}`);
            return res.status(200).json({ code: 200, message: successMsg });
        } else {
            console.log(`[管理员操作] - 私密资源上传失败`);
            return res.status(500).json({ code: 500, message: failMsg });
        }
    };

    try {
        const data = JSON.parse(req.body.meta);

        // 从 multer 解析的文件里拿 buffer
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ code: 400, message: '未接收到文件内容' });
        }
        const fileBuffer = req.file.buffer;
        const fileMime = req.file.mimetype;
        // console.log(fileMime)
        const fileExt = mime.extension(fileMime) || 'bin'

        const { title, desc, tags, time, timeout, size } = data;

        // 生成 filekey
        const now = new Date();
        const tagToString = tags.join('');
        const random = Math.random().toString(36).substring(2, 15);
        const filekey = cryptoJs.MD5('token' + tagToString + now + size + timeout + desc + time + title + random).toString();
        const os_key = cryptoJs.MD5(filekey + SECRET_KEY).toString();
        const fileKeyName = `${os_key}.${fileExt}`

        const reqTokenData = {
            time,
            timeout,
            filekey,
        }
        const token = generatePrivateResourceToken(reqTokenData);
        if (!token) {
            return logAndRespond(false, '私密令牌生成失败', '私密令牌生成失败');
        }

        // 组装数据库数据
        const latestData = {
            title,
            desc,
            tags,
            time,
            timeout,
            size,
            token,
            filekey,
            fileName: fileKeyName,
        };

        const start = new Date().getTime();
        // 上传对象存储，第二个参数传入 buffer
        const uploadResult = await objectUpload(fileKeyName, fileBuffer, fileMime);
        if (!uploadResult) {
            return logAndRespond(false, '添加私密资源失败', '添加私密资源失败');
        }
        const end = new Date().getTime();
        const resumeTime = (end - start) / 1000;
        console.log(`[管理员操作] - 文件 ${filekey} 已保存, 耗时: ${resumeTime}s`);

        const result = await db.collection('tokenResources').insertOne(latestData);
        return logAndRespond(
            result.acknowledged && result.insertedId,
            '添加私密资源成功',
            '添加私密资源失败',
            filekey,
            token
        );
    } catch (error) {
        console.error('[后台] - 私密资源操作异常', error);
        return res.status(500).json({ code: 500, message: '服务器错误' });
    }
}

// 私密资源删除
async function tokenResourceDelete(req, res) {
    const loginStatus = await isLoggedIn(req);
    if (!loginStatus && needVerify) {
        return res.status(401).json({
            code: 401,
            message: '请先登录',
        });
    }

    if (!req.body || !req.body.key) {
        return res.status(400).json({ code: 400, message: '无效请求' });
    }

    try {
        const { key } = req.body;

        // 查找资源
        const result = await db.collection('tokenResources').findOne({ _id: new ObjectId(key) });
        if (!result) {
            return res.status(400).json({ code: 400, message: '该资源不存在' });
        }

        // 拿到资源的 fileName 
        const fileName = result.fileName;
        const fileKey = result.filekey;
        if (!fileName) {
            return res.status(400).json({ code: 400, message: '资源本体出现错误' });
        }

        // 删除对象存储
        const deleteResult = await objectDelete(fileName);
        if (!deleteResult) {
            console.error(`[管理员操作] - 删除资源 ${fileKey} 失败`);
            return res.status(500).json({ code: 500, message: '删除资源失败' });
        }

        // 删除数据库
        const deleteDBResult = await db.collection('tokenResources').deleteOne({ _id: new ObjectId(key) });
        if (!deleteDBResult.acknowledged) {
            console.error(`[管理员操作] - 删除资源 ${fileKey} 失败`);
            return res.status(500).json({ code: 500, message: '删除资源失败' });
        }

        console.log(`[管理员操作] - 删除资源 ${fileKey} 成功`);
        return res.status(200).json({ code: 200, message: '删除资源成功' });
    } catch (error) {
        console.error('[后台] - 私密资源删除异常', error);
        return res.status(500).json({ code: 500, message: '服务器错误' });
    }
}

// 私密资源编辑
async function tokenResourceUpdate(req, res) {
    const loginStatus = await isLoggedIn(req);
    if (!loginStatus && needVerify) {
        return res.status(401).json({
            code: 401,
            message: '请先登录',
        });
    }

    if (!req.body || !req.body.title || !req.body.desc || !req.body.tags) {
        return res.status(400).json({ code: 400, message: '无效请求' });
    }

    try {
        const { title, desc, tags, key, timeout } = req.body;

        // 查找资源
        const result = await db.collection('tokenResources').findOne({ _id: new ObjectId(key) });
        if (!result) {
            return res.status(400).json({ code: 400, message: '该资源不存在' });
        }

        // 拿到该资源的全部信息
        const or_time = result.time;
        const or_token = result.token;
        const or_size = result.size;
        const or_filekey = result.filekey;
        const or_fileName = result.fileName;

        if (!or_filekey || !or_fileName || !or_size || !or_time || !or_token) {
            console.error(`[管理员操作] - 编辑资源: ${or_filekey} 失败`);
            return res.status(400).json({ code: 400, message: '资源本体出现错误' });
        }

        // 组装数据库数据
        const latestData = {
            title: title,
            desc: desc,
            tags: tags,
            time: or_time,
            timeout: timeout,
            size: or_size,
            token: or_token,
            filekey: or_filekey,
            fileName: or_fileName,
        }

        // 更新数据库
        const updateResult = await db.collection('tokenResources').updateOne({ _id: new ObjectId(key) }, { $set: latestData });
        if (!updateResult.acknowledged) {
            console.error(`[管理员操作] - 编辑资源: ${or_filekey} 失败`);
        }
        console.log(`[管理员操作] - 编辑资源: ${or_filekey} 成功`);
        return res.status(200).json({ code: 200, message: '编辑资源成功' });
    } catch (error) {
        console.error('[后台] - 私密资源编辑异常', error);
    }
}

module.exports = {
    labelsOperate,
    getTokenResource,
    publicResourceUpload,
    publicResourceDelete,
    publicResourceUpdate,

    tokenResourceUpload,
    tokenResourceDelete,
    tokenResourceUpdate,
}