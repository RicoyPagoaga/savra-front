import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import { Dropdown } from 'primereact/dropdown';
import React, { useEffect, useRef, useState } from 'react';
import { CuponService } from '../../demo/service/CuponService';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { Checkbox } from 'primereact/checkbox';
import { ParametroFacturaService } from '../../demo/service/ParametroFacturaService';
import { ClienteService } from '../../demo/service/clienteservice';
import { EmpleadoService } from '../../demo/service/EmpleadoService';
import { MetodoPagoService } from '../../demo/service/MetodoPagoService';
import { ImpuestoService } from '../../demo/service/ImpuestoService';
import { TipoEntregaService } from '../../demo/service/TipoEntregaService';
import { ShipperService } from '../../demo/service/ShipperService';
import { RepuestoService } from '../../demo/service/RepuestoService';
import { FacturaService } from '../../demo/service/FacturaService';
import { FacturaDetalleService } from '../../demo/service/FacturaDetalleService';
import { ImpuestoHistoricoService } from '../../demo/service/ImpuestoHistoricoService';
import { PrecioHistoricoRepuestoService } from '../../demo/service/PrecioHistoricoRepuestoService';
import View from '../ReciboView';
//import 'bootstrap/dist/css/bootstrap.min.css';
import ReciboPDF from '../ReciboPDF';
import { PDFViewer } from '@react-pdf/renderer';
import Moment from 'moment';
import Router from 'next/router';
import dynamic from "next/dynamic";

const jaja = dynamic(() => ReciboPDF, {
    ssr: false,
});

const Facturas = () => {
    const [valor, setValor] = useState(false);
    //FacturaEncabezado
    let facturaVacia = {
        idFactura: null,
        idParametroFactura: null,
        noFactura: '',
        idCliente: null,
        idEmpleado: null,
        fechaFactura: new Date(),
        idMetodoPago: null,
        efectivo: null,
        tarjeta: '',
        idCupon: null,
        idTipoEntrega: null,
        idShipper: null,
        costoEnvio: null,
        fechaDespacho: null,
        fechaEntrega: null
    };
    //detalleFactura
    let detalleVacio = {
        idFacturaDetalle: null,
        idFactura: null,
        idRepuesto: null,
        cantidad: 1,
        descuento: 0.0
    }
    //InformacionRecibo
    let detalleRecibo = {
        repuesto: '',
        cantidad: 0,
        precio: 0,
        importe: 0
    }
    let facturaRecibo = {
        encabezadoRecibo: facturaVacia,
        cai: '',
        fechaLimite: null,
        cliente: '',
        empleado: '',
        tipoEntrega: '',
        shipper: null,
        costoEnvio: null,
        fechaDespacho: null,
        subTotal: 0,
        totalImpuestos: 0,
        descuentos: null,
        total: 0,
        totalItems: 0,
        formaPago: '',
        tarjeta: 0,
        cambio: 0,
        ahorro: 0,
        rangoDesde: '',
        rangoHasta: '',
        detallesRecibo: [detalleRecibo]
    }
    const [inputNumberValue, setInputNumberValue] = useState(null);
    const [facturas, setFacturas] = useState();
    const [facturaDialog, setFacturaDialog] = useState(false);
    const [activarDesactivarCuponDialog, setActivarDesactivarCuponDialog] = useState(false);
    const [activarDesactivarCuponsDialog, setActivarDesactivarCuponsDialog] = useState(false);
    const [factura, setFactura] = useState(facturaVacia);
    const [checked, setChecked] = useState(false); //estado para el checkbox
    const [parametros, setParametros] = useState([]);
    const [parametro, setParametro] = useState(null);
    const [clientes, setClientes] = useState([]);
    const [cliente, setCliente] = useState(null);
    const [empleados, setEmpleados] = useState([]);
    const [empleado, setEmpleado] = useState(null);
    const [metodosPago, setMetodosPago] = useState([]);
    const [metodoPago, setMetodoPago] = useState(null);
    const [tipoEntregas, setTipoEntregas] = useState(null);
    const [tipoEntrega, setTipoEntrega] = useState(null);
    const [shippers, setShippers] = useState([]);
    const [shipper, setShipper] = useState(null);
    const [fechaDes, setFechaDes] = useState(null);
    const [fechaEn, setFechaEn] = useState(null);
    const [cupones, setCupones] = useState([]);
    const [cupon, setCupon] = useState(null);
    const [impuestos,setImpuestos] = useState(null);
    const [selectedCupons, setSelectedCupons] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [displayResponsive, setDisplayResponsive] = useState(false);
    const [facturaDetalles, setFacturaDetalles] = useState([]);

    //condicionRender
    const [efectivo, setEfectivo] = useState(false);
    const [envio, setEnvio] = useState(false);
    const [tarjeta, setTarjeta] = useState(false);
    const [cuponChek, setCuponChek] = useState(false);

    //recibo
    const [verRecibo, setVerRecibo] = useState(false);
    const [infoFactura, setInfoFactura] = useState();


    //detalle
    const [repuestos, setRepuestos] = useState([]);
    const [repuesto, setRepuesto] = useState(null);
    const [detalles, setDetalles] = useState([]);
    const [detalle, setDetalle] = useState(detalleVacio);
    const [precioHistoricos, setPrecioHistoricos] = useState([]);
    const [impuestoHistoricos, setImpuestoHistoricos] = useState([]);
    const [subTotal, setSubTotal] = useState(0);
    const [impuestoTotal, setImpuestoTotal] = useState(0);
    const [descuentoTotal, setDescuentoTotal] = useState(0);
    const [total, setTotal] = useState(0);
    //dropdownRepuestos
    const [filterValue, setFilterValue] = useState('');
    const filterInputRef = useRef();

    const toast = useRef(null);
    const dt = useRef(null);

    let cantidadInicialDetalle = 1;
    //let subTotal = 0.0;
    
    const listarFacturas = () => {
        const facturaservice = new FacturaService();
        facturaservice.getFacturas().then(data => setFacturas(data));
    };
    //detallesFactura
    const listarFacturaDetalles = () => {
        const facturaDetalleService = new FacturaDetalleService();
        facturaDetalleService.getFacturaDetalles().then(data => setFacturaDetalles(data));
    };

    const listarParametrosFactura = () => {
        const parametrofacturaservice = new ParametroFacturaService();
        parametrofacturaservice.getParametrosFactura().then(data => setParametros(data));
    };
    const listarClientes = () => {
        const clienteservice = new ClienteService();
        clienteservice.getClientes().then(data => setClientes(data));
    };
    const listarEmpleados = () => {
        const empleadoservice = new EmpleadoService();
        empleadoservice.getEmpleados().then(data => setEmpleados(data));
    };
    const listarMetodos = () => {
        const metodoService = new MetodoPagoService();
        metodoService.getMetodosPago().then(data => setMetodosPago(data));
    };
    const listarImpuestos = () => {
        const impuestoService = new ImpuestoService();
        impuestoService.getImpuestos().then(data => setImpuestos(data));
    };
    const listarTipos = () => {
        const tipoService = new TipoEntregaService();
        tipoService.getTiposEntrega().then(data => setTipoEntregas(data));
    };
    const listarShippers = () => {
        const shipperService = new ShipperService();
        shipperService.getShippers().then(data => setShippers(data));
    };
    const listarCupones = () => {
        const cuponService = new CuponService();
        cuponService.getCupones().then(data => setCupones(data));
    };

    //detalle
    const listarRepuestos = () => {
        const repuestoService = new RepuestoService();
        repuestoService.getRepuestos().then(data => setRepuestos(data));
    };

    const listarPrecios = () => {
        const precioHistoricoService = new PrecioHistoricoRepuestoService();
        precioHistoricoService.getPreciosHistorico().then(data => setPrecioHistoricos(data));
    };

    const listarImpuestosHistoricos = () => {
        const impuestoHistoricoService = new ImpuestoHistoricoService();
        impuestoHistoricoService.getImpuestosHistorico().then(data => setImpuestoHistoricos(data));
    };

    useEffect(() => {
        setValor(true)
        listarFacturas();
        listarFacturaDetalles();
        listarParametrosFactura();
        listarClientes();
        listarEmpleados();
        listarMetodos();
        listarTipos();
        listarShippers();
        listarCupones();
        listarRepuestos();
        listarImpuestos();
        listarPrecios();
        listarImpuestosHistoricos();
        console.log(precioHistoricos);
    }, []);

    const openNew = () => {
        setFactura(facturaVacia);
        setDetalle(detalleVacio);
        setDetalles([]);
        setParametro(null);
        setCliente(null);
        setEmpleado(null);
        setMetodoPago(null);
        setCupon(null);
        setTipoEntrega(null);
        setShipper(null);
        setFechaDes(null);
        setFechaEn(null);
        setEfectivo(true);
        setTarjeta(true)
        setEnvio(false);
        setChecked(false)
        setCuponChek(true)
        //detalle
        setRepuesto(null);
        setSubTotal(0);
        setImpuestoTotal(0);
        setDescuentoTotal(0);
        setSubmitted(false);
        setFacturaDialog(true);
    }

    const hideDialog = () => {
        setSubmitted(false);
        setFacturaDialog(false);
    }

    const hideDeleteCuponDialog = () => {
        setActivarDesactivarCuponDialog(false);
    }

    const pasoRegistro = () => {
        listarFacturas();
        setFacturaDialog(false);
        setFactura(facturaVacia);
        setVerRecibo(true);
    }
    const obtenerNoFactura = (factura) => {
        const parametro = parametros.find((item) => {
            if (item.idParametro == factura.idParametroFactura)
                return item;
        });
        var noFacts = parametro.rangoInicial.split('-')
        var noFactura = noFacts[0] + '-' + noFacts[1] + '-' + noFacts[2] + '-' + (1 + parametro.ultimaFactura).toString();
        return noFactura
    }
    
    const saveFactura = async () => {

        setSubmitted(true);

        try {
            factura.noFactura = obtenerNoFactura(factura);
            factura.fechaFactura = new Date();
            const facturaService = new FacturaService();
            //const response = facturaService.addFactura(factura);
            facturaRecibo.encabezadoRecibo = factura;
            facturaRecibo.detallesRecibo = detalles;
            console.log(facturaRecibo);
            // detalles.forEach(function(detalle){
            //     detalle.idFactura = response.idFactura;
            // })
            const facturaDetalleService = new FacturaService();
            //facturaDetalleService.addFactura(factura)
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Factura Creada', life: 3000 });
            //pasoRegistro();
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });
        }
    }

    const editFactura = (cupon) => {
        const fechaE = () => {
            var emision = cupon.fechaEmision.toString().split('-');
            return new Date(emision[0], emision[1] - 1, emision[2])
        }
        const fechaC = () => {
            var caducidad = cupon.fechaCaducidad.toString().split('-');
            return new Date(caducidad[0], caducidad[1] - 1, caducidad[2])
        }
        setFechaE(fechaE);
        setFechaC(fechaC);
        setCupon({ ...cupon });
        setCuponDialog(true);
    }

    const visualizarRecibo = () => {
        //setInfoFactura();
        setVerRecibo(true);
        
    }
    const cerrarRecibo = () => {
        setVerRecibo(false);
        //setInfoFactura();
    }

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const deleteSelectedCupons = async () => {
        const cuponService = new CuponService();
        selectedCupons.map(async (cupon) => {
            await cuponService.removeCupon(cupon.idCupon);
        });
        let _cupons = cupons.filter((val) => !selectedCupons.includes(val));
        setCupons(_cupons);
        setDeleteCuponsDialog(false);
        setSelectedCupons(null);
        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Cupones Eliminados', life: 3000 });
    }
    //limpiar valores si es escogio por envio;
    const nuevoTipoEntrega = () => {
        factura.costoEnvio = null;
        setShipper(null);
        setFechaDes(null);
        setFechaEn(null);
    };
    //facturaEncabezado
    const onInputChange = (e, nombre) => {
        const val = (e.target && e.target.value) || '';
        let _factura = { ...factura };
        switch (nombre) {
            case "idParametroFactura":
                _factura[`${nombre}`] = val.idParametro;
                setParametro(e.value)
                break;
            case "idCliente":
                _factura[`${nombre}`] = val.idCliente;
                setCliente(e.value)
                break;
            case "idEmpleado":
                _factura[`${nombre}`] = val.idEmpleado;
                setEmpleado(e.value)
                break;
            case "idMetodoPago":
                _factura[`${nombre}`] = val.idMetodoPago;
                setMetodoPago(e.value)
                val.nombre == 'TARJETA' ? setEfectivo(true) : setEfectivo(false);
                if (!efectivo) _factura.efectivo = null;
                val.nombre == 'EFECTIVO' ? setTarjeta(true) : setTarjeta(false);
                if (!tarjeta) _factura.tarjeta = "";
                break;
            case "isCupon":
                e.checked ? setCuponChek(false) : setCuponChek(true);
                setChecked(e.checked);
                if (checked) setCupon(null);
                break;
            case "idCupon":
                _factura[`${nombre}`] = val.idCupon;
                setCupon(e.value)
                break;
            case "idTipoEntrega":
                _factura[`${nombre}`] = val.idTipoEntrega;
                val.nombre == 'ENVIO' ? setEnvio(true) : setEnvio(false);
                setTipoEntrega(e.value)
                if (envio) nuevoTipoEntrega();
                break;
            case "idShipper":
                _factura[`${nombre}`] = val.idShipper;
                setShipper(e.value)
                break;
            case "fechaDespacho":
                _factura[`${nombre}`] = val;
                setFechaDes(e.value)
                break;
            case "fechaEntrega":
                _factura[`${nombre}`] = val;
                setFechaEn(e.value)
                break;
            default:
                _factura[`${nombre}`] = val
                break;
        }
        setFactura(_factura);
    }
    //detalleFactura
    const onInputChangeDetalle = (e, nombre) => {
        const val = (e.target && e.target.value) || '';
        let _detalle = { ...detalle };
        switch (nombre) {
            case "idRepuesto":
                _detalle[`${nombre}`] = val.idRepuesto;
                setRepuesto(e.value)
                break;
            case "idCliente":
                _factura[`${nombre}`] = val.idCliente;
                setCliente(e.value)
                break;

            default:
                _factura[`${nombre}`] = val
                break;
        }

        setDetalle(_detalle);
    }
    const onCheckboxChange = (e) => {
        let selectedValue = [...checkboxValue];
        if (e.checked) selectedValue.push(e.value);
        else selectedValue.splice(selectedValue.indexOf(e.value), 1);

        setCheckboxValue(selectedValue);
    };
    const onClick = (name, position) => {
        dialogFuncMap[`${name}`](true);

        if (position) {
            setPosition(position);
        }
    }
    const onHide = (name) => {
        dialogFuncMap[`${name}`](false);
    }
    const renderFooter = (name) => {
        return (
            <div>
                <Button label="No" icon="pi pi-times" onClick={() => onHide(name)} className="p-button-text" />
                <Button label="Yes" icon="pi pi-check" onClick={() => onHide(name)} autoFocus />
            </div>
        );
    }

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Nueva" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                </div>
            </React.Fragment>
        )
    }

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>

                <Button icon="pi pi-print" className="p-button-rounded p-button-secondary mt-2  mr-2" onClick={() => visualizarRecibo()} />
                <Button label="Exportar" icon="pi pi-upload" className="p-button-help " onClick={() => visualizarRecibo()} />
            </React.Fragment>
        )
    }
    const reciboToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="Regresar" icon="pi pi-sign-out" className="p-button-danger" onClick={cerrarRecibo} />
            </React.Fragment>
        )
    }
    const idBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">ID Factura</span>
                {rowData.idFactura}
            </>
        );
    }
    const parametroBodyTemplate = (rowData) => {
        const parametro = parametros.find((item) => {
            if (item.idParametro == rowData.idParametroFactura)
                return item;
        });
        //console.log(documento)
        if (parametro != null) {
            return (
                <>
                    <span className="p-column-title">Parametro Factura</span>
                    {
                        parametro.cai
                    }

                </>
            );
        } else {
            return (
                <>
                    <span className="p-column-title">Parametro Factura</span>
                    {rowData.idParametroFactura}
                </>
            );
        }
        
    }
    const noFacturaBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">No Factura</span>
                {rowData.noFactura}
            </>
        );
    }
    const clienteBodyTemplate = (rowData) => {
        const cliente = clientes.find((item) => {
            if (item.idCliente == rowData.idCliente)
                return item;
        });
        //console.log(documento)
        if (cliente != null) {
            return (
                <>
                    <span className="p-column-title">Cliente</span>
                    {
                        cliente.nombre
                    }

                </>
            );
        } else {
            return (
                <>
                    <span className="p-column-title">Cliente</span>
                    {rowData.idCliente}
                </>
            );
        }
        
    }
    const empleadoBodyTemplate = (rowData) => {
        const empleado = empleados.find((item) => {
            if (item.idEmpleado == rowData.idEmpleado)
                return item;
        });
        //console.log(documento)
        if (empleado != null) {
            return (
                <>
                    <span className="p-column-title">Empleado</span>
                    {
                        empleado.nombre
                    }

                </>
            );
        } else {
            return (
                <>
                    <span className="p-column-title">Empleado</span>
                    {rowData.idEmpleado}
                </>
            );
        }
    }
    const fechaFacturaBodyTemplate = (rowData) => {
        var dateDMY = Moment(rowData.fechaFactura).format('DD/MM/YYYY');
        return (
            <>
                <span className="p-column-title">Fecha Factura</span>
                {dateDMY}
            </>
        );
    }
    const metodoPagoBodyTemplate = (rowData) => {
        const pago = metodosPago.find((item) => {
            if (item.idMetodoPago == rowData.idMetodoPago)
                return item;
        });
        //console.log(documento)
        if (pago != null) {
            return (
                <>
                    <span className="p-column-title">Pago</span>
                    {
                        pago.nombre
                    }

                </>
            );
        } else {
            return (
                <>
                    <span className="p-column-title">Pago</span>
                    {rowData.idMetodoPago}
                </>
            );
        }
        
    }
    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                {/* <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editCupon(rowData)} /> */}
                <Button icon="pi pi-print" className="p-button-rounded p-button-secondary mt-2" onClick={() => visualizarRecibo()} />
            </div>
        );
    }
    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Listado de Facturas</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const agregarDetalle = () => {
        const Toast = (message) => {
            toast.current.show({ severity: 'warn', summary: 'Error', detail: message, life: 3000 });
        };
        if (repuesto) {
            //evitar que agregue repuesto repetido al detalle
            let _detalles = [...detalles];
            let hasRepuesto = _detalles.some((item) => {
                return item.idRepuesto === repuesto.idRepuesto;
            });
            setInputNumberValue(1);
            if (hasRepuesto === false) {
                if (cantidadInicialDetalle>0) {
                    //validar cuanta cantidad se puede comprar
                    let x = false;
                    let _repuestos = [...repuestos];
                    _repuestos.map((item) => {
                        if (item.idRepuesto === repuesto.idRepuesto && inputNumberValue > (item.stockMaximo - item.stockActual)) {
                            x = true;
                        }
                    });
                    if (!x) {
                        //agregar detalle
                        let idFactura = (!factura.idFactura) ? null : factura.idFactura;
                        let detalleVacio = {
                            idFacturaDetalle: null,
                            idFactura: idFactura,
                            idRepuesto: repuesto.idRepuesto,
                            cantidad: 1,
                            descuento:0.0,
                        };
                        _detalles.push(detalleVacio);
                        setDetalles(_detalles);
                        setRepuesto(null);
                        setInputNumberValue(null);

                    } else {
                        Toast("Cantidad no puede ser mayor a la del Stock Máximo del Repuesto");
                    }
                } else {
                    Toast("Indique cantidad");
                    console.log(cantidadInicialDetalle);
                }
            } else {
                Toast('El repuesto: ' + repuesto.nombre + ' ya ha sido agregado al detalle!');
            }
        } else {
            Toast("Debe seleccionar el repuesto a agregar");
        }
    };
    const repBodyTemplate = (rowData) => {
        let nombre = '';
        repuestos.map((item) => {
            if (item.idRepuesto == rowData.idRepuesto) {
                nombre = item.idRepuesto + '- ' + item.nombre;
            }
        });
        return nombre;
    };
    const eliminarDetalle = (detalle) => {
        let _detalles = detalles.filter((val) => val.idFacturaDetalle !== detalle.idFacturaDetalle);
        setDetalles(_detalles);
        toast.current.show({ severity: 'info', summary: 'Éxito', detail: 'Detalle eliminado', life: 3000 });
        setSubTotal(0);
        setImpuestos(0);
        setDescuentoTotal(0)
        setTotal(0);
    };
    const cantidadBodyTemplate = (rowData) => {
        let x = 2;
        let _repuestos = [...repuestos];
        _repuestos.map((item) => {
            if (item.idRepuesto === rowData.idRepuesto) {
                x = (item.stockActual - item.stockMinimo);
            }
        });
       
        return <InputNumber value={rowData.cantidad} onValueChange={(e) => rowData.cantidad = e.value} showButtons mode="decimal" min={1} max={x}
            tooltip="No podrá colocar un valor que supere al Stock Disponible del Repuesto" />
    };
    const descuentoBodyTemplate = (rowData) => {
        return <InputNumber value={rowData.descuento} onValueChange={(e) => rowData.descuento = e.value} showButtons mode="decimal" min={0} max={50}
            tooltip="No podrá colocar más del 50% de descuento" />
    };
    let valorSub= 0;
    let valorDesc = 0;
    let ValorImp = 0;
    const precioBodyTemplate = (rowData) => {
        const precioHistoric = precioHistoricos.find((item) => {
            if (item.idRepuesto === rowData.idRepuesto && item.fechaFinal==null)
                return item;  
        });
        const repuesto1 = repuestos.find((item) => {
            if (item.idRepuesto === rowData.idRepuesto)
                return item;  
        });
        const impuesto = impuestos.find((item) => {
            if (item.idImpuesto === repuesto1.idImpuesto)
                return item;  
        });
        const impuestoHistoric = impuestoHistoricos.find((item) => {
            if (item.idImpuesto === impuesto.idImpuesto && item.fechaFinal==null)
                return item;  
        });
        valorSub+=rowData.cantidad*precioHistoric.precio;
        valorDesc+=rowData.cantidad*precioHistoric.precio*(rowData.descuento/100);
        ValorImp+=rowData.cantidad*precioHistoric.precio*(impuestoHistoric.valor/100);
        setSubTotal(valorSub);
        setDescuentoTotal(valorDesc);
        setImpuestoTotal(ValorImp);
        setDetalles(detalles);
        console.log(precioHistoric);
        if(precioHistoric!=null){
            return <h5>L. {precioHistoric.precio}</h5>
        }else{
            return <h5>L. {rowData.cantidad}</h5>
        }
    };
    const actionDetalleBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <Button icon="pi pi-times" className="p-button-rounded p-button-danger p-button-text"
                    aria-label="Cancelar" onClick={() => eliminarDetalle(rowData)} />
            </div>
        );
    }
    const facturaDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Facturar" icon="pi pi-check" className="p-button-text" onClick={saveFactura} />
        </>
    );
    
    const ventaPorEnvio = () => (
        <>
            <div className='p-fluid formgrid grid'>
                <div className="field col">
                    <label htmlFor="idShipper">Shipper:</label>
                    <Dropdown id="idShipper" options={shippers} value={shipper} onChange={(e) => onInputChange(e, 'idShipper')} optionLabel="nombre" placeholder="Seleccione un Shipper" required autoFocus className={classNames({ 'p-invalid': submitted && !factura.idShipper })}></Dropdown>
                    {submitted && !factura.idShipper && <small className="p-invalid">Shipper es requerido.</small>}
                </div>
                <div className="field col-4">
                    <label htmlFor="costoEnvio">Costo Envío:</label>
                    <InputNumber id="costoEnvio" value={factura.costoEnvio} max={10000} onValueChange={(e) => onInputChange(e, 'costoEnvio')} prefix="L. " tooltip="Escribe el costo de envío que se estima con el shipper, maximo L. 10,000" className={classNames({ 'p-invalid': submitted && !factura.costoEnvio })} />
                    {submitted && !factura.costoEnvio && <small className="p-invalid">Costo de Envío es requerido.</small>}
                </div>

            </div>
            <div className='p-fluid formgrid grid'>
                <div className="field col">
                    <label htmlFor="fechaDespacho">Fecha Despacho:</label>
                    <Calendar dateFormat="dd/mm/yy" showIcon showButtonBar value={fechaDes} onChange={(e) => onInputChange(e, 'fechaDespacho')} placeholder="Seleccione una fecha de despacho" className={classNames({ 'p-invalid': submitted && !factura.fechaDespacho })}></Calendar>
                    {submitted && !factura.fechaDespacho && <small className="p-invalid">Fecha Despacho es requerido.</small>}
                </div>
                <div className="field col">
                    <label htmlFor="fechaEntrega">Fecha Entrega:</label>
                    <Calendar dateFormat="dd/mm/yy" showIcon showButtonBar value={fechaEn} onChange={(e) => onInputChange(e, 'fechaEntrega')} placeholder="Seleccione una fecha de entrega"></Calendar>
                </div>
            </div>
        </>
    );
    
    const footer = `SubTotal: L. ${subTotal.toFixed(2)}`;
    if (verRecibo) {
        return (
            <div>
                <Toolbar className="mb-4" right={reciboToolbarTemplate}></Toolbar>
                <PDFViewer style={{ width: "100%", height: "80vh" }}>
                    <ReciboPDF facturaRecibo={facturaRecibo} />
                </PDFViewer>
            </div>

        );
    } else {
        return (
            <div className="grid crud-demo">
                <div className="col-12">
                    <div className="card">
                        <Toast ref={toast} />
                        <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                        <DataTable
                            ref={dt}
                            value={facturas}
                            selection={selectedCupons}
                            onSelectionChange={(e) => setSelectedCupons(e.value)}
                            dataKey="idFactura"
                            //filters = {filter}
                            globalFilter={globalFilter}
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25]}
                            className="datatable-responsive"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Facturas"
                            //globalFilter={globalFilter}
                            emptyMessage="No se encontraron facturas."
                            header={header}
                            responsiveLayout="scroll"
                        >
                            <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                            <Column field="idFactura" header="ID" sortable body={idBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                            <Column field="idParametroFactura" header="Parámetro" sortable body={parametroBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                            <Column field="noFactura" header="Número Factura" sortable body={noFacturaBodyTemplate} headerStyle={{ width: '14%', minWidth: '15rem' }}></Column>
                            <Column field="idCliente" header="Cliente" sortable body={clienteBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                            <Column field="idEmpleado" header="Empleado" sortable body={empleadoBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                            <Column field="fechaFactura" header="Fecha Factura" sortable body={fechaFacturaBodyTemplate} headerStyle={{ width: '14%', minWidth: '12rem' }}></Column>
                            <Column field="idMetodoPago" header="Forma de Pago" sortable body={metodoPagoBodyTemplate} headerStyle={{ width: '14%', minWidth: '12rem' }}></Column>
                            <Column header="Acciones" body={actionBodyTemplate}></Column>
                        </DataTable>

                        <Dialog visible={facturaDialog} style={{ width: '800px' }} header="FACTURACIÓN" modal className="p-fluid" footer={facturaDialogFooter} onHide={hideDialog}>
                            <div className='p-fluid formgrid grid'>
                                <div className="field col ">
                                    <label htmlFor="idParametroFactura">Parámetro Factura:</label>
                                    <Dropdown id="idParametroFactura" options={parametros} value={parametro} onChange={(e) => onInputChange(e, 'idParametroFactura')} optionLabel="cai" required autoFocus placeholder="Seleccione un parámetro" className={classNames({ 'p-invalid': submitted && !factura.idParametroFactura })}></Dropdown>
                                    {submitted && !factura.idParametroFactura && <small className="p-invalid">Parámetro es requerido.</small>}
                                </div>
                                <div className="field col-3">
                                    <label htmlFor="fechaFactura">Fecha:</label>
                                    <InputText id="fechaFactura" value={Moment(factura.fechaFactura).format('DD/MM/YYYY')} onChange={(e) => onInputChange(e, 'fechaFactura')} disabled />
                                </div>
                            </div>
                            <div className='p-fluid formgrid grid'>
                                <div className="field col">
                                    <label htmlFor="idCliente">Cliente:</label>
                                    <Dropdown id="idCliente" options={clientes} value={cliente} onChange={(e) => onInputChange(e, 'idCliente')} optionLabel="nombre" placeholder="Seleccione un cliente" className={classNames({ 'p-invalid': submitted && !factura.idCliente })}></Dropdown>
                                    {submitted && !factura.idCliente && <small className="p-invalid">Cliente es requerido.</small>}
                                </div>
                                <div className="field col">
                                    <label htmlFor="idEmpleado">Empleado:</label>
                                    <Dropdown id="idEmpleado" options={empleados} value={empleado} onChange={(e) => onInputChange(e, 'idEmpleado')} optionLabel="nombre" placeholder="Seleccione un empleado" className={classNames({ 'p-invalid': submitted && !factura.idEmpleado })}></Dropdown>
                                    {submitted && !factura.idEmpleado && <small className="p-invalid">Empleado es requerido.</small>}
                                </div>
                            </div>
                            <div className='formgrid grid'>
                                <div className="field col ">
                                    <label htmlFor="idRepuesto">Repuestos:</label>
                                    <Dropdown id="idRepuesto" options={repuestos} value={repuesto} onChange={(e) => onInputChangeDetalle(e, 'idRepuesto')} optionLabel="nombre" filter showClear filterBy="idRepuesto" placeholder="Seleccione un repuesto a agregar"></Dropdown>
                                </div>
                                <div className='field col-3'>
                                    <hr></hr>
                                    <Button type='button' label="Agregar" icon="pi pi-plus" className="p-button-outlined p-button-primary ml-auto" onClick={agregarDetalle} />
                                </div>
                                {/* <div className='field col-3'>
                                    <hr></hr>
                                    <Button label="Habilitar Descuentos" icon="pi pi-external-link" onClick={() => onClick('displayResponsive')} />
                                    <Dialog header="Header" visible={displayResponsive} onHide={() => onHide('displayResponsive')} breakpoints={{ '960px': '75vw' }} style={{ width: '50vw' }} footer={renderFooter('displayResponsive')}>
                                        <p>Hola</p>
                                    </Dialog>
                                </div> */}

                            </div>
                            <div className='card' style={{ width: '740px' }}>
                                <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                                    <h5 className="m-20">Artículos/Repuestos Agregados</h5>
                                </div>

                                <DataTable
                                    ref={dt}
                                    value={detalles}
                                    dataKey="idFacturaDetalle"
                                    footer={footer}

                                    //paginator
                                    rows={15}
                                    rowsPerPageOptions={[5, 10, 25]}
                                    className="datatable-responsive editable-cells-table"
                                    emptyMessage="No se han agregado detalles de la venta."
                                    editMode='cell'
                                    responsiveLayout="scroll"
                                >
                                    <Column field="idRepuesto" header="Repuesto" body={repBodyTemplate} sortable headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                                    <Column field="cantidad" header="Cantidad" body={cantidadBodyTemplate} sortable headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                                    <Column field="descuento" header="descuento" body={descuentoBodyTemplate} sortable headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                                    <Column field="precio" header="precio" body={precioBodyTemplate} sortable headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                                    <Column header="Eliminar" body={actionDetalleBodyTemplate} headerStyle={{ width: '8%', minWidth: '3em' }} bodyStyle={{ textAlign: 'center' }}></Column>
                                </DataTable>
                            </div>
                            <div className='p-fluid formgrid grid'>
                                <div className="field col-5">
                                    <label htmlFor="idMetodoPago">Forma de Pago:</label>
                                    <Dropdown id="idMetodoPago" options={metodosPago} value={metodoPago} onChange={(e) => onInputChange(e, 'idMetodoPago')} optionLabel="nombre" placeholder="Seleccione un método de pago" className={classNames({ 'p-invalid': submitted && !factura.idMetodoPago })}></Dropdown>
                                    {submitted && !factura.idMetodoPago && <small className="p-invalid">Forma de pago es requerido.</small>}
                                </div>
                                <div className="field col-2">
                                    <label htmlFor="efectivo">Efectivo Recibido:</label>
                                    <InputNumber id="efectivo" value={factura.efectivo} onValueChange={(e) => onInputChange(e, 'efectivo')} disabled={efectivo} max={40000} cod prefix="L. " tooltip="Escribe la cantidad de dinero en efectivo que proporciona el cliente, máximo permitido: L. 40,000.00" className={classNames({ 'p-invalid': submitted && !efectivo && !factura.efectivo })} />
                                    {submitted && !efectivo && !factura.efectivo && <small className="p-invalid">Efectivo es requerido.</small>}
                                </div>
                                <div className="field col-5">
                                    <label htmlFor="tarjeta">No. Tarjeta:</label>
                                    <InputText id="tarjeta" value={factura.tarjeta} onChange={(e) => onInputChange(e, 'tarjeta')} minLength={13} maxLength={18} disabled={tarjeta} tooltip="Digite el número de la tarjeta del cliente sin utilizar espacios ni guiones" className={classNames({ 'p-invalid': submitted && !tarjeta && !factura.tarjeta })} />
                                    {submitted && !tarjeta && !factura.tarjeta && <small className="p-invalid">No. Tarejta es requerida.</small>}
                                </div>
                            </div>
                            <div className='p-fluid formgrid grid'>
                                <div className="col-12 md:col-2">
                                    <div className="field-checkbox">
                                        <Checkbox inputId="checkOption1" checked={checked} onChange={e => onInputChange(e, 'isCupon')} />
                                        <label htmlFor="checkOption1">Cupón</label>
                                    </div>
                                </div>
                                <div className="field col-7">
                                    <Dropdown id="idCupon" disabled={cuponChek} options={cupones} value={cupon} onChange={(e) => onInputChange(e, 'idCupon')} optionLabel="codigo" placeholder="Seleccione un cupón" filter showClear filterBy="codigo" className={classNames({ 'p-invalid': submitted && !cuponChek && !factura.idCupon })}></Dropdown>
                                    {submitted && !cuponChek && !factura.idCupon && <small className="p-invalid">Cúpon es requerido.</small>}
                                </div>
                            </div>
                            <div className="field">
                                <label htmlFor="idTipoEntrega">Tipo Entrega:</label>
                                <Dropdown id="idTipoEntrega" options={tipoEntregas} value={tipoEntrega} onChange={(e) => onInputChange(e, 'idTipoEntrega')} optionLabel="nombre" placeholder="Seleccione un tipo de entrega" className={classNames({ 'p-invalid': submitted && !factura.idTipoEntrega })}></Dropdown>
                                {submitted && !factura.idTipoEntrega && <small className="p-invalid">Tipo de entrega es requerido.</small>}
                            </div>
                            {/* si es por envio: */}
                            {envio ? ventaPorEnvio() : <hr></hr>}
                            <div >
                                <div className='card, col-5' style={{ paddingLeft: '15%', width: '430px', paddingRight:'0%' }}>
                                    <div  style={{ textAlign: 'right' ,paddingRight:'1%' }}>
                                        <h5>SubTotal:                   L. {subTotal.toFixed(2)}</h5>
                                        <h5>Total Impuestos:            L. {impuestoTotal.toFixed(2)}</h5>
                                        <h5>Total Descuentos y Rebajas: L. {descuentoTotal.toFixed(2)}</h5>
                                        <h5>Total:                      L. {(subTotal-impuestoTotal-descuentoTotal).toFixed(2)}</h5>
                                        
                                    </div>
                                </div>
                            </div>

                        </Dialog>
                    </div>
                </div>
            </div>
        );
    }
};

export default Facturas;