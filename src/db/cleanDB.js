const MongoDBClient = require('MongoClient');
const mongoClient = new MongoDBClient();

async function cleanDb() {
    await mongoClient.connect();

    await mongoClient.deleteMany('vehicles', {});
    await mongoClient.deleteMany('users', {});
    await mongoClient.deleteMany('sales', {});
    await mongoClient.deleteMany('users_token', {});

    await mongoClient.disconnect();
}

cleanDb();