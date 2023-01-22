
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
const ReciboPDF = ({ facturaRecibo}) => {
    const detallesList = () =>{
        return facturaRecibo.detallesRecibo.map(detalle => <Text style={styles.estiloTextoFuerte}>{detalle.repuesto}            {detalle.cantidad}                   {detalle.precio}        {detalle.importe}</Text>);   
    }
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
                    <Text>DIRECCIÓN: Blv. Centroamérica 2da Calle.</Text>
                </View>
                <Text style={styles.estiloTextoFuerte}> ----------------------------------------------------------------------------------------------</Text>
                <Text style={styles.estiloTextoFuerte}>FACTURA</Text>
                <Text style={styles.estiloTextoFuerte}> ----------------------------------------------------------------------------------------------</Text>

                <View style={styles.estiloContenidoIzquierda}>
                    <Text>Código CAI: {facturaRecibo.encabezado.cai}</Text>
                    <Text>Factura #: {facturaRecibo.encabezado.noFactura}</Text>
                    <Text>Fecha límite de Emisón: {facturaRecibo.encabezado.fechaLimite}</Text>
                    <Text> </Text>
                </View>
                <View style={styles.estiloContenidoIzquierda}>
                    <Text>Cliente: {facturaRecibo.encabezado.cliente}</Text>
                    <Text>Fecha y Hora: {facturaRecibo.encabezado.fechaFactura}</Text>
                    <Text>Atentido por: {facturaRecibo.encabezado.empleado}</Text>
                    <Text> </Text>
                    <Text style={styles.estiloTextoFuerte}>-----------------------------------------------------------------------------------------------</Text>
                    <Text style={styles.estiloTextoFuerte}>Artículo          Cantidad            Precio U.        Importe</Text>
                    <Text style={styles.estiloTextoFuerte}>-----------------------------------------------------------------------------------------------</Text>
                    {detallesList()}
                </View>
                {/* <View>
                    {facturaRecibo.detallesRecibo.forEach(element => {
                        <Text>{element.repuesto}        {element.cantidad}  {element.precio} {element.importe}</Text>
                    })};
                </View> */}
                <View style={styles.estiloContenidoIzquierda}>
                    {/* <Text>---------------------------------------------------------------------------------------------</Text> */}
                    <Text> </Text>
                    <Text>  Tipo Entrega:             {facturaRecibo.encabezado.tipoEntrega}</Text>
                    <Text>       Shipper:             {facturaRecibo.encabezado.shipper}</Text>
                    <Text>   Costo Envío:              L. {facturaRecibo.encabezado.costoEnvio}</Text>
                    <Text>Fecha Despacho:             {facturaRecibo.encabezado.fechaDespacho}</Text>
                    <Text> Fecha Entrega:             {facturaRecibo.encabezado.fechaEntrega}</Text>
                </View>
                <View style={styles.valores}>
                    <Text> </Text>
                    <Text>                  SubTotal :   L. {facturaRecibo.subTotal}</Text>
                    <Text>           Total Impuestos:    L. {facturaRecibo.totalImpuestos}</Text>
                    <Text>Total Descuentos y Rebajas:    L. {facturaRecibo.totalDescuento}</Text>
                    <Text>                     Total:    L. {facturaRecibo.total}</Text>
                    <Text>Total Items:                  {facturaRecibo.totalItem}</Text>
                </View>
                <View style={styles.valores}>
                    <Text> </Text>
                    <Text>Forma de Pago:                {facturaRecibo.encabezado.metodoPago}</Text>
                    <Text>T.C          :                {facturaRecibo.encabezado.noTarjeta}</Text>
                    <Text>Efectivo     :                L. {facturaRecibo.encabezado.efectivo}</Text>
                    <Text>Cupón        :                {facturaRecibo.encabezado.cupon}</Text>
                </View>
                <View style={styles.encabezado}>
                    <Text> </Text>
                    <Text>ORIGINAL: CLIENTE - COPIA: OBLIGADO TRIBUTARIO</Text>
                    
                </View>
                <View style={styles.encabezado}>
                    <Text> </Text>
                    <Text> !GRACIAS POR SU COMPRA</Text>
                    <Text> ESPERAMOS REGRESE PRONTO!</Text>
                    <Text> </Text>
                    <Text>Rango Autorizado</Text>
                </View>
                <Text style={styles.estiloTexto}>Del: {facturaRecibo.encabezado.rangoInicial}  Hasta: {facturaRecibo.encabezado.rangoFinal}</Text>
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