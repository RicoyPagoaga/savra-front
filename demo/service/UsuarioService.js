import getConfig from 'next/config';

let url = 'http://localhost:8080/api/v1/usuarios';

export class UsuarioService {
    constructor() {
        this.contextPath = getConfig().publicRuntimeConfig.contextPath;
    }

    async getUsuarios() {
        const response = await fetch(url);
        return await response.json();
    }

    async getUsuarioByUsername(username) {
        try {
            let url_ = url + '/username/' + username;
            const response = await fetch(url_, {
                "method": 'GET',
                "path": '/api/v1/usuarios/username/'+username,
                "headers": {
                    "Content-type": 'application/json'
                }
            });
            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    async removeUsuario(id) {
        let url_ = url + '/delete/' + id;
        const response = await fetch(url_, {
            "method": 'DELETE',
            "headers": {
                "Content-type": 'application/json'
            }
        }); 
    }

    async addUsuario(usuario, coinciden) {
        try {
            let url_ = url + '/addUsuario/'+coinciden;
            const response = await fetch(url_, {
                "method": 'POST',
                "body": JSON.stringify(usuario),
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

    async bloquearUsuario(estado,username) {
        let url_ = url + '/bloquearDesbloquearUsuario/'+estado+'/'+ username;
        const response = await fetch(url_, {
            "method": 'PUT',
            "headers": {
                "Content-type": 'application/json'
            }
        });      
    }

    async activarDesactivarUsuario(estado,id) {
        let url_ = url + '/activarDesactivar/'+estado+'/'+ id;
        const response = await fetch(url_, {
            "method": 'PUT',
            "headers": {
                "Content-type": 'application/json'
            }
        });      
    }
    async cerrarSesion(clientes,fecha,username) {
        let url_ = url + '/cerrarSesion/'+clientes+'/'+ fecha+'/'+username;
        const response = await fetch(url_, {
            "method": 'PUT',
            "headers": {
                "Content-type": 'application/json'
            }
        });      
    }

    async validarLogin(username, password) {
        try {
            let url_ = url + '/validar/'+username+'/'+password;
            const response = await fetch(url_, {
                "method": 'GET',
                "path": '/api/v1/usuarios/validar/'+username+'/'+password,
                "headers": {
                    "Content-type": 'application/json'
                }
            });
            if(response.status==200)return true
            else if(response.status==403)return false
        } catch (error) {
            throw error;
        }
    }

    async validarUsuarioBloqueado(username) {
        try {
            let url_ = url + '/validarUsuarioBloqueado/'+username;
            const response = await fetch(url_, {
                "method": 'GET',
                "path": '/api/v1/usuarios/validarUsuarioBloqueado/'+username,
                "headers": {
                    "Content-type": 'application/json'
                }
            });
            if(response.status==200)return true
            else if(response.status==403)return false
        } catch (error) {
            throw error;
        }
    }

    async updateUsuario(usuario, coinciden) {
        try {
            let url_ = url + "/" + coinciden
            const response = await fetch(url_, {
                "method":'PUT',
                "body": JSON.stringify(usuario),
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