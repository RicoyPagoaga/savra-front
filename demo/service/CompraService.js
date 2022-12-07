import getConfig from 'next/config';

let url = 'http://localhost:8080/api/v1/compras';

export class CompraService {
    constructor() {
        this.contextPath = getConfig().publicRuntimeConfig.contextPath;
    }

    async getCompras() {
        const response = await fetch(url);
        return await response.json();
    }

    async removeCompra(id) {
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

    async addCompra(compra, detalle) {
        try {
            let url_ = url + '/addCompra/' + detalle;
            const response = await fetch(url_, {
                "method": 'POST',
                "body": JSON.stringify(compra),
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

    async updateCompra(compra, detalle) {
        try {
            let url_ = url + '/' + detalle;
            const response = await fetch(url_, {
                "method":'PUT',
                "body": JSON.stringify(compra),
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