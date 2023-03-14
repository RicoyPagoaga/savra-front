import getConfig from 'next/config';

let url = 'http://localhost:8080/api/v1/modulo';

export class ModuloService {
    constructor() {
        this.contextPath = getConfig().publicRuntimeConfig.contextPath;
    }

    async getModulos() {
        const response = await fetch(url);
        return await response.json();
    }

    async removeModulo(id) {
        try {
            let url_ = url + '/delete/' + id;
            const response = await fetch(url_, {
                "method": 'DELETE',
                "headers": {
                    "Content-type": 'application/json'
                }
            }); 
            if (response.status == 500) throw 'No es posible eliminar el registro, se encuentra en uso';
        } catch (error) {
            throw error;
        }
    }

    async addModulo(modulo) {
        try {
            let url_ = url + '/addModulo';
            const response = await fetch(url_, {
                "method": 'POST',
                "body": JSON.stringify(modulo),
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

    async updateModulo(modulo) {
        try {
            const response = await fetch(url, {
                "method":'PUT',
                "body": JSON.stringify(modulo),
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