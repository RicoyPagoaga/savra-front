import getConfig from 'next/config';

let url = 'http://localhost:8080/api/v1/cupones';

export class CuponService {
    constructor() {
        this.contextPath = getConfig().publicRuntimeConfig.contextPath;
    }

    async getCupones() {
        const response = await fetch(url);
        //console.log(response);
        return await response.json();
    }

    async removeCupon(id) {
        let url_ = url + '/delete/' + id;
        const response = await fetch(url_, {
            "method": 'DELETE',
            "headers": {
                "Content-type": 'application/json'
            }
        }); 
    }
    async activarDesactivarCupon(estado,id) {
        let url_ = url + '/activarDesactivar/'+estado+'/'+ id;
        const response = await fetch(url_, {
            "method": 'PUT',
            "headers": {
                "Content-type": 'application/json'
            }
        });      
    }
    async addCupon(cupon) {
        try {
            let url_ = url + '/addCupon';
            const response = await fetch(url_, {
                "method": 'POST',
                "body": JSON.stringify(cupon),
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

    async updateCupon(cupon) {
        try {
            const response = await fetch(url, {
                "method":'PUT',
                "body": JSON.stringify(cupon),
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