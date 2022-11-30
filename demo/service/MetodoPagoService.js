import getConfig from 'next/config';

let url = 'http://localhost:8080/api/v1/metodos_pago';

export class MetodoPagoService {
    constructor() {
        this.contextPath = getConfig().publicRuntimeConfig.contextPath;
    }

    async getMetodosPago() {
        const response = await fetch(url);
        return await response.json();
    }

    async removeMetodoPago(id) {
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

    async addMetodoPago(metodo) {
        try {
            let url_ = url + '/addMetodoPago';
            const response = await fetch(url_, {
                "method": 'POST',
                "body": JSON.stringify(metodo),
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

    async updateMetodoPago(metodo) {
        try {
            const response = await fetch(url, {
                "method":'PUT',
                "body": JSON.stringify(metodo),
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