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
import { autenticacionRequerida } from '../../utils/AutenticacionRequerida';
import { useSession } from 'next-auth/react'
import View from '../ReciboView';
//import 'bootstrap/dist/css/bootstrap.min.css';
import ReciboPDF from '../ReciboPDF';
import { PDFViewer } from '@react-pdf/renderer';
import Moment, { now } from 'moment';
import Router from 'next/router';
import dynamic from "next/dynamic";
import { AccionService } from '../../demo/service/AccionService';

const jaja = dynamic(() => ReciboPDF, {
    ssr: false,
});

const Facturas = () => {
    const [valor, setValor] = useState(false);
    //FacturaEncabezado
    let facturaVacia = {
        idFactura: null,
        parametroFactura: null,
        noFactura: '',
        cliente: null,
        empleado: null,
        fechaFactura: null,
        metodoPago: null,
        efectivo: null,
        tarjeta: null,
        cupon: null,
        tipoEntrega: null,
        shipper: null,
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
    let encabezadoRecibo = {
        cai: '',
        noFactura: '',
        fechaLimite: '',
        cliente: '',
        fechaFactura: '',
        empleado: '',
        tipoEntrega: '',
        shipper: '',
        costoEnvio: null,
        fechaDespacho: '',
        fechaEntrega: '',
        metodoPago: '',
        tarjeta: null,
        efectivo: null,
        rangoInicial: '',
        rangoFinal: '',
    }
    let facturaReciboVacio = {
        encabezado: {},
        detallesRecibo: [],
        subTotal: 0,
        totalImpuestos: 0,
        totalDescuento: 0,
        totalItem: 0,
        total: 0
    }
    const [inputNumberValue, setInputNumberValue] = useState(null);
    const [facturas, setFacturas] = useState([]);
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
    const [costoEnvio, setCostoEnvio] = useState(0);
    const [fechaDes, setFechaDes] = useState(null);
    const [fechaEn, setFechaEn] = useState(null);
    const [cupones, setCupones] = useState([]);
    const [cupon, setCupon] = useState(null);
    const [impuestos, setImpuestos] = useState(null);
    const [selectedCupons, setSelectedCupons] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [displayResponsive, setDisplayResponsive] = useState(false);
    const [facturaDetalles, setFacturaDetalles] = useState([]);
    const { data: session } = useSession();
    //
    const [permisos, setPermisos] = useState([]);
    const [cargando, setCargando] = useState(true);
    //Estado de acciones
    const [verLista, setVerLista] = useState(false);
    const [buscar, setBuscar] = useState(false);
    const [agregar, setAgregar] = useState(false);
    const [actualizar, setActualizar] = useState(false);
    const [eliminar, setEliminar] = useState(false);
    const [exportarCVS, setExportarCVS] = useState(false);
    const [exportarXLS, setExportarXLS] = useState(false);
    const [exportarPDF, setExportarPDF] = useState(false);
    const [reImpresion, setReImpresion] = useState(false);

    //condicionRender
    const [efectivo, setEfectivo] = useState(false);
    const [envio, setEnvio] = useState(false);
    const [tarjeta, setTarjeta] = useState(false);
    const [correlativo, setCorrelativo] = useState(0);
    const [cuponChek, setCuponChek] = useState(false);

    //recibo
    const [verRecibo, setVerRecibo] = useState(false);
    const [reciboFactura, setReciboFactura] = useState(facturaReciboVacio);
    const [detallesRecibo, setDetallesRecibo] = useState([]);


    //detalle
    const [repuestos, setRepuestos] = useState([]);
    const [repuesto, setRepuesto] = useState(null);
    const [detalles, setDetalles] = useState([]);
    const [detalle, setDetalle] = useState(detalleVacio);
    const [precioHistoricos, setPrecioHistoricos] = useState([]);
    const [impuestoHistoricos, setImpuestoHistoricos] = useState([]);

    //dropdownRepuestos
    const [filterValue, setFilterValue] = useState('');
    const filterInputRef = useRef();

    const [dropdownCupones, setDropdownCupones] = useState([]);

    const toast = useRef(null);
    const dt = useRef(null);

    //ValoresDetalle
    const [cantidadDetalle, setCantidadDetalle] = useState(null);
    const [subTotal, setSubTotal] = useState(0);
    const [impuestoTotal, setImpuestoTotal] = useState(0);
    const [descuentoTotal, setDescuentoTotal] = useState(0);
    const [total, setTotal] = useState(0);

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

    //detalleRecibo
    const listarDetallesRecibo = (id) => {
        const detalle = new FacturaDetalleService();
        detalle.getDetalleRecibo(id).then(data => setDetallesRecibo(data));
    }
    let obtenerRol = () => {
        var info = session.user.email.split('/');
        return info[4]
    }
    const listarPermisos = () => {
        const accionService = new AccionService();
        accionService.getAccionesModuloRol(obtenerRol(), 'Facturas').then(data => {setPermisos(data) , setCargando(false) });
    };

    const permisosDisponibles = () => {
        permisos.forEach(element => {
            switch (element.nombre) {
                case "Ver Lista":
                    setVerLista(true);
                    break;
                case "Buscar":
                    setBuscar(true);
                    break;
                case "Registrar":
                    console.log('Hola3.2')
                    setAgregar(true);
                    break;
                case "Actualizar":
                    setActualizar(true);
                    break;
                case "Eliminar":
                    setEliminar(true);
                    break;
                case "Exportar CSV":
                    setExportarCVS(true);
                    break;
                case "Exportar Excel":
                    setExportarXLS(true);
                    break;
                case "Exportar PDF":
                    setExportarPDF(true);
                    break;
                case "Reimpresión":
                    setReImpresion(true);
                    break;
                default:
                    break;
            }
        });
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
        listarPermisos();
        permisosDisponibles();
        //console.log(precioHistoricos);
    }, []);

    useEffect(() => {
        permisosDisponibles();
    }, [cargando]);

    const openNew = () => {
        setearDropdownCupones()
        setFactura(facturaVacia);
        setReciboFactura(facturaReciboVacio);
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

    const pasoRegistro = async () => {
        listarFacturas();
        listarParametrosFactura();
        setFacturaDialog(false);
        
        visualizarRecibo(factura);
    }
    const obtenerNoFactura = (parametroFactura) => {
        const parametro = parametros.find((item) => {
            if (item.idParametro == parametroFactura)
                return item;
        });
        var noFacts = parametro.rangoInicial.split('-')
        var noFactura = noFacts[0] + '-' + noFacts[1] + '-' + noFacts[2] + '-' + (1 + parametro.ultimaFactura).toString();
        return noFactura
    }
    const setearDropdownCupones = () => {
        let dropdown = []
        cupones.map((item) => {
            if (item.activo === 1) {
                dropdown.push(item);
            }
        });
        setDropdownCupones(dropdown);
    };
    const actualizarCorrelativo = async (factura) => {
        const parametro = parametros.find((item) => {
            if (item.idParametro == factura.parametroFactura.idParametro)
                return item;
        });
        try {
            parametro.ultimaFactura = (parametro.ultimaFactura + 1);
            console.log(parametro);
            const parametrofacturaservice = new ParametroFacturaService();
            await parametrofacturaservice.updateParametroFactura(parametro);
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error.details, life: 3000 });
        }
    }
    const saveFactura = async () => {
        setSubmitted(true);
        try {
            const facturaService = new FacturaService();
            if (cuponChek === false && cupon === null) {
                let error = { errorDetails: 'Selecciona un cupón para aplicar, de lo contrario desmarca la casilla' }
                throw (error);
            }
            if (factura.parametroFactura) {
                factura.noFactura = obtenerNoFactura(factura.parametroFactura.idParametro);
            }
            const dateM = Date.now();
            factura.fechaFactura = dateM;
            //Aqui se guarda la factura
            const response = await facturaService.addFactura(factura,detalles.length,total);
            detalles.forEach(function (detalle) {
                detalle.idFactura = response.idFactura;
            })
            const facturaDetalleService = new FacturaDetalleService();
            await facturaDetalleService.addFacturaDetalles(detalles);
            actualizarCorrelativo(factura);
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Factura Creada', life: 3000 });
            pasoRegistro(factura);

        } catch (error) {
            console.log(error);
            toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });
        }
    }

    const visualizarRecibo = async (factura) => {
        let _detalles = []
        let subTotal1 = 0;
        let impuestos1 = 0;
        let descuentos1 = 0;
        let totalItems1 = 0;
        let valorCupon = 0;
        let valorDescCupon = 0
        
        const recibo = new FacturaService();
        if (!factura.idFactura) {
            const r = await recibo.getReciboByNoFactura(factura.noFactura);
            factura.idFactura = r.idFactura;    
        }
        const response = await recibo.getRecibo(factura.idFactura);
        const detalle = new FacturaDetalleService();
        const datos = await detalle.getDetalleRecibo(factura.idFactura);
        _detalles = datos;
        console.log(_detalles);
        let _recibo = { ...reciboFactura };
        _detalles.forEach(element => {
            subTotal1 += element.importe;
            impuestos1 += element.impuesto;
            descuentos1 += element.descuento;
            totalItems1 += element.cantidad;
        });
        _recibo.encabezado = response
        //buscar cupon si es que aplico.
        if (_recibo.encabezado.cupon != 'N/A') {
            const miCupon = cupones.find((item) => {
                if (item.codigo == _recibo.encabezado.cupon) {
                    return item;
                }
            });
            valorCupon = miCupon.porcentajeDescuento;
        }
        _recibo.detallesRecibo = _detalles;
        _recibo.subTotal = subTotal1.toFixed(2);
        valorDescCupon = (subTotal1 * (valorCupon / 100));

        descuentos1 = descuentos1 + valorDescCupon;
        _recibo.totalImpuestos = impuestos1.toFixed(2);
        _recibo.totalDescuento = descuentos1.toFixed(2);
        _recibo.totalItem = totalItems1;
        _recibo.total = (subTotal1 + impuestos1 - descuentos1 + _recibo.encabezado.costoEnvio).toFixed(2);

        const h = [
            { field: "repuesto", header: "Artículo" }, 
            { field: "cantidad", header: "Cantidad" }, 
            { field: "precio", header: "Precio U." }, 
            { field: "importe", header: "Importe" }
        ]
        _recibo.column = h;
        setReciboFactura(_recibo);
        console.log(_recibo);
        setVerRecibo(true);
    }
    const cerrarRecibo = () => {
        setVerRecibo(false);
        setReciboFactura(facturaReciboVacio);
        console.log(reciboFactura);
    }

    const cols = [
        { field: 'idFactura', header: 'ID' },
        { field: 'parametroFactura', header: 'CAI' },
        { field: 'noFactura', header: 'No. Factura' },
        { field: 'cliente', header: 'Cliente' },
        { field: 'empleado', header: 'Empleado' },
        { field: 'fechaFactura', header: 'Fecha' },
        { field: 'metodoPago', header: 'Método Pago' },
        { field: 'tipoEntrega', header: 'T. Entrega' }
    ];
    const exportColumns = cols.map(col => ({ title: col.header, dataKey: col.field }));

    let objModificado = facturas.map(function (element) {
        return {
            idFactura: element.idFactura,
            parametroFactura: element.parametroFactura.cai,
            noFactura: element.noFactura,
            cliente: element.cliente.nombre,
            empleado: element.empleado.nombre,
            fechaFactura: new Date(element.fechaFactura).toLocaleDateString(),
            metodoPago: element.metodoPago.nombre,
            efectivo: element.efectivo,
            tarjeta: element.tarjeta==null?"N/A":element.tarjeta,
            cupon: element.cupon==null?"N/A":element.cupon.nombre,
            tipoEntrega: element.tipoEntrega.nombre,
            shipper: element.shipper==null?"N/A":element.shipper.nombre,
            costoEnvio: element.costoEnvio,
            fechaDespacho: element.fechaDespacho==null?"N/A":new Date(element.fechaDespacho).toLocaleDateString(),
            fechaEntrega: element.fechaEntrega==null?"N/A":new Date(element.fechaEntrega).toLocaleDateString()
        };
    })

    const exportCSV = (selectionOnly) => {
        dt.current.exportCSV({ selectionOnly });
    };
    const exportPdf = () => {
        import('jspdf').then((jsPDF) => {
            import('jspdf-autotable').then(() => {
                const doc = new jsPDF.default("portrait");
                var image = new Image();
                var fontSize = doc.internal.getFontSize();
                const docWidth = doc.internal.pageSize.getWidth();
                const docHeight = doc.internal.pageSize.getHeight();
                const txtWidth = doc.getStringUnitWidth('VENTAS REALIZADAS') * fontSize / doc.internal.scaleFactor;
                const x = (docWidth - txtWidth) / 2;
                image.src = '../layout/images/img_facturalogo2.png';
                doc.addImage(image, 'PNG', 10, 0, 50, 30);
                //centrar texto:
                doc.text('VENTAS REALIZADAS', x, 15);
                doc.setFontSize(12);
                doc.text(15, 30, 'Usuario: ' + session.user.name);
                doc.text(15, 36, 'Fecha: ' + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString());
                doc.text(docWidth - 15, 30, 'Total Facturas: ' + facturas.length, { align: "right" });
                doc.line(15, 40, docWidth - 15, 40);
                doc.autoTable(exportColumns, objModificado, { margin: { top: 45, bottom: 40 },columnStyles:{1:{cellWidth: 30},2:{cellWidth: 30}} });
                const pageCount = doc.internal.getNumberOfPages();
                for (var i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    doc.line(15, docHeight - 20, docWidth - 15, docHeight - 20);
                    doc.text('Página ' + String(i) + '/' + pageCount, docWidth - 15, docHeight - 10, { align: "right" });
                }
                doc.save('Reporte_Facturas.pdf');
            });
        });
    };

    const exportExcel = () => {
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(objModificado);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array'
            });

            saveAsExcelFile(excelBuffer, 'Reporte_Facturas');
        });
    };
    const saveAsExcelFile = (buffer, fileName) => {
        import('file-saver').then((module) => {
            if (module && module.default) {
                let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
                let EXCEL_EXTENSION = '.xlsx';
                const data = new Blob([buffer], {
                    type: EXCEL_TYPE
                });

                module.default.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
            }
        });
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
        setCostoEnvio(0);
        setShipper(null);
        setFechaDes(null);
        setFechaEn(null);
    };
    //facturaEncabezado
    const onInputChange = (e, nombre) => {
        const val = (e.target && e.target.value) || '';
        let _factura = { ...factura };
        switch (nombre) {
            case "parametroFactura":
                _factura[`${nombre}`] = val;
                setParametro(e.value)
                break;
            case "cliente":
                _factura[`${nombre}`] = val;
                setCliente(e.value)
                break;
            case "empleado":
                _factura[`${nombre}`] = val;
                setEmpleado(e.value)
                break;
            case "metodoPago":
                _factura[`${nombre}`] = val;
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
            case "cupon":
                _factura[`${nombre}`] = val;
                setCupon(e.value)
                break;
            case "tipoEntrega":
                _factura[`${nombre}`] = val;
                val.nombre == 'ENVIO' ? setEnvio(true) : setEnvio(false);
                setTipoEntrega(e.value)
                if (envio) nuevoTipoEntrega();
                break;
            case "shipper":
                _factura[`${nombre}`] = val;
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
            case "costoEnvio":
                _factura[`${nombre}`] = val;
                setCostoEnvio(e.value)
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
                    {agregar?<Button label="Nueva" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />:null}
                </div>
            </React.Fragment>
        )
    }

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                {exportarCVS ? <Button type="button" icon="pi pi-file" onClick={() => exportCSV(false)} className="mr-2" tooltip="CSV" tooltipOptions={{ position: 'bottom' }} /> : null}
                {exportarXLS ? <Button type="button" icon="pi pi-file-excel" onClick={exportExcel} className="p-button-success mr-2" tooltip="XLSX" tooltipOptions={{ position: 'bottom' }} /> : null}
                {exportarPDF ? <Button type="button" icon="pi pi-file-pdf" onClick={exportPdf} className="p-button-warning mr-2" tooltip="PDF" tooltipOptions={{ position: 'bottom' }} /> : null}
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
        return (
            <>
                <span className="p-column-title">Parametro Factura</span>
                {rowData.parametroFactura.cai}
            </>
        );
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
        return (
            <>
                <span className="p-column-title">Cliente</span>
                {rowData.cliente.nombre}
            </>
        );

    }
    const empleadoBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Empleado</span>
                {rowData.empleado.nombre}
            </>
        );
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
        return (
            <>
                <span className="p-column-title">Pago</span>
                {rowData.metodoPago.nombre}
            </>
        );
    }
    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                {/* <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editCupon(rowData)} /> */}
                {reImpresion?<Button icon="pi pi-print" className="p-button-rounded p-button-secondary mt-2" onClick={() => visualizarRecibo(rowData)} />:null}  
            </div>
        );
    }
    const filter = (e) => {
        let x = e.target.value;

        if (x.trim() != '') 
            setGlobalFilter(x);
        else
            setGlobalFilter(' ');
    }

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Listado de Facturas</h5>
            {buscar?<span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => filter(e)} placeholder="Buscar..." />
            </span>:null}
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
            if (!hasRepuesto) {
                //validar si tiene stock
                if(repuesto.stockActual>0) {
                    //IdFactura Siempre sera null al inicio de la facturacion, igual se deja la siguiente validacion
                    let idFactura = (!factura.idFactura) ? null : factura.idFactura;
                    let detalleVacio = {
                        idFacturaDetalle: null,
                        idFactura: idFactura,
                        idRepuesto: repuesto.idRepuesto,
                        cantidad: 1,
                        descuento: 0.0,
                    };
                    _detalles.push(detalleVacio);
                    //console.log(_detalles);
                    setDetalles(_detalles);
                    setRepuesto(null);
                } else {
                    Toast('El repuesto: ' + repuesto.nombre + ' no tiene Stock!')
                }
                
            } else {
                Toast('El repuesto: ' + repuesto.nombre + ' ya ha sido agregado al detalle!');
            }
        } else {
            Toast("Debe seleccionar el repuesto a agregar");
        }
    };
    const eliminarDetalle = (detalle) => {
        let _detalles = detalles.filter((val) => val.idRepuesto !== detalle.idRepuesto);
        setDetalles(_detalles);
        calcularValoresDetalle();
        toast.current.show({ severity: 'info', summary: 'Éxito', detail: 'Detalle eliminado', life: 3000 });
    };
    const repBodyTemplate = (rowData) => {
        let nombre = '';
        repuestos.map((item) => {
            if (item.idRepuesto == rowData.idRepuesto) {
                nombre = item.nombre;
            }
        });
        return nombre;
    };
    const cantidadBodyTemplate = (rowData) => {
        let x = 2;
        let _repuestos = [...repuestos];
        _repuestos.map((item) => {
            if (item.idRepuesto === rowData.idRepuesto) {
                x = (item.stockActual - item.stockMinimo);
            }
        });
        //setCantidadDetalle(rowData.cantidad);
        //console.log(cantidadDetalle);
        return <InputNumber value={rowData.cantidad} onValueChange={(e) => rowData.cantidad = e.value} showButtons mode="decimal" min={1} max={x}
            tooltip="No podrá colocar un valor que supere al Stock Disponible del Repuesto" />
    };
    const descuentoBodyTemplate = (rowData) => {
        return <InputNumber value={rowData.descuento} suffix='%' onValueChange={(e) => rowData.descuento = e.value} showButtons mode="decimal" min={0} max={50}
            tooltip="No podrá colocar más del 50% de descuento" />
    };

    const precioBodyTemplate = (rowData) => {
        const precioHistoric = precioHistoricos.find((item) => {
            if (item.idRepuesto === rowData.idRepuesto && item.fechaFinal == null)
                return item;
        });
        calcularValoresDetalle();
        if (precioHistoric != null) {
            return <h5>L. {precioHistoric.precio}</h5>
        } else {
            return <h5>L. {rowData.cantidad}</h5>
        }

    };
    const calcularValoresDetalle = () => {
        //let _detalles = [...detalles];
        //console.log(detalles);
        let totalPrecioH = 0;
        let descuentoT = 0;
        let impT = 0;
        detalles.forEach(item => {
            const precioHistoric = precioHistoricos.find((vPh) => {
                if (vPh.idRepuesto === item.idRepuesto && vPh.fechaFinal == null) {
                    totalPrecioH += vPh.precio * item.cantidad;
                    return vPh;
                }
            });
            const repuesto1 = repuestos.find((rep) => {
                if (rep.idRepuesto === item.idRepuesto)
                    return rep;
            });
            const impuesto = impuestos.find((imp) => {
                if (imp.idImpuesto === repuesto1.impuesto.idImpuesto)
                    return imp;
            });
            descuentoT += (item.cantidad * precioHistoric.precio) * (item.descuento / 100);
            const impuestoHistoric = impuestoHistoricos.find((impH) => {
                if (impH.idImpuesto === impuesto.idImpuesto && impH.fechaFinal == null)
                    return impH;
            });
            impT += (item.cantidad * precioHistoric.precio) * (impuestoHistoric.valor / 100);
        });
        setSubTotal(totalPrecioH);
        setDescuentoTotal(descuentoT);
        setImpuestoTotal(impT);
        setTotal(subTotal + impuestoTotal - descuentoT)
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
                    <label htmlFor="idShipper">Transportista:</label>
                    <Dropdown id="idShipper" options={shippers} value={factura.shipper} onChange={(e) => onInputChange(e, 'shipper')} optionLabel="nombre" placeholder="Seleccione un Transportista" required autoFocus className={classNames({ 'p-invalid': submitted && !factura.shipper })}></Dropdown>
                    {submitted && !factura.shipper && <small className="p-invalid">Shipper es requerido.</small>}
                </div>
                <div className="field col-4">
                    <label htmlFor="costoEnvio">Costo Envío:</label>
                    <InputNumber id="costoEnvio" value={costoEnvio} max={10000} onValueChange={(e) => onInputChange(e, 'costoEnvio')} mode='currency' currency='HNL' locale='en-US' 
                    tooltip="Escribe el costo de envío que se estima con el shipper, maximo L. 10,000" className={classNames({ 'p-invalid': submitted && !factura.costoEnvio })} />
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
        console.log(reciboFactura);
        return (
            <div>
                <Toolbar className="mb-4" right={reciboToolbarTemplate}></Toolbar>
                <PDFViewer style={{ width: "100%", height: "80vh" }}>
                    <ReciboPDF facturaRecibo={reciboFactura} />
                </PDFViewer>
            </div>

        );
    } else {
        if(cargando){
            return 'Cargando...'
        }
        if (permisos.length > 0) {
            return (
                <div className="grid crud-demo">
    
                    <div className="col-12">
                        <div className="card">
                            <Toast ref={toast} />
                            <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                            {verLista?<DataTable
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
                                <Column field="parametroFactura.cai" header="Parámetro" sortable body={parametroBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                                <Column field="noFactura" header="Número Factura" sortable body={noFacturaBodyTemplate} headerStyle={{ width: '14%', minWidth: '15rem' }}></Column>
                                <Column field="cliente.nombre" header="Cliente" sortable body={clienteBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                                <Column field="empleado.nombre" header="Empleado" sortable body={empleadoBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                                <Column field="fechaFactura" header="Fecha Factura" sortable body={fechaFacturaBodyTemplate} headerStyle={{ width: '14%', minWidth: '12rem' }}></Column>
                                <Column field="metodoPago.nombre" header="Forma de Pago" sortable body={metodoPagoBodyTemplate} headerStyle={{ width: '14%', minWidth: '12rem' }}></Column>
                                <Column header="Acciones" body={actionBodyTemplate}></Column>
                            </DataTable>:null}
                            
    
                            <Dialog visible={facturaDialog} style={{ width: '800px' }} header="FACTURACIÓN" modal className="p-fluid" footer={facturaDialogFooter} onHide={hideDialog}>
                                <div className='p-fluid formgrid grid'>
                                    <div className="field col ">
                                        <label htmlFor="parametroFactura">Parámetro Factura:</label>
                                        <Dropdown id="parametroFactura.cai" options={parametros} value={factura.parametroFactura} onChange={(e) => onInputChange(e, 'parametroFactura')} optionLabel="cai" required autoFocus placeholder="Seleccione un parámetro" className={classNames({ 'p-invalid': submitted && !factura.parametroFactura })}></Dropdown>
                                        {submitted && !factura.parametroFactura && <small className="p-invalid">Parámetro es requerido.</small>}
                                    </div>
                                    <div className="field col-3">
                                        <label htmlFor="fechaFactura">Fecha:</label>
                                        <InputText id="fechaFactura" value={Moment(new Date()).format('DD/MM/YYYY')} onChange={(e) => onInputChange(e, 'fechaFactura')} disabled />
                                    </div>
                                </div>
                                <div className='p-fluid formgrid grid'>
                                    <div className="field col">
                                        <label htmlFor="idCliente">Cliente:</label>
                                        <Dropdown id="idCliente" options={clientes} value={factura.cliente} onChange={(e) => onInputChange(e, 'cliente')} optionLabel="nombre" placeholder="Seleccione un cliente" className={classNames({ 'p-invalid': submitted && !factura.cliente })}></Dropdown>
                                        {submitted && !factura.cliente && <small className="p-invalid">Cliente es requerido.</small>}
                                    </div>
                                    <div className="field col">
                                        <label htmlFor="idEmpleado">Empleado:</label>
                                        <Dropdown id="idEmpleado" options={empleados} value={factura.empleado} onChange={(e) => onInputChange(e, 'empleado')} optionLabel="nombre" placeholder="Seleccione un empleado" className={classNames({ 'p-invalid': submitted && !factura.empleado })}></Dropdown>
                                        {submitted && !factura.empleado && <small className="p-invalid">Empleado es requerido.</small>}
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
                                        <Dropdown id="idMetodoPago" options={metodosPago} value={factura.metodoPago} onChange={(e) => onInputChange(e, 'metodoPago')} optionLabel="nombre" placeholder="Seleccione un método de pago" className={classNames({ 'p-invalid': submitted && !factura.metodoPago })}></Dropdown>
                                        {submitted && !factura.metodoPago && <small className="p-invalid">Forma de pago es requerido.</small>}
                                    </div>
                                    <div className="field col-3">
                                        <label htmlFor="efectivo">Efectivo Recibido:</label>
                                        <InputNumber id="efectivo" value={factura.efectivo} onValueChange={(e) => onInputChange(e, 'efectivo')} disabled={efectivo} max={40000} mode='currency' currency='HNL' locale='en-US' 
                                        tooltip="Escribe la cantidad de dinero en efectivo que proporciona el cliente, máximo permitido: L. 40,000.00" className={classNames({ 'p-invalid': submitted && !efectivo && !factura.efectivo })} />
                                        {submitted && !efectivo && !factura.efectivo && <small className="p-invalid">Efectivo es requerido.</small>}
                                    </div>
                                    <div className="field col-4">
                                        <label htmlFor="tarjeta">No. Tarjeta:</label>
                                        <InputText id="tarjeta" value={factura.tarjeta} onChange={(e) => onInputChange(e, 'tarjeta')} minLength={13} maxLength={18} disabled={tarjeta} tooltip="Digite el número de la tarjeta del cliente sin utilizar espacios ni guiones debe ser mayor de 13 digitos" className={classNames({ 'p-invalid': submitted && !tarjeta && !factura.tarjeta })} />
                                        {submitted && !tarjeta && !factura.tarjeta && <small className="p-invalid">No. Tarjeta es requerida.</small>}
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
                                        <Dropdown id="idCupon" disabled={cuponChek} options={dropdownCupones} value={factura.cupon} onChange={(e) => onInputChange(e, 'cupon')} optionLabel="codigo" placeholder="Seleccione un cupón" filter showClear filterBy="codigo" className={classNames({ 'p-invalid': submitted && !cuponChek && !factura.cupon })}></Dropdown>
                                        {submitted && !cuponChek && !factura.cupon && <small className="p-invalid">Cúpon es requerido.</small>}
                                    </div>
                                </div>
                                <div className="field">
                                    <label htmlFor="idTipoEntrega">Tipo Entrega:</label>
                                    <Dropdown id="idTipoEntrega" options={tipoEntregas} value={factura.tipoEntrega} onChange={(e) => onInputChange(e, 'tipoEntrega')} optionLabel="nombre" placeholder="Seleccione un tipo de entrega" className={classNames({ 'p-invalid': submitted && !factura.tipoEntrega })}></Dropdown>
                                    {submitted && !factura.tipoEntrega && <small className="p-invalid">Tipo de entrega es requerido.</small>}
                                </div>
                                {/* si es por envio: */}
                                {envio ? ventaPorEnvio() : <hr></hr>}
                                <div >
                                    <div className='card, col-5' style={{ paddingLeft: '15%', width: '430px', paddingRight: '0%' }}>
                                        <div style={{ textAlign: 'right', paddingRight: '1%' }}>
                                            <h5>SubTotal:                   L. {subTotal.toFixed(2)}</h5>
                                            <h5>Total Impuestos:            L. {impuestoTotal.toFixed(2)}</h5>
                                            <h5>Total Descuentos y Rebajas: L. {descuentoTotal.toFixed(2)}</h5>
    
                                            <h5>Total:                      L. {total.toFixed(2)}</h5>
    
                                        </div>
                                    </div>
                                </div>
    
                            </Dialog>
                        </div>
                    </div>
                </div>
            );
        } else {
            {console.log(permisos)}
            return (
                <h2>No tiene permisos disponibles para este módulo! </h2>
            )
        }
    }
};
export async function getServerSideProps({ req }) {
    return autenticacionRequerida(req, ({ session }) => {
        return {
            props: { session }
        }
    })
}

export default Facturas;
