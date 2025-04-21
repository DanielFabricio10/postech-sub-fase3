const userController = require('../src/controllers/UserController');

describe('Cadastro de usuarios', () => {

    beforeAll(async () => {
        await userController.deleteAllUsers({});
    });

    it('deve cadastrar um usuario corretamente', async () => {
        const userData = {
            dados_cliente: {
                cpf_cnpj: "11769472955",
                nome: "Usuario Teste",
                email: "teste@hotmail.com",
                idade: "2000-01-17",
                senha: "*123Mudar"
            }
        };
        
        const user = await userController.validUser(userData);
        expect(user.token).toBeDefined();
    });

    it('deve realizar login do usuario corretamente', async () => {
        const userData = {
            email: "teste@hotmail.com",
            senha: "*123Mudar"
        };
        
        const user = await userController.validUser(userData);
        expect(user.token).toBeDefined();
    });

    it('deve retornar erro ao cadastrar um usuario', async () => {
        const userData = {
            dados_cliente: {
                cpf_cnpj: "11769472955",
                nome: "Usuario Teste",
                email: "teste@hotmail.com",
                idade: "2000-01-17",
                senha: "*123Mudar"
            }
        };
        
        await expect(userController.insertUser(userData)).rejects.toThrow('Já existe um usuario com este email ou cpf/cnpj cadastrado.');
    });

    it('deve retornar erro ao fazer login de um usuario', async () => {
        const userData = {
            email: "teste@hotmail.com",
            senha: "*123SenhaErrada"
        };
        
        await expect(userController.validUser(userData)).rejects.toThrow('Email ou senha inválidos.');
    });
});