import getConfig from 'next/config';

let url='http://localhost:8080/api/v1/facturas';

export class FacturaService{
    constructor() {
        this.contextPath = getConfig().publicRuntimeConfig.contextPath;
    }

    async getFacturas(){
        const response = await fetch(url);
        return await response.json();
    }
    
    async getRecibo(id){
        const response = await fetch(url+'/idFactura/'+id);
        return await response.json();
    }

    async getReciboByNoFactura(noFactura){
        const response = await fetch(url+'/noFactura/'+noFactura);
        return await response.json();
    }
    // async removeFactura(id){
    //     let url_ = url + '/delete/' + id;
    //     const response = await fetch(url_,{
    //         "method": 'DELETE',
    //         "headers": {
    //             "Content-type": 'application/json'
    //         }
    //     });
    //     if (response.status == 500) throw 'No es posible eliminar el registro, se encuentra en uso';
    // }

    async addFactura(factura,detalles,total){
        try {
            let url_ = url + '/addFactura/detalles/'+detalles+'/total/'+total;
            const response = await fetch(url_,{
            "method": 'POST',
            "body": JSON.stringify(factura),
            "headers": {
                "Content-type": 'application/json'
                }
            });
            const result = await response.json();
            console.log(result);
            if(response.status !== 201)throw result;
            return result;
        } catch (error) {
            throw error;
        }
        
    }

    // async updateFactura(Factura){
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