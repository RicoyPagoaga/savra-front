import getConfig from 'next/config';

let url = 'http://localhost:8080/api/v1/facturaDetalles';

export class FacturaDetalleService {
    constructor() {
        this.contextPath = getConfig().publicRuntimeConfig.contextPath;
    }

    async getFacturaDetalles() {
        const response = await fetch(url);
        return await response.json();
    }
    async getFacturaDetallesByIdFactura(id) {
        let url_ = url + '/idFactura/' + id;
        const response = await fetch(url_, {
            "method": 'GET',
            "headers": {
                "Content-type": 'application/json'
            }
        });
        //if (response.status != 200) throw 'No es posible eliminar el registro, se encuentra en uso';
        return await response.json();
    }
    // async removeFacturaDetalle(id){
    //     let url_ = url + '/delete/' + id;
    //     const response = await fetch(url_,{
    //         "method": 'DELETE',
    //         "headers": {
    //             "Content-type": 'application/json'
    //         }
    //     });
    //     if (response.status == 500) throw 'No es posible eliminar el registro, se encuentra en uso';
    // }

    async addFacturaDetalle(facturaDetalle) {
        try {
            let url_ = url + '/addFacturaDetalle';
            const response = await fetch(url_, {
                "method": 'POST',
                "body": JSON.stringify(facturaDetalle),
                "headers": {
                    "Content-type": 'application/json'
                }
            });
            const result = await response.json();
            if (response.status !== 201) throw result;
        } catch (error) {
            throw error;
        }

    }
    async addFacturaDetalles(facturaDetalles) {
        try {
            let url_ = url + '/addFacturaDetalles';
            const response = await fetch(url_, {
                "method": 'POST',
                "body": JSON.stringify(facturaDetalles),
                "headers": {
                    "Content-type": 'application/json'
                }
            });
            const result = await response.json();
            if (response.status !== 201) throw result;
        } catch (error) {
            throw error;
        }

    }

    // async updateFacturaDetalle(facturaDetalle){
    //     try {
    //         const response = await fetch(url,{
    //         "method": 'PUT',
    //         "body": JSON.stringify(Factura),
    //         "headers": {
    //             "Content-type": 'application/json'
    //         }
    //     });
    //     const result = await response.json();
    //     if(response.status !== 200)throw result;
    //     } catch (error) {
    //         throw error;
    //     }
    // }
}