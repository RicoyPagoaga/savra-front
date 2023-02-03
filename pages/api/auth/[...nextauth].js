import NextAuth  from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";




export default NextAuth({
    providers: [
        CredentialsProvider({
            name:"Credentials",
            authorize(credentials,req){
                const usuario = {
                    //username: credentials.username,
                    name: credentials.nombre+' '+credentials.apellido,
                    email: credentials.username
                }
                return usuario;
            }
        })
    ]
})