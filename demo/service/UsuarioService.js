import getConfig from 'next/config';

let url = 'http://localhost:8080/api/v1/usuarios';

export class UsuarioService {
    constructor() {
        this.contextPath = getConfig().publicRuntimeConfig.contextPath;
    }

    async getUsuarios() {
        const response = await fetch(url);
        return await response.json();
    }

    async removeUsuario(id) {
        let url_ = url + '/delete/' + id;
        const response = await fetch(url_, {
            "method": 'DELETE',
            "headers": {
                "Content-type": 'application/json'
            }
        }); 
    }

    async addUsuario(usuario) {
        try {
            let url_ = url + '/addUsuario';
            const response = await fetch(url_, {
                "method": 'POST',
                "body": JSON.stringify(usuario),
                "headers": {
                    "Content-type": 'application/json'
                }
            });
            const result = await response.json();
            if (response.status !== 201)throw result;
        } catch (error) {
            throw error;
        }
    }

    async updateUsuario(usuario) {
        try {
            const response = await fetch(url, {
                "method":'PUT',
                "body": JSON.stringify(usuario),
                "headers": {
                    "Content-type": 'application/json'
                }
            });
            const result = await response.json();
            if (response.status !== 200)throw result;
        } catch (error) {
            throw error;
        }
    }
}