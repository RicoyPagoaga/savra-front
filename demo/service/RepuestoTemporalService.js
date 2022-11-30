import getConfig from 'next/config';

let url = 'http://localhost:8080/api/v1/repuestosTemporal';

export class RepuestoTemporalService {
    constructor() {
        this.contextPath = getConfig().publicRuntimeConfig.contextPath;
    }

    async addRepuestoTemporal(repuesto) {
        try {
            let url_ = url + '/addRepuestoTemporal';
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

}