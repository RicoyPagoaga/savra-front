import getConfig from 'next/config';

let url = 'http://localhost:8080/api/v1/permisos_rol';

export class PermisoRolService {
    constructor() {
        this.contextPath = getConfig().publicRuntimeConfig.contextPath;
    }

    async getPermisosRol() {
        const response = await fetch(url);
        return await response.json();
    }

    async addPermisoRol(permisoRol) {
        try {
            let url_ = url + '/addPermisoRol';
            const response = await fetch(url_, {
                "method": 'POST',
                "body": JSON.stringify(permisoRol),
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

    async addPermisosRol(permisosRol) {
        try {
            let url_ = url + '/addPermisosRol';
            const response = await fetch(url_, {
                "method": 'POST',
                "body": JSON.stringify(permisosRol),
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

    async updatePermisoRol(permisoRol) {
        try {
            const response = await fetch(url, {
                "method":'PUT',
                "body": JSON.stringify(permisoRol),
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

    async removePermisoRol(idModuloAccion, idRol) {
        try {
            let url_ = url + '/delete/'+idModuloAccion+"/"+idRol;
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