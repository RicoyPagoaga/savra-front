import getConfig from 'next/config';


let url='http://localhost:8080/api/v1/arqueos';

export class ArqueoService{
    constructor() {
        this.contextPath = getConfig().publicRuntimeConfig.contextPath;
    }

    async getArqueos(){
        const response = await fetch(url);
        return await response.json();
    }
    
    async removeArqueo(id){
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

    async addArqueo(arqueo){
        try {
            let url_ = url + '/addArqueo';
            const response = await fetch(url_,{
            "method": 'POST',
            "body": JSON.stringify(arqueo),
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

    async updateArqueo(arqueo){
        try {
            const response = await fetch(url,{
            "method": 'PUT',
            "body": JSON.stringify(arqueo),
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