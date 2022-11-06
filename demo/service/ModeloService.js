import getConfig from 'next/config';

let url = 'http://localhost:8080/api/v1/modelos';

export class ModeloService {
    constructor() {
        this.contextPath = getConfig().publicRuntimeConfig.contextPath;
    }

    async getModelos() {
        const response = await fetch(url);
        return await response.json();
    }

    async removeModelo(id) {
        let url_ = url + '/delete/' + id;
        const response = await fetch(url_, {
            "method": 'DELETE',
            "headers": {
                "Content-type": 'application/json'
            }
        }); 
    }

    async addModelo(modelo) {
        try {
            let url_ = url + '/addModelo';
            const response = await fetch(url_, {
                "method": 'POST',
                "body": JSON.stringify(modelo),
                "headers": {
                    "Content-type": 'application/json'
                }
            });
            const result = await response.json();
            if(response.status !== 201)throw result;
        } catch (error) {
            throw error;
        }
    }

    async updateModelo(modelo) {
        try {
            const response = await fetch(url, {
                "method":'PUT',
                "body": JSON.stringify(modelo),
                "headers": {
                    "Content-type": 'application/json'
                }
            });
            const result = await response.json();
            if(response.status !== 200)throw result;
        } catch (error) {
            throw error;
        }
    }
}