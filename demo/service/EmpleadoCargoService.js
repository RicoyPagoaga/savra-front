import getConfig from 'next/config';

let url='http://localhost:8080/api/v1/empleado_cargos';

export class EmpleadoCargoService{
    constructor() {
        this.contextPath = getConfig().publicRuntimeConfig.contextPath;
    }

    async getEmpleadoCargos(){
        const response = await fetch(url);
        return await response.json();
    }

    async removeEmpleadoCargo(id){
        let url_ = url + '/delete/' + id;
        const response = await fetch(url_,{
            "method": 'DELETE',
            "headers": {
                "Content-type": 'application/json'
            }
        });
        if (response.status == 500) throw 'No es posible eliminar el registro, se encuentra en uso';
    }

    async addEmpleadoCargo(empleadoCargo){
        try {
            let url_ = url + '/addEmpleadoCargo';
            const response = await fetch(url_,{
            "method": 'POST',
            "body": JSON.stringify(empleadoCargo),
            "headers": {
                "Content-type": 'application/json'
                }
            });
            const result = await response.json();
            if(response.status !== 201)throw result;
            return result;
        } catch (error) {
            throw error;
        }
        
    }

    async updateEmpleadoCargo(empleadoCargo){
        try {
            const response = await fetch(url,{
            "method": 'PUT',
            "body": JSON.stringify(empleadoCargo),
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