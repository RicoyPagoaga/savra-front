import getConfig from 'next/config';

let url = 'http://localhost:8080/api/v1/paises';

export class PaisService {
    constructor() {
        this.contextPath = getConfig().publicRuntimeConfig.contextPath;
    }

    async getPaises() {
        const response = await fetch(url);
        //console.log(response);
        return await response.json();
    }

    async removePais(id) {
        let url_ = url + '/delete/' + id;
        const response = await fetch(url_, {
            "method": 'DELETE',
            "headers": {
                "Content-type": 'application/json'
            }
        }); 
    }

    async addPais(pais) {
        try {
            let url_ = url + '/addPais';
            const response = await fetch(url_, {
                "method": 'POST',
                "body": JSON.stringify(pais),
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

    async updatePais(pais) {
        try {
            const response = await fetch(url, {
                "method":'PUT',
                "body": JSON.stringify(pais),
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