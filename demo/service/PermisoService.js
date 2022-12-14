import getConfig from 'next/config';


let url='http://localhost:8080/api/v1/permisos';

export class PermisoService{
    constructor() {
        this.contextPath = getConfig().publicRuntimeConfig.contextPath;
    }

    async getPermisos(){
        const response = await fetch(url);
        return await response.json();
    }
    
    async removePermiso(id){
        let url_ = url + '/delete/' + id;
        const response = await fetch(url_ ,{
            "method": 'DELETE',
            "headers": {
                "Content-type": 'application/json'
            }
        });
    }

    async addPermiso(permiso){
        try {
            let url_ = url + '/addPermiso';
            const response = await fetch(url_,{
            "method": 'POST',
            "body": JSON.stringify(permiso),
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

    async updatePermiso(permiso){
        try {
            const response = await fetch(url,{
            "method": 'PUT',
            "body": JSON.stringify(permiso),
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