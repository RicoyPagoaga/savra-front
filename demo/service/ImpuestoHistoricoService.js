import getConfig from 'next/config';

let url = 'http://localhost:8080/api/v1/historico_impuestos';

export class ImpuestoHistoricoService {
    constructor() {
        this.contextPath = getConfig().publicRuntimeConfig.contextPath;
    }

    async getImpuestosHistorico() {
        const response = await fetch(url);
        return await response.json();
    }

    async addImpuestoHistorico(impuesto) {
        try {
            let url_ = url + '/addImpuestoHistorico';
            const response = await fetch(url_, {
                "method": 'POST',
                "body": JSON.stringify(impuesto),
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

    async updateImpuestoHistorico(impuesto) {
        try {
            const response = await fetch(url, {
                "method":'PUT',
                "body": JSON.stringify(impuesto),
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