import getConfig from 'next/config';


let url='http://localhost:8080/api/v1/cargos';

export class CargoService{
    constructor() {
        this.contextPath = getConfig().publicRuntimeConfig.contextPath;
    }

    async getCargos(){
        const response = await fetch(url);
        return await response.json();
    }
    
    async removeCargo(id){
        try {
            let _url = url + '/delete/' + id;
            const response = await fetch(_url ,{
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

    async addCargo(cargo){
        try {
            let url_ = url + '/addCargo';
            const response = await fetch(url_,{
            "method": 'POST',
            "body": JSON.stringify(cargo),
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

    async updateCargo(cargo){
        try {
            const response = await fetch(url,{
            "method": 'PUT',
            "body": JSON.stringify(cargo),
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