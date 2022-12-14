
import React, { useEffect, useState } from "react";
import { Document, Text, PDFViewer, Page, Image, View, StyleSheet, Font } from "@react-pdf/renderer";
import { useRouter } from "next/router";

const styles = StyleSheet.create({
    body: {
        paddingTop: 20
    },
    encabezado: {
        display: 'flex',
        alignItems: 'center'
    },
    estiloTextoFuerte: {
        textAlign: 'center'
    },
    estiloContenidoIzquierda: {
        paddingLeft: 10
    },
    imgEstilo: {
        width: 200,
        height: 100,
        marginTop: -10
    },
    estiloTexto: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontStyle: 'italic'
    },
    numeroPagina:{
        position: 'absolute',
        fontSize: 10,
        bottom:30,
        left:0,
        right:0,
        textAlign: "center",
        color: "grey"
    },
    valores:{
       textAlign:'right',
       paddingRight:'35%'
    }
})

let fecha = new Date();
const ReciboPDF = ({ facturaRecibo }) => {
    return (
        <Document>
            <Page style={styles.body} size={"A4"}>
                <View style={styles.encabezado}>
                    <Image
                        style={styles.imgEstilo}
                        source={{ uri: '/layout/images/img_facturalogo2.png' }}
                    ></Image>
                    <Text>REPUESTOS AUTOMOTRICES KEVIN FÚNEZ</Text>
                    <Text>HERRAMIENTAS, REPUESTOS Y ACCESORIOS PARA TU AUTO</Text>
                    <Text>CORREO: gerencia@repuestoskf.com.hn</Text>
                    <Text>TELÉFONO:  2254-7896</Text>
                    <Text>DIRECCIÓN: Blv. Centroamerica 2da Calle.</Text>
                </View>
                <Text style={styles.estiloTextoFuerte}> ----------------------------------------------------------------------------------------------</Text>
                <Text style={styles.estiloTextoFuerte}>FACTURA</Text>
                <Text style={styles.estiloTextoFuerte}> ----------------------------------------------------------------------------------------------</Text>

                <View style={styles.estiloContenidoIzquierda}>
                    <Text>Código CAI: F79E1-61PUHFY1-24PYJ6-PIOYHJ98</Text>
                    <Text>Factura #: 0014-001-01-00175420</Text>
                    <Text>Fecha límite de Emisón: {fecha.toLocaleDateString()}</Text>
                    <Text> </Text>
                </View>
                <View style={styles.estiloContenidoIzquierda}>
                    <Text>Cliente: Alberto Gomez</Text>
                    <Text>Fecha: {fecha.toLocaleDateString()}       Hora: {fecha.toLocaleTimeString()}</Text>
                    <Text>Atentido por: Franciso Martinez</Text>
                    <Text> </Text>
                    <Text style={styles.estiloTextoFuerte}>-----------------------------------------------------------------------------------------------</Text>
                    <Text style={styles.estiloTextoFuerte}>Artículo          Cantidad            Precio U.        Importe</Text>
                    <Text style={styles.estiloTextoFuerte}>-----------------------------------------------------------------------------------------------</Text>
                    <Text style={styles.estiloTextoFuerte}>Repuesto1            3                   1500.36        4501.08</Text>
                    <Text style={styles.estiloTextoFuerte}>Repuesto2            5                    800.41        4002.10</Text>
                </View>
                {/* <View>
                    {facturaRecibo.detallesRecibo.forEach(element => {
                        <Text>{element.repuesto}        {element.cantidad}  {element.precio} {element.importe}</Text>
                    })};
                </View> */}
                <View style={styles.estiloContenidoIzquierda}>
                    {/* <Text>---------------------------------------------------------------------------------------------</Text> */}
                    <Text> </Text>
                    <Text>Tipo Entrega:               Envio</Text>
                    <Text>Shipper:                    MotoExpressHN</Text>
                    <Text>Costo Envío:                L. 250.00</Text>
                    <Text>Fecha Despacho:             {fecha.toLocaleDateString()}</Text>
                </View>
                <View style={styles.valores}>
                    <Text> </Text>
                    <Text>                  SubTotal :   L. 2800.21</Text>
                    <Text>           Total Impuestos:    L.  258.00</Text>
                    <Text>Total Descuentos y Rebajas:    L.  125.18</Text>
                    <Text>                     Total:    L. 3915.12</Text>
                    <Text>Total Items:                  3</Text>
                </View>
                <View style={styles.valores}>
                    <Text> </Text>
                    <Text>Forma de Pago:              Tarjeta</Text>
                    <Text>Tarjeta                      L. 3915.12</Text>
                    <Text>T.C:                         . 9300</Text>
                    <Text>Efectivo:                    L. 0.00.</Text>
                    <Text>Su Cambio:                   L. 0.00</Text>
                </View>
                <View style={styles.encabezado}>
                    <Text> </Text>
                    <Text>ORIGINAL: CLIENTE - COPIA: OBLIGADO TRIBUTARIO</Text>
                    <Text>Su Ahorro:                L. 125.18</Text>
                </View>
                <View style={styles.encabezado}>
                    <Text> </Text>
                    <Text> !GRACIAS POR SU COMPRA</Text>
                    <Text> ESPERAMOS REGRESE PRONTO!</Text>
                    <Text> </Text>
                    <Text>Rango Autorizado</Text>
                </View>
                <Text style={styles.estiloTexto}>Del: 014-001-01-00167001 Hasta: 014-001-01-00192000</Text>
                <Text
                    style={styles.estiloTexto}
                    render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
                    fixed
                />
            </Page>
        </Document>
    );
};

const PDFView = () => {
    const router = useRouter()
    const {
        query: client,
    } = router
    const props = { client }
    const [clienteA, setClienteA] = useState(props);
    const [valor, setValor] = useState(false)

    useEffect(() => {
        setValor(true)
    }, [])

    return (
        <PDFViewer style={{ width: "100%", height: "80vh" }}>
            <ReciboPDF clienteA={clienteA} />
        </PDFViewer>
    )
}
export default ReciboPDF;