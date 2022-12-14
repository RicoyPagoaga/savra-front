import getConfig from 'next/config';

let url = 'http://localhost:8080/api/v1/proveedores';

export class ProveedorService {
    constructor() {
        this.contextPath = getConfig().publicRuntimeConfig.contextPath;
    }

    async getProveedores() {
        const response = await fetch(url);
        return await response.json();
    }

    async removeProveedor(id) {
        try {
            let url_ = url + '/delete/' + id;
            const response = await fetch(url_, {
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

    async addProveedor(proveedor) {
        try {
            let url_ = url + '/addProveedor';
            const response = await fetch(url_, {
                "method": 'POST',
                "body": JSON.stringify(proveedor),
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

    async updateProveedor(proveedor) {
        try {
            const response = await fetch(url, {
                "method":'PUT',
                "body": JSON.stringify(proveedor),
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