// 对象存储连接
// utils/os_connect.js

const S3 = require("aws-sdk/clients/s3.js")

// 环境变量导入
const ENDPOINT = process.env.OS_ENDPOINT;
const ACCESS_KEY = process.env.OS_ACCESS_KEY;
const SECRET_KEY = process.env.OS_SECRET_KEY;
const BUCKET_NAME = process.env.OS_BUCKET_NAME;
const REGION = process.env.OS_REGION || 'auto';

// 配置 S3 客户端
const s3Client = new S3({
    endpoint: ENDPOINT,
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
    region: REGION,
    signatureVersion: 'v4', // 使用 v4 签名版本
});

// 连接数据库
async function osConnect() {
    try {
        await s3Client.listObjects({ Bucket: BUCKET_NAME }).promise();
    } catch (err) {
        throw err;
    }
}

//上传文件对象数据库
async function objectUpload(fileName, content, contentType) {
    const params = {
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: content,
        contentType: contentType,
    };

    try {
        const result = await s3Client.upload(params).promise();
        return result;
    } catch (err) {
        console.error('[对象存储] - 文件上传失败:', err.message);
        throw err;
    }
}

// 获取文件对象数据库
async function objectGet(fileName) {
    const params = {
        Bucket: BUCKET_NAME,
        Key: fileName,
    };

    try {
        const result = await s3Client.getObject(params).promise();
        return result;
    } catch (err) {
        console.error(`[对象存储] - 文件: ${fileName} 获取失败:`, err.message);
        throw err;
    }
}

// 删除文件对象
async function objectDelete(fileName) {
    const params = {
        Bucket: BUCKET_NAME,
        Key: fileName,
    };

    try {
        const result = await s3Client.deleteObject(params).promise();
        return result;
    } catch (err) {
        console.error(`[对象存储] - 文件: ${fileName} 删除失败:`, err.message);
        throw err;
    }
}

// 导出功能
module.exports = {
    s3Client,
    objectUpload,
    objectGet,
    objectDelete,
    osConnect,
};
