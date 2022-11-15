import getConfig from 'next/config';
let url = 'http://localhost:8080/api/v1/tipoDocumento';
export class TipoDocumentoService{
    constructor() {
        this.contextPath = getConfig().publicRuntimeConfig.contextPath;
    }

    async getTipoDocumentos(){
        const response = await fetch(url);
        return await response.json();
    }

    async removeTipoDocumento(id) {
        let url_ = url + '/delete/' + id;
        const response = await fetch(url_, {
            "method": 'DELETE',
            "headers": {
                "Content-type": 'application/json'
            }
        }); 
    }

    async addTipoDocumento(tipoDocumento) {
        try {
            let url_ = url + '/addTipoDocumento';
            const response = await fetch(url_, {
                "method": 'POST',
                "body": JSON.stringify(tipoDocumento),
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

    async updateTipoDocumento(tipoDocumento) {
        try {
            const response = await fetch(url, {
                "method":'PUT',
                "body": JSON.stringify(tipoDocumento),
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








