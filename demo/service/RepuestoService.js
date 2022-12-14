import getConfig from 'next/config';

let url = 'http://localhost:8080/api/v1/repuestos';

export class RepuestoService {
    constructor() {
        this.contextPath = getConfig().publicRuntimeConfig.contextPath;
    }

    async getRepuestos() {
        const response = await fetch(url);
        return await response.json();
    }

    async removeRepuesto(id) {
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

    async addRepuesto(repuesto, stockA, stockM, stockMa, precio) {
        try {
            let url_ = url + '/addRepuesto/'+stockA+'/'+stockM+'/'+stockMa+'/'+precio;
            const response = await fetch(url_, {
                "method": 'POST',
                "body": JSON.stringify(repuesto),
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

    async updateRepuesto(repuesto, stockA, stockM, stockMa, precio) {
        try {
            let url_ = url + '/'+stockA+'/'+stockM+'/'+stockMa+'/'+precio;
            const response = await fetch(url_, {
                "method":'PUT',
                "body": JSON.stringify(repuesto),
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