import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";

const InvoicePDF = dynamic(() => import("./ReciboPDF"),{
    ssr: false,
});

const View = () =>{
    const [valor,setValor] = useState(false);

    useEffect(() =>{
        setValor(true)
    },[])

    return(
        <InvoicePDF/>
    )
}

export default View;