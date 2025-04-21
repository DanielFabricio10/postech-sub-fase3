const crypto = require('crypto');

class User {

    constructor({ cpf_cnpj, nome, email, idade, senha }) {
        this.dataCadastro = new Date().toISOString(); 
        this.cpf_cnpj = cpf_cnpj;
        this.nome = nome;
        this.email = email;

        const dataNascimento = new Date(idade);
        this.idade = dataNascimento.toISOString().split('T')[0];

        this.senha = crypto.createHash('md5').update(senha).digest('hex');
    }
    
    static validateUserDataType(userData) {
        if(!userData.dados_cliente) {
            if(!userData.email || typeof userData.email !== 'string') {
                return { valid: false, message: 'Campo email é obrigatório' };
            }
            if(!userData.senha || typeof userData.senha !== 'string') {
                return { valid: false, message: 'Campo senha é obrigatório' };
            }
            
            return { valid: true, login: true, message: '' };
        } else {
            if(!userData.dados_cliente.cpf_cnpj || typeof userData.dados_cliente.cpf_cnpj !== 'string') {
                return { valid: false, message: 'Campo cpf_cnpj é obrigatório' };
            }
            if(!userData.dados_cliente.nome || typeof userData.dados_cliente.nome !== 'string') {
                return { valid: false, message: 'Campo nome é obrigatório' };
            }
            if(!userData.dados_cliente.email || typeof userData.dados_cliente.email !== 'string') {
                return { valid: false, message: 'Campo email é obrigatório' };
            }
            if(!userData.dados_cliente.idade || typeof userData.dados_cliente.idade !== 'string') {
                return { valid: false, message: 'Campo idade é obrigatório' };
            }
            if(!userData.dados_cliente.senha || typeof userData.dados_cliente.senha !== 'string') {
                return { valid: false, message: 'Campo senha é obrigatório' };
            }

            return { valid: true, login: false, message: '' };
        }    
    }
}

module.exports = User;