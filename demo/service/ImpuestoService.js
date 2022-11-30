import getConfig from 'next/config';

let url = 'http://localhost:8080/api/v1/impuestos';

export class ImpuestoService {
    constructor() {
        this.contextPath = getConfig().publicRuntimeConfig.contextPath;
    }

    async getImpuestos() {
        const response = await fetch(url);
        return await response.json();
    }

    async removeImpuesto(id) {
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

    async addImpuesto(impuesto) {
        try {
            let url_ = url + '/addImpuesto';
            const response = await fetch(url_, {
                "method": 'POST',
                "body": JSON.stringify(impuesto),
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

    async updateImpuesto(impuesto) {
        try {
            const response = await fetch(url, {
                "method":'PUT',
                "body": JSON.stringify(impuesto),
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