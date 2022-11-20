import getConfig from 'next/config';
/*problema de corns
if (!response.ok) {
            throw new Error(`Error! status: ${response.status}`);
          }
*/
let url='http://localhost:8080/api/v1/empleados';

export class EmpleadoService{
    constructor() {
        this.contextPath = getConfig().publicRuntimeConfig.contextPath;
    }

    async getEmpleados(){
        const response = await fetch(url);
        return await response.json();
    }

    async removeEmpleado(id){
        let url_ = url + '/delete/' + id;
        const response = await fetch(url_,{
            "method": 'DELETE',
            "headers": {
                "Content-type": 'application/json'
            }
        });
    }

    async addEmpleado(Empleado){
        try {
            let url_ = url + '/addEmpleado';
            const response = await fetch(url_,{
            "method": 'POST',
            "body": JSON.stringify(Empleado),
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

    async updateEmpleado(Empleado){
        try {
            const response = await fetch(url,{
            "method": 'PUT',
            "body": JSON.stringify(Empleado),
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