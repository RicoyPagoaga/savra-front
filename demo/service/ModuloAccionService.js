import getConfig from 'next/config';

let url = 'http://localhost:8080/api/v1/modulo_accion';

export class ModuloAccionService {
    constructor() {
        this.contextPath = getConfig().publicRuntimeConfig.contextPath;
    }

    async getModulosAccion() {
        const response = await fetch(url);
        return await response.json();
    }

    async addModuloAccion(moduloAccion) {
        try {
            let url_ = url + '/addModuloAccion';
            const response = await fetch(url_, {
                "method": 'POST',
                "body": JSON.stringify(moduloAccion),
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

    async addModulosAccion(modulosAccion) {
        try {
            let url_ = url + '/addModulosAccion';
            const response = await fetch(url_, {
                "method": 'POST',
                "body": JSON.stringify(modulosAccion),
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

    async updateModuloAccion(moduloAccion) {
        try {
            const response = await fetch(url, {
                "method":'PUT',
                "body": JSON.stringify(moduloAccion),
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

    async removeModuloAccion(id) {
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
}