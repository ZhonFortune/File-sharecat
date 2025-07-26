// 管理员操作

const { mongoose } = require('../../utils/db_connect');
const jwt = require('jsonwebtoken');

const ObjectId = mongoose.Types.ObjectId;
const SECRET_KEY = process.env.SECRET_KEY;

const env = (process.env.ENV || '').trim().toLowerCase();
const needVerify = env === 'development' ? false : true;

const db = mongoose.connection

// 校验登录状态
async function isLoggedIn(req) {
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
    let loginStatus = false;
    if (needVerify) {
        loginStatus = await isLoggedIn(req);
    }

    console.log(`[管理员操作] - 添加标签组,需要登陆验证 ${needVerify}, 登录状态 ${loginStatus}`)

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
        if (type === 'add') {
            const result = await db.collection('labels').insertOne(data);
            if (result.acknowledged && result.insertedId) {
                return res.status(200).json({ code: 200, message: '添加标签组成功' });
            } else {
                return res.status(500).json({ code: 500, message: '添加标签组失败' });
            }
        }

        if (type === 'delete') {
            const id = new ObjectId(String(data._id));
            const result = await db.collection('labels').deleteOne({ _id: id });
            if (result.acknowledged && result.deletedCount > 0) {
                return res.status(200).json({ code: 200, message: '删除标签组成功' });
            } else {
                return res.status(500).json({ code: 500, message: '删除标签组失败' });
            }
        }

        if (type === 'edit') {
            const id = new ObjectId(String(data._id));
            const updateData = { ...data };
            delete updateData._id;
            const result = await db.collection('labels').updateOne({ _id: id }, { $set: updateData });
            if (result.acknowledged && result.modifiedCount > 0) {
                return res.status(200).json({ code: 200, message: '修改标签组成功' });
            } else {
                return res.status(500).json({ code: 500, message: '修改标签组失败' });
            }
        }

        return res.status(400).json({ code: 400, message: '无效操作类型' });
    } catch (error) {
        console.error('后台标签操作异常', error);
        return res.status(500).json({ code: 500, message: '服务器错误' });
    }
}

// 获取私密资源
async function getTokenResource(req, res) {
    let loginStatus = false;
    if (needVerify) {
        loginStatus = await isLoggedIn(req);
    }

    console.log(`[管理员操作] - 获取私密资源,需要登陆验证 ${needVerify}, 登录状态 ${loginStatus}`)
    if (!loginStatus && needVerify) {
        return res.status(401).json({
            code: 401,
            message: '请先登录',
        });
    }

    // 获取私密资源
    try{
        const result = await db.collection('tokenResources').find().toArray();
        return res.status(200).json({ code: 200, message: '获取私密资源成功', data: result });
    }catch (error) {
        console.error('[管理员操作] - 获取私密资源异常', error);
        return res.status(500).json({ code: 500, message: '服务器错误' });
    }
}

module.exports = {
    labelsOperate,
    getTokenResource,
}