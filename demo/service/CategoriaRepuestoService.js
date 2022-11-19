import getConfig from 'next/config';

let url = 'http://localhost:8080/api/v1/categoria_repuestos';

export class CategoriaRepuestoService {
    constructor() {
        this.contextPath = getConfig().publicRuntimeConfig.contextPath;
    }

    async getCategoriasRepuestos() {
        const response = await fetch(url);
        return await response.json();
    }

    async removeCategoriaRepuesto(id) {
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

    async addCategoriaRepuesto(categoria) {
        try {
            let url_ = url + '/addCategoriaRepuesto';
            const response = await fetch(url_, {
                "method": 'POST',
                "body": JSON.stringify(categoria),
                "headers": {
                    "Content-type": 'application/json'
                }
            });
            const result = await response.json();
            if (response.status !== 201)throw result;
        } catch (error) {
            throw error;
        }
    }

    async updateCategoriaRepuesto(categoria) {
        try {
            const response = await fetch(url, {
                "method":'PUT',
                "body": JSON.stringify(categoria),
                "headers": {
                    "Content-type": 'application/json'
                }
            });
            const result = await response.json();
            if (response.status !== 200)throw result;
        } catch (error) {
            throw error;
        }
    }
}