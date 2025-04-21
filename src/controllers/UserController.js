const axios = require('axios');
const crypto = require('crypto');

const User = require('../models/User');
const MongoDBClient = require('../db/MongoClient');

const mongoClient = new MongoDBClient();

async function validUser(userData) {
    const validationUser = User.validateUserDataType(userData);

    if(!validationUser.valid) {
        throw new Error(validationUser.message);
    }

    if(!validationUser.login) {
        return insertUser(userData);
    } else {
        return loginUser(userData);
    }
};

async function loginUser(userData) {
    await mongoClient.connect();

    try {
        const senhaMd5 = crypto.createHash('md5').update(userData.senha).digest('hex');

        const user = await mongoClient.executeQuery('users', {
            email: userData.email,
            senha: senhaMd5
        });

        if (!user || user.length === 0) {
            throw new Error('Email ou senha inválidos.');
        }

        const { cpf_cnpj } = user[0];
        const tokenResult = await mongoClient.executeQueryWithSort('users_token', { cpf_cnpj: cpf_cnpj }, { _id: -1 });
        const now = new Date();

        if(tokenResult.length > 0) {
            const lastToken = tokenResult[0];
            const expireDate = new Date(lastToken.expire);

            if(expireDate > now) {
                await mongoClient.disconnect();
                return { token: lastToken.token };
            }
        }

        await mongoClient.deleteMany('users_token', { cpf_cnpj: cpf_cnpj });
        const { token, expires_in } = await generateJwtUser();
        const expireDate = new Date(Date.now() + expires_in * 1000);

        await mongoClient.insertOne('users_token', {
            cpf_cnpj: cpf_cnpj,
            token: token,
            expire: expireDate.toISOString()
        });

        await mongoClient.disconnect();
        return { token };

    } catch (error) {
        await mongoClient.disconnect();
        throw new Error('Erro ao fazer login: ' + error.message);
    }
}

async function insertUser(userData) {
    await mongoClient.connect();

    try {
        existingUser = await mongoClient.executeQuery('users', {
            $or: [
                { cpf_cnpj: userData.dados_cliente.cpf_cnpj },
                { email: userData.dados_cliente.email }
            ]
        });
    } catch (error) {
        await mongoClient.disconnect();
        throw new Error('Erro ao verificar usuario no banco de dados.');
    }
    
    if(existingUser.length > 0) {
        await mongoClient.disconnect();
        throw new Error('Já existe um usuario com este email ou cpf/cnpj cadastrado.');
    }

    newUser = new User(userData.dados_cliente);
    const result = await mongoClient.insertOne('users', newUser);

    if(!result) {
        throw new Error('Erro ao inserir novo usuario no banco de dados');
    }

    const { token, expires_in } = await generateJwtUser();
    const expireDate = new Date(Date.now() + expires_in * 1000);

    await mongoClient.insertOne('users_token', {
        cpf_cnpj: newUser.cpf_cnpj,
        token: token,
        expire: expireDate.toISOString()
    });

    await mongoClient.disconnect();

    return { token };
}

async function generateJwtUser() {
    let response;

    try {
        response = await axios.post('https://dev-84xs2avqqvod1q0t.us.auth0.com/oauth/token', {
            client_id: 'tVyYKRuyE9KSzaW9o9xM3HWgLnADptQK',
            client_secret: '2Mv7iuagC67AUwf15dIZjERlzTaF42fm4zUgqWf3C2cIkzE3BJ-Hot-KCI-Ilz-u',
            audience: 'https://dev-84xs2avqqvod1q0t.us.auth0.com/api/v2/',
            grant_type: 'client_credentials'
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Erro ao gerar token:', error.response?.data || error.message);
        throw new Error('Falha ao gerar JWT');
    }

    return {
        token: response.data.access_token,
        expires_in: response.data.expires_in
    };
}

async function getAllUsers() {
    await mongoClient.connect();

    try {
        const users = await mongoClient.executeQuery('users', {});
        const userDataReturn = [];

        for(const user of users) {
            const tokenResult = await mongoClient.executeQueryWithSort('users_token', { cpf_cnpj: user.cpf_cnpj }, { _id: -1 });
            const token = tokenResult.length > 0 ? tokenResult[0].token : null;

            userDataReturn.push({
                dataCadastro: user.dataCadastro,
                cpf_cnpj: user.cpf_cnpj,
                nome: user.nome,
                email: user.email,
                idade: user.idade,
                senha: user.senha,
                token: token
            });
        }

        await mongoClient.disconnect();
        return userDataReturn;

    } catch (error) {
        await mongoClient.disconnect();
        throw new Error('Erro ao buscar usuários: ' + error.message);
    }
}

async function deleteAllUsers(query) {
    await mongoClient.connect();
    const result = await mongoClient.deleteMany('users', query);
    await mongoClient.disconnect();
    return result;
};

module.exports = { 
    validUser,
    insertUser,
    getAllUsers,
    deleteAllUsers
};