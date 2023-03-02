import { getSession } from "next-auth/react";

export const autenticacionRequerida = async (req,cb) =>{
    const session = await getSession({req})
    if(!session){
        return{
            redirect:{
                destination:'/',
                permanent:false
            },
        }
    }
    return cb({session});
}