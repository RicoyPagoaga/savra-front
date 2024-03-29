import getConfig from 'next/config';


let url='http://localhost:8080/api/v1/shippers';

export class ShipperService{
    constructor() {
        this.contextPath = getConfig().publicRuntimeConfig.contextPath;
    }

    async getShippers(){
        const response = await fetch(url);
        return await response.json();
    }
    
    async removeShipper(id){
        try {
            let url = url + '/delete/' + id;
            const response = await fetch(url ,{
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

    async addShipper(shipper){
        try {
            let url_ = url + '/addShipper';
            const response = await fetch(url_,{
            "method": 'POST',
            "body": JSON.stringify(shipper),
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

    async updateShipper(shipper){
        try {
            const response = await fetch(url,{
            "method": 'PUT',
            "body": JSON.stringify(shipper),
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