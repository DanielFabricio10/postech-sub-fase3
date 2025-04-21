const MongoDBClient = require('../db/MongoClient');
const mongoClient = new MongoDBClient();

async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token não fornecido.' });
    }

    const token = authHeader.split(' ')[1];
    await mongoClient.connect();

    try {
        const result = await mongoClient.executeQuery('users_token', { token });

        if(!result || result.length === 0) {
            await mongoClient.disconnect();
            return res.status(401).json({ message: 'Token inválido.' });
        }

        const tokenData = result[0];
        const expireDate = new Date(tokenData.expire);
        const now = new Date();

        if(expireDate < now) {
            await mongoClient.disconnect();
            return res.status(401).json({ message: 'Token expirado.' });
        }
        
        req.cpf_cnpj = tokenData.cpf_cnpj;
        req.token = token;

        await mongoClient.disconnect();
        next();

    } catch (error) {
        await mongoClient.disconnect();
        return res.status(500).json({ message: 'Erro na validação do token.', error: error.message });
    }
}

module.exports = authMiddleware;