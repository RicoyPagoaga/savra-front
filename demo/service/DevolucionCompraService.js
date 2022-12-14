import getConfig from 'next/config';

let url = 'http://localhost:8080/api/v1/devolucion_compra';

export class DevolucionCompraService {
    constructor() {
        this.contextPath = getConfig().publicRuntimeConfig.contextPath;
    }

    async getDevolucionesCompra() {
        const response = await fetch(url);
        return await response.json();
    }

    async removeDevolucionCompra(id) {
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

    async addDevolucionCompra(devolucion) {
        try {
            let url_ = url + '/addDevolucionCompra';
            const response = await fetch(url_, {
                "method": 'POST',
                "body": JSON.stringify(devolucion),
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

    async addDevolucionesCompra(devoluciones) {
        try {
            let url_ = url + '/addDevolucionesCompra';
            const response = await fetch(url_, {
                "method": 'POST',
                "body": JSON.stringify(devoluciones),
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


    async updateDevolucionCompra(devolucion) {
        try {
            const response = await fetch(url, {
                "method":'PUT',
                "body": JSON.stringify(devolucion),
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