// 数据库连接
const mongoose = require('mongoose');
const env = (process.env.ENV || '').trim().toLowerCase();
const MONGO_URI = `${process.env.MONGO_URI}/${env === 'development' ? 'File-sharecat-dev' : 'File-sharecat'}`
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

let isConnected = false;

async function checkDBcollection() {
    try {
        const collectionNames = await mongoose.connection.db.listCollections().toArray();
        const existingCollections = new Set(collectionNames.map(c => c.name));

        const collectionsToCreate = ['publicResources', 'tokenResources', 'labels']
            .filter(name => !existingCollections.has(name));

        if (collectionsToCreate.length === 0) {
            return;
        }

        await Promise.all(collectionsToCreate.map(async (name) => {
            try {
                await mongoose.connection.db.createCollection(name);
            } catch (err) {
                console.error(`数据库初始化失败`);
                throw err;
            }
        }));
    } catch (err) {
        throw err;
    }
}

async function dbConnect() {
    if (isConnected) {
        return mongoose;
    }

    try {
        await mongoose.connect(MONGO_URI, clientOptions);
        await mongoose.connection.db.admin().command({ ping: 1 });
        await checkDBcollection();
        isConnected = true;
        return mongoose;
    } catch (err) {
        throw err;
    }
}

module.exports = { dbConnect, mongoose, checkDBcollection };
