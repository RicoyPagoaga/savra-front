import getConfig from 'next/config';

let url = 'http://localhost:8080/api/v1/precios_repuesto';

export class PrecioHistoricoRepuestoService {
    constructor() {
        this.contextPath = getConfig().publicRuntimeConfig.contextPath;
    }

    async getPreciosHistorico() {
        const response = await fetch(url);
        return await response.json();
    }

    async removePrecioHistorico(id) {
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

    async addPrecioHistorico(precioHistorico) {
        try {
            let url_ = url + '/addPrecioHistoricoRepuesto';
            const response = await fetch(url_, {
                "method": 'POST',
                "body": JSON.stringify(precioHistorico),
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

    async updatePrecioHistorico(precioHistorico) {
        try {
            const response = await fetch(url, {
                "method":'PUT',
                "body": JSON.stringify(precioHistorico),
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