import getConfig from 'next/config';

export class TipoDocumentoService{
    constructor() {
        this.contextPath = getConfig().publicRuntimeConfig.contextPath;
    }

    async getTipoDocumentos(){
        const response = await fetch('http://localhost:8080/api/v1/tipoDocumento');
        return await response.json();
    }
}