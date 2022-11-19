import getConfig from 'next/config';

let url = 'http://localhost:8080/api/v1/marcas';

export class MarcaService {
    constructor() {
        this.contextPath = getConfig().publicRuntimeConfig.contextPath;
    }

    async getMarcas() {
        const response = await fetch(url);
        return await response.json();
    }

    async removeMarca(id) {
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

    async addMarca(marca) {
        try {
            let url_ = url + '/addMarca';
            const response = await fetch(url_, {
                "method": 'POST',
                "body": JSON.stringify(marca),
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

    async updateMarca(marca) {
        try {
            const response = await fetch(url, {
                "method":'PUT',
                "body": JSON.stringify(marca),
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