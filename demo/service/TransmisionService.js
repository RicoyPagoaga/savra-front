import getConfig from 'next/config';

let url = 'http://localhost:8080/api/v1/transmisiones';

export class TransmisionService {
    constructor() {
        this.contextPath = getConfig().publicRuntimeConfig.contextPath;
    }

    async getTransmisiones() {
        const response = await fetch(url);
        //console.log(response);
        return await response.json();
    }

    async removeTransmision(id) {
        let url_ = url + '/delete/' + id;
        const response = await fetch(url_, {
            "method": 'DELETE',
            "headers": {
                "Content-type": 'application/json'
            }
        }); 
    }

    async addTransmision(transmision) {
        try {
            let url_ = url + '/addTransmision';
            const response = await fetch(url_, {
                "method": 'POST',
                "body": JSON.stringify(transmision),
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

    async updateTransmision(transmision) {
        try {
            const response = await fetch(url, {
                "method":'PUT',
                "body": JSON.stringify(transmision),
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