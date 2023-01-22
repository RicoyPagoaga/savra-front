import getConfig from 'next/config';
/*problema de corns
if (!response.ok) {
            throw new Error(`Error! status: ${response.status}`);
          }
*/

export class ClienteService {
    constructor() {
        this.contextPath = getConfig().publicRuntimeConfig.contextPath;
    }

    async getClientes() {
        const response = await fetch('http://localhost:8080/api/v1/clientes');
        return await response.json();
    }

    async removeCliente(id) {
        try {
            const response = await fetch('http://localhost:8080/api/v1/clientes/delete/' + id, {
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

    async addCliente(categoriaCliente) {
        try {
            const response = await fetch('http://localhost:8080/api/v1/clientes/addCliente', {
                "method": 'POST',
                "body": JSON.stringify(categoriaCliente),
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

    async updateCliente(categoriaCliente) {
        try {
            const response = await fetch('http://localhost:8080/api/v1/clientes', {
                "method": 'PUT',
                "body": JSON.stringify(categoriaCliente),
                "headers": {
                    "Content-type": 'application/json'
                }
            });
            const result = await response.json();
            if (response.status !== 200) throw result;
        } catch (error) {
            throw error;
        }
    }
}