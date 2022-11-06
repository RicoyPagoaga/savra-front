import getConfig from 'next/config';
/*problema de corns
if (!response.ok) {
            throw new Error(`Error! status: ${response.status}`);
          }
*/

export class CategoriaClienteService{
    constructor() {
        this.contextPath = getConfig().publicRuntimeConfig.contextPath;
    }

    async getCategoriaClientes(){
        const response = await fetch('http://localhost:8080/api/v1/categoriaClientes');
        return await response.json();
    }

    async removeCategoriaCliente(id){
        const response = await fetch('http://localhost:8080/api/v1/categoriaClientes/delete/'+id,{
            "method": 'DELETE',
            "headers": {
                "Content-type": 'application/json'
            }
        });
    }

    async addCategoriaCliente(categoriaCliente){
        try {
            const response = await fetch('http://localhost:8080/api/v1/categoriaClientes/addCategoriaCliente',{
            "method": 'POST',
            "body": JSON.stringify(categoriaCliente),
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

    async updateCategoriaCliente(categoriaCliente){
        try {
            const response = await fetch('http://localhost:8080/api/v1/categoriaClientes',{
            "method": 'PUT',
            "body": JSON.stringify(categoriaCliente),
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