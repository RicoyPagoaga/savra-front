import getConfig from 'next/config';

let url = 'http://localhost:8080/api/v1/compra_detalle';

export class CompraDetalleService {
    constructor() {
        this.contextPath = getConfig().publicRuntimeConfig.contextPath;
    }

    async getDetallesCompra() {
        const response = await fetch(url);
        return await response.json();
    }

    async removeDetalleCompra(id) {
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

    async addDetalleCompra(detalle) {
        try {
            let url_ = url + '/addCompraDetalle';
            const response = await fetch(url_, {
                "method": 'POST',
                "body": JSON.stringify(detalle),
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

    async addDetallesCompra(detalles) {
        try {
            let url_ = url + '/addComprasDetalle';
            const response = await fetch(url_, {
                "method": 'POST',
                "body": JSON.stringify(detalles),
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

    async updateDetallesCompra(detalles) {
        try {
            let url_ = url + '/updateComprasDetalle';
            const response = await fetch(url_, {
                "method": 'PUT',
                "body": JSON.stringify(detalles),
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

    async updateDetalleCompra(detalle) {
        try {
            const response = await fetch(url, {
                "method":'PUT',
                "body": JSON.stringify(detalle),
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