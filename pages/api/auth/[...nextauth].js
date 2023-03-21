import NextAuth  from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { useCallback } from "react";




export default NextAuth({
    session:{
        strategy:'jwt',
    },
    providers: [
        CredentialsProvider({
            name:"Credentials",
            authorize(credentials,req){
                //usare email para los datos de clientes,ventas
                //usare Imge para ultimavisita como cadena de string
                const usuario = {
                    name :credentials.nombre +' '+credentials.apellido,
                    email :credentials.clientesVista+'/'+credentials.ventasVista+'/'+credentials.repuestosVista+'/'+credentials.nombreUsuario+'/'+credentials.rol,
                    image: credentials.ultimaVisita==null?'NULL':credentials.ultimaVisita
                };
                return usuario;
            },
            credentials:{},
        }),
    ],
})