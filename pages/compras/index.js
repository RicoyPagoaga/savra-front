import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { CompraService } from '../../demo/service/CompraService';
import { CompraDetalleService } from '../../demo/service/CompraDetalleService';
import { EmpleadoService } from '../../demo/service/EmpleadoService';
import { RepuestoService } from '../../demo/service/RepuestoService';
import { PrecioHistoricoRepuestoService } from '../../demo/service/PrecioHistoricoRepuestoService';
import { autenticacionRequerida } from '../../utils/AutenticacionRequerida';
import { useSession } from 'next-auth/react';
import { AccionService } from '../../demo/service/AccionService';

const Compras = () => {

    let compraVacia = {
        idCompra: null,
        empleado: null,
        fechaCompra: null,
        fechaDespacho: null,
        fechaRecibido: null,
        noComprobante: '',
    };

    const [compras, setCompras] = useState([]);
    const [compraDialog, setCompraDialog] = useState(false);
    const [deleteCompraDialog, setDeleteCompraDialog] = useState(false);
    const [compra, setCompra] = useState(compraVacia);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [detalleFilter, setDetalleFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const [detalles, setDetalles] = useState([]);
    const { data:session } = useSession();
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


    //fechas
    const [fechaCompra_, setFechaCompra_] = useState(null);
    const [fechaDespacho_, setFechaDespacho_] = useState(null);
    const [fechaRecibido_, setFechaRecibido_] = useState(null);

    //foraneas empleado, repuestos
    const [empleado, setEmpleado] = useState(null);
    const [empleados, setEmpleados] = useState([]);
    const [repuesto, setRepuesto] = useState(null);
    const [repuestos, setRepuestos] = useState([]);
    const [precioHistoricos, setPrecioHistoricos] = useState([]);
    const [inputNumberValue, setInputNumberValue] = useState(null);
    const [precioValue, setPrecioValue] = useState(null);

    //detalle de compra
    const [allExpanded, setAllExpanded] = useState(false);
    const [compraDetalles, setCompraDetalles] = useState([]);
    const [expandedRows, setExpandedRows] = useState([]);

    const listarCompras = () => {
        const compraService = new CompraService();
        compraService.getCompras().then(data => setCompras(data));
    };

    const listarDetallesCompra = async () => {
        const detalleService = new CompraDetalleService();
        await detalleService.getDetallesCompra().then(data => setCompraDetalles(data));
    };

    const listarEmpleados = async () => {
        const empleadoService = new EmpleadoService();
        await empleadoService.getEmpleados().then(data => setEmpleados(data));
    };

    const listarRepuestos = async () => {
        const repuestoService = new RepuestoService();
        await repuestoService.getRepuestos().then(data => setRepuestos(data));
    };

    const listarPrecioHistoricos = async () => {
        const precioHistoricoService = new PrecioHistoricoRepuestoService();
        await precioHistoricoService.getPreciosHistorico().then(data => setPrecioHistoricos(data));
    };
    let obtenerRol = () => {
        var info = session.user.email.split('/');
        return info[4]
    }
    const listarPermisos = () => {
        const accionService = new AccionService();
        accionService.getAccionesModuloRol(obtenerRol(), 'Compras').then(data => {setPermisos(data) , setCargando(false) });
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
                default:
                    break;
            }
        });
    };

    useEffect(async () => {
        listarCompras();
        await listarDetallesCompra();
        await listarEmpleados();
        await listarRepuestos();
        await listarPrecioHistoricos();
        listarPermisos();
        permisosDisponibles();
    }, []); 

    useEffect(() => {
        permisosDisponibles();
    }, [cargando]);


    const openNew = () => {
        setDetalles([]);
        setCompra(compraVacia);
        setSubmitted(false);
        setCompraDialog(true);
    }

    const hideDialog = () => {
        setSubmitted(false);
        setCompraDialog(false);
        //
        setEmpleado(null);
        setRepuesto(null);
        setInputNumberValue(null);
        setPrecioValue(null);
        setFechaCompra_(null);
        setFechaDespacho_(null);
        setFechaRecibido_(null);
    }

    const hideDeleteCompraDialog = () => {
        setDeleteCompraDialog(false);
    }

    const pasoRegistro = () => {
        listarCompras();
        listarDetallesCompra();
        setCompraDialog(false);
        setCompra(compraVacia);
        //
        setEmpleado(null);
        setRepuesto(null);
        setInputNumberValue(null);
        setPrecioValue(null);
        setFechaCompra_(null);
        setFechaDespacho_(null);
        setFechaRecibido_(null);
    }

    const saveCompra = async () => {
        setSubmitted(true);

        if (compra.idCompra) {
            try {
                //actualizar
                const compraService = new CompraService();
                let x = (!detalles || !detalles.length) ? false : true;
                await compraService.updateCompra(compra, x);
                //actualizar detalle 
                const detalleService = new CompraDetalleService();
                await detalleService.updateDetallesCompra(detalles);
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Compra Actualizada', life: 3000 });
                pasoRegistro();  
            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails , life: 3000 });
            }
        }
        else {
            try {
                //agregar compra
                const compraService = new CompraService();
                let x = (!detalles || !detalles.length) ? false : true;
                await compraService.addCompra(compra, x);
                //agregar detalle 
                const detalleService = new CompraDetalleService();
                await detalleService.addDetallesCompra(detalles);
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Compra Creada', life: 3000 });
                pasoRegistro();
            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails , life: 3000 });   
            }
        }
    }

    const getEmpleado = (id) => {
        let emp = {};
        empleados.map((item) => {
            if (item.idEmpleado == id) {
                emp = item;
            }
        });
        return emp;
    }

    const getFecha = (fecha) => {
        if (!fecha) {
            return null;
        } else {
            const [y, m, d] = fecha.split('-');
            let _fecha = new Date(+y, m-1, +d);
            return _fecha;
        }
    }

    const editCompra = (compra) => {
        setCompra({ ...compra });
        setCompraDialog(true);
        //
        setEmpleado(getEmpleado(compra.idEmpleado));
        setFechaCompra_(getFecha(compra.fechaCompra));
        setFechaDespacho_(getFecha(compra.fechaDespacho));
        setFechaRecibido_(getFecha(compra.fechaRecibido));
        //
        let _detalles=[];
        compraDetalles.map((item) => {
            if(item.idCompra == compra.idCompra) {
                _detalles.push(item);
            }
        });
        setDetalles(_detalles);
    }

    const confirmDeleteCompra = (compra) => {
        setCompra(compra);
        setDeleteCompraDialog(true);
    }

    const deleteCompra = async () => {
        try {
            const compraService = new CompraService();
            await compraService.removeCompra(compra.idCompra);
            listarCompras();
            setDeleteCompraDialog(false);
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Compra Eliminada', life: 3000 });
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        }
    }

    const cols = [
        { field: 'idCompra', header: 'ID' },
        { field: 'empleado', header: 'Empleado' },
        { field: 'fechaCompra', header: 'Fecha Compra' },
        { field: 'fechaDespacho', header: 'Fecha Despacho' },
        { field: 'fechaRecibido', header: 'Fecha de Entrega' },
        { field: 'noComprobante', header: 'No. de Comprobante' }
    ]

    const exportColumns = cols.map(col => ({ title: col.header, dataKey: col.field }));
    
    let objModificado = compras.map(function (element) {
        return {
            idCompra: element.idCompra,
            empleado: element.empleado.nombre,
            fechaCompra: element.fechaCompra,
            fechaDespacho: element.fechaDespacho?element.fechaDespacho:"Pendiente",
            fechaRecibido: element.fechaRecibido?element.fechaRecibido:"Pendiente",
            noComprobante: element.noComprobante
        };
    });


    const exportCSV = (selectionOnly) => {
        dt.current.exportCSV({ selectionOnly });
    };
    const exportPdf = () => {
        import('jspdf').then((jsPDF) => {
            import('jspdf-autotable').then(() => {
                const doc = new jsPDF.default('portrait');
                var image = new Image();
                var fontSize = doc.internal.getFontSize();
                const docWidth = doc.internal.pageSize.getWidth();
                const docHeight = doc.internal.pageSize.getHeight();
                const txtWidth = doc.getStringUnitWidth('COMPRAS REALIZADAS') * fontSize / doc.internal.scaleFactor;
                const x = (docWidth - txtWidth) / 2;
                image.src = '../layout/images/img_facturalogo2.png';
                doc.addImage(image, 'PNG', 10, 0, 50, 30);
                //centrar texto:
                doc.text('COMPRAS REALIZADAS', x, 15);
                doc.setFontSize(12);
                doc.text(15, 30, 'Usuario: ' + session.user.name);
                doc.text(15, 36, 'Fecha: ' + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString());
                doc.text(docWidth - 15, 30, 'Total Compras: ' + compras.length, { align: "right" });
                doc.line(15, 40, docWidth - 15, 40);
                doc.autoTable(exportColumns, objModificado, { margin: { top: 45, bottom: 25 } });
                const pageCount = doc.internal.getNumberOfPages();
                for (var i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    doc.line(15, docHeight - 20, docWidth - 15, docHeight - 20);
                    doc.text('Página ' + String(i) + '/' + pageCount, docWidth - 15, docHeight - 10, { align: "right" });
                }
                doc.save('Reporte_Compras.pdf');
            });
        });
    };

    const exportExcel = () => {
        var tbl = document.getElementById('TablaCompras');
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(objModificado);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array'
            });

            saveAsExcelFile(excelBuffer, 'Reporte_Compras');
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


    const onInputChange = (e, nombre) => {
        //empleado
        const val = (e.target && e.target.value) || '';
        let _Compra = { ...compra };

        if (nombre == 'empleado') {
            _Compra[`${nombre}`]=val;
            setEmpleado(e.value);
        } else if (nombre == 'idRepuesto') {
            setRepuesto(e.value);    
        } 
        else {
            _Compra[`${nombre}`] = val;
        }
        setCompra(_Compra);
    }

    const onInputDetalleChange = (e, nombre, rowData) => {
        const findIndexById = (id) => {
            let index = -1;
            for (let i = 0; i < detalles.length; i++) {
                if (detalles[i].idCompraDetalle === id) {
                    index = i;
                    break;
                }
            }
            return index;
        };
        const val = (e.target && e.target.value) || '';
        let _detalles = [...detalles];
        let _detalle = {...rowData};
        _detalle[`${nombre}`]=val;

        let index = findIndexById(_detalle.idCompraDetalle);
        _detalles[index]=_detalle;
        setDetalles(_detalles);
    }

    const toggleAll = () => {
        if (allExpanded) collapseAll();
        else expandAll();
    };

    const expandAll = () => {
        let _expandedRows = {};
        compras.forEach((p) => (_expandedRows[`${p.idCompra}`] = true));

        setExpandedRows(_expandedRows);
        setAllExpanded(true);
    };

    const collapseAll = () => {
        setExpandedRows(null);
        setAllExpanded(false);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    {agregar?<Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />:null}
                    {verLista?<Button icon={allExpanded ? 'pi pi-minus' : 'pi pi-plus'} label={allExpanded ? 'Colapsar Todas' : 'Expandir Todas'} onClick={toggleAll} className="w-12rem" 
                    disabled={!compras || !compras.length} />:null}
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

    const idBodyTemplate = (rowData) => {
        return (
            <>
                {rowData.idCompra}
            </>
        );
    }

    const empleadoBodyTemplate = (rowData) => {
        return (
            <>
                {rowData.empleado.nombre}
            </>
        );
    }

    const fechaCompraBodyTemplate = (rowData) => {
        return (
            <>
                {rowData.fechaCompra}
            </>
        );
    }

    const fechaDespachoBodyTemplate = (rowData) => {
        let despacho = (!rowData.fechaDespacho) ? 'Pendiente' : rowData.fechaDespacho; 
        const templateClass = classNames({
            'outofstock': !rowData.fechaDespacho,
            '': rowData.fechaDespacho
        });
        return (
            <>
                <span className="p-column-title">Fecha de Despacho</span>
                <div className={templateClass}>
                    {despacho}
                </div>
            </>
        );
    }

    const fechaRecibidoBodyTemplate = (rowData) => {
        let entrega = (!rowData.fechaRecibido) ? 'Pendiente' : rowData.fechaRecibido; 
        const templateClass = classNames({
            'outofstock': !rowData.fechaRecibido,
            '': rowData.fechaRecibido
        });
        return (
            <>
                <span className="p-column-title">Fecha de Entrega</span>
                <div className={templateClass}>
                    {entrega}
                </div>
            </>
        );
    }

    const comprobanteBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">No. de Comprobante</span>
                {rowData.noComprobante}
            </>
        );
    }

    const cantidadBodyTemplate = (rowData) => {
        let x = 2;
        let _repuestos=[...repuestos];
        _repuestos.map((item) => {
            if(item.idRepuesto === rowData.idRepuesto) {
                x=(item.stockMaximo-item.stockActual);
            }
        });
        return <InputNumber value={rowData.cantidad} onValueChange={(e) => onInputDetalleChange(e, "cantidad", rowData)} showButtons mode="decimal" min={1} max={x}
        tooltip="No podrá colocar un valor que supere al Stock Máximo del Repuesto"/>
    };

    const precioBodyTemplate = (rowData) => {
        
        return <InputNumber value={rowData.precio} onValueChange={(e) => onInputDetalleChange(e, "precio", rowData)} min={1} max={200000} mode='currency' currency='HNL' locale='en-US' 
        tooltip="No podrá colocar un valor mayor o igual al del Precio de Venta del repuesto"/>
    };

    const precioDetalleBodyTemplate = (rowData) => {
        const format = (value) => {
            return value.toLocaleString('en-US');
        };
        return "L." + format(rowData.precio);
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                {actualizar?<Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editCompra(rowData)} />:null}
                {eliminar?<Button icon="pi pi-trash" className="p-button-rounded p-button-warning mt-2" onClick={() => confirmDeleteCompra(rowData)} />:null}
            </div>
        );
    }

    const actionDetalleBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <Button icon="pi pi-times" className="p-button-rounded p-button-danger p-button-text" 
                aria-label="Cancelar" onClick={() => eliminarDetalle(rowData)}/>
            </div>
        );
    }

    const eliminarDetalle = (detalle) => {
        let _detalles = detalles.filter((val) => val.idCompraDetalle !== detalle.idCompraDetalle);
        setDetalles(_detalles);
        toast.current.show({ severity: 'info', summary: 'Éxito', detail: 'Detalle eliminado', life: 3000 });
    };

    const filter = (e) => {
        let x = e.target.value;

        if (x.trim() != '') 
            setGlobalFilter(x);
        else
            setGlobalFilter(' ');
    }

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Listado de Compras</h5>
            {buscar?<span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => filter(e)} placeholder="Buscar..." />
            </span>:null}
        </div>
    );

    const d_filter = (e) => {
        let x = e.target.value;
        if(x.trim() != '') 
            setDetalleFilter(x);
        else    
            setDetalleFilter(' ');
    }

    const headerDetalle = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => d_filter(e)} placeholder="Buscar Detalle de la Compra..."
                disabled={!detalles || !detalles.length} />
            </span>
        </div>
    );

    const compraDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" className="p-button-text" onClick={saveCompra} />
        </>
    );
    const deleteCompraDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteCompraDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteCompra} />
        </>
    );

    const repBodyTemplate = (rowData) => {
        let nombre = '';
        repuestos.map((item) => {
            if(item.idRepuesto == rowData.idRepuesto) {
                nombre = item.idRepuesto  + '- ' + item.nombre;
            }
        });
        return nombre;
    };


    const rowExpansionTemplate = (data) => {
        let table = [];
        compraDetalles.map((item) => {
            if (item.idCompra == data.idCompra) {
                table.push(item);
            }
        });
        return (
            <div className="orders-subtable">
                <h5>Detalle de la Compra: {data.idCompra} </h5>
                <DataTable value={table} 
                editMode="cell" 
                className="editable-cells-table"
                responsiveLayout="scroll"
                emptyMessage="No se encontraron detalles de la compra.">
                    <Column field="idCompraDetalle" header="Código de Detalle" sortable headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                    <Column field="idRepuesto" header="Repuesto" sortable body={repBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                    <Column field="cantidad" header="Cantidad" sortable  headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                    <Column field="precio" header="Precio" sortable body={precioDetalleBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                </DataTable>
            </div>
        );
    };

    const agregarDetalle = () => {
        const Toast = (message) => {
            toast.current.show({ severity: 'warn', summary: 'Error', detail: message, life: 3000 });
        };
        const crearId = () => {
            let id = '';
            let chars = '0123456789';
            for (let i = 0; i < 5; i++) {
                id += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return id;
        };
        if (repuesto) {
            //evitar que agregue repuesto repetido al detalle
            let _detalles = [...detalles];
            let hasRepuesto = _detalles.some((item) => {
                return item.idRepuesto === repuesto.idRepuesto;
            });
            if (hasRepuesto===false) {
                if(inputNumberValue) {
                    //validar cuanta cantidad se puede comprar
                    let x=false;
                    let _repuestos=[...repuestos];
                    _repuestos.map((item) => {
                        if(item.idRepuesto === repuesto.idRepuesto && inputNumberValue>(item.stockMaximo-item.stockActual)) {
                            x=true;
                        }
                    });
                    if(!x) {
                        if(precioValue) {
                            //agregar detalle
                            let id = crearId();
                            let idCompra = (!compra.idCompra) ? undefined : compra.idCompra;
                            let detalleVacio = {
                                idCompraDetalle: -id,
                                idCompra: idCompra,
                                idRepuesto: repuesto.idRepuesto,
                                cantidad: inputNumberValue,
                                precio: precioValue
                            };
                            _detalles.push(detalleVacio);
                            setDetalles(_detalles);
                            setRepuesto(null);
                            setInputNumberValue(null);
                            setPrecioValue(null);

                        } else 
                            Toast("Indique el precio, no puede ser igual a cero");
                    } else 
                        Toast("Cantidad supera a la del Stock Máximo del Repuesto");
                } else 
                    Toast("Indique cantidad");
            } else 
                Toast('El repuesto: ' + repuesto.nombre + ' ya ha sido agregado al detalle!');
        } else 
            Toast("Debe seleccionar el repuesto a agregar");
    }; 

    if(cargando){
        return 'Cargando...'
    }
    if (permisos.length > 0) {
        return (
            <div className="grid crud-demo datatable-style-demo">
                <div className="col-12">
                    <div className="card">
                        <Toast ref={toast} />
                        <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                        {verLista?<DataTable
                            ref={dt}
                            value={compras}
                            dataKey="idCompra"
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25]}
                            className="datatable-responsive"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} compras" 
                            globalFilter={globalFilter}
                            emptyMessage="No se encontraron compras."
                            header={header}
                            responsiveLayout="scroll"
                            expandedRows={expandedRows}
                            onRowToggle={(e) => setExpandedRows(e.data)}
                            rowExpansionTemplate={rowExpansionTemplate}
                        >
                            <Column expander style={{ width: '3em' }} />
                            <Column field="idCompra" header="Código" sortable body={idBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                            <Column field="fechaCompra" header="Fecha de Compra" sortable body={fechaCompraBodyTemplate} headerStyle={{ width: '18%', minWidth: '10rem' }}></Column>
                            <Column field="fechaDespacho" header="Fecha de Despacho" body={fechaDespachoBodyTemplate} sortable headerStyle={{ width: '18%', minWidth: '8rem' }}></Column>
                            <Column field="fechaRecibido" header="Fecha de Entrega" body={fechaRecibidoBodyTemplate} sortable headerStyle={{ width: '18%', minWidth: '8rem' }}></Column>
                            <Column field="empleado.nombre" header="Empleado" sortable body={empleadoBodyTemplate} headerStyle={{ width: '18%', minWidth: '10rem' }}></Column>
                            <Column field="noComprobante" header="No. de Comprobante" sortable body={comprobanteBodyTemplate} headerStyle={{ width: '18%', minWidth: '10rem' }}></Column>
                            <Column header="Acciones" body={actionBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        </DataTable>:null}
                        <Dialog visible={compraDialog} style={{ width: '720px' }} header="Registro Compra" modal className="p-fluid" footer={compraDialogFooter} onHide={hideDialog}>
                            <div className='card' style={{ width: '640px' }}>   
                                <div className="field">
                                    <label htmlFor="idEmpleado">Empleado</label>
                                    <Dropdown id="idEmpleado" options={empleados} value={compra.empleado} onChange={(e) => onInputChange(e, 'empleado')} optionLabel={"nombre"} 
                                    emptyMessage="No se encontraron empleados" className={classNames({ 'p-invalid': submitted && !compra.empleado })} />
                                    {submitted && !compra.empleado && <small className="p-invalid">El empleado es requerido.</small>}
                                </div>
                                <div className="field">
                                    <label htmlFor="fechaCompra">Fecha de Compra</label>
                                    <Calendar inputId="fechaCompra" value={fechaCompra_} showIcon showButtonBar onChange={(e) => onInputChange(e, 'fechaCompra')} dateFormat="yy-mm-dd"
                                    readOnlyInput placeholder='Seleccione fecha de compra'  className={classNames({ 'p-invalid': submitted && !compra.fechaCompra })}
                                    tooltip="Utiliza la fecha de hoy"></Calendar>                
                                    {submitted && !compra.fechaCompra && <small className="p-invalid">La fecha de compra es requerida.</small>}
                                </div>
    
                                <div className='formgrid grid'>
                                    <div className="field col">
                                        <label htmlFor="fechaDespacho">Fecha de Despacho</label>
                                        <Calendar inputId="fechaDespacho" value={fechaDespacho_} showIcon showButtonBar onChange={(e) => onInputChange(e, 'fechaDespacho')} dateFormat="yy-mm-dd"
                                         placeholder='Seleccione fecha de despacho' 
                                        tooltip="Fecha de despacho no puede ser una fecha anterior a la fecha de compra"></Calendar>                
                                    </div>
                                    <div className="field col">
                                        <label htmlFor="fechaRecibido">Fecha de Entrega</label>
                                        <Calendar inputId="fechaRecibido" value={fechaRecibido_} showIcon showButtonBar onChange={(e) => onInputChange(e, 'fechaRecibido')} dateFormat="yy-mm-dd"
                                         placeholder='Seleccione fecha de entrega'  
                                        tooltip="Fecha de Entrega no puede ser una fecha anterior a la fecha de despacho"></Calendar>                
                                    </div>
                                </div>
                                <div className="field">
                                    <label htmlFor="noComprobante">Número de Comprobante</label>
                                    <InputText id="noComprobante" maxLength={20} value={compra.noComprobante} onChange={(e) => onInputChange(e, 'noComprobante')} tooltip="Indique no. de Comprobante sin espacios, puntos o guiones"
                                    className={classNames({ 'p-invalid': submitted && !compra.noComprobante })}/>
                                    {submitted && !compra.noComprobante && <small className="p-invalid">El número de comprobante es requerido.</small>}
                                </div>
                            </div>      
    
                            <div className='card' style={{ width: '640px' }}>
                                <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                                    <h5 className="m-20">Detalle de Compra</h5>
                                </div>
                                <div className='formgrid grid'>
                                    <div className='field col'>
                                        <hr></hr>
                                        <Dropdown id="idRepuesto" options={repuestos} value={repuesto} onChange={(e) => onInputChange(e, 'idRepuesto')} optionLabel="nombre" filter showClear filterBy="idRepuesto" 
                                        emptyMessage="No se encontraron repuestos." emptyFilterMessage="No hay opciones disponibles."
                                        placeholder="Seleccione un repuesto a agregar"></Dropdown>
                                    </div>
                                    <div className='field col'>
                                        <hr></hr>
                                        <InputNumber id='cantidad' value={inputNumberValue} onValueChange={(e) => setInputNumberValue(e.value)} showButtons mode="decimal"
                                        min={1} placeholder='#' tooltip='Indique cantidad'></InputNumber>
                                    </div>
                                </div>
                               
                                <div className='formgrid grid'>
                                    <div className='field col'>
                                        <InputNumber id="precio" value={precioValue} onValueChange={(e) => setPrecioValue(e.value)} min={0} max={200000} mode='currency' currency='HNL' locale='en-US' 
                                        placeholder='Precio unitario' tooltip="No se permiten valores mayores a 200,000"/>
                                        <hr></hr>
                                    </div>
                                    <div className='field col-3'>
                                        <Button type='button' label="Agregar" icon="pi pi-plus" className="p-button-outlined p-button-primary ml-auto" onClick={agregarDetalle} />
                                        <hr></hr>
                                    </div>
                                </div>
    
                                <DataTable 
                                ref={dt}
                                value={detalles}
                                dataKey="idCompraDetalle"
                                paginator
                                rows={10}
                                rowsPerPageOptions={[5, 10, 25]}
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} detalles" 
                                className="datatable-responsive editable-cells-table"
                                emptyMessage="No se han agregado detalles de la compra."
                                header={headerDetalle}
                                globalFilter={detalleFilter}
                                responsiveLayout="scroll"
                                >
                                    <Column field="idRepuesto" header="Repuesto" body={repBodyTemplate} sortable headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                                    <Column field="cantidad" header="Cantidad" body={cantidadBodyTemplate} sortable headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                                    <Column field="precio" header="Precio" body={precioBodyTemplate} sortable headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                                    <Column header="Eliminar" body={actionDetalleBodyTemplate} headerStyle={{ width: '8%', minWidth: '3em' }} bodyStyle={{ textAlign: 'center' }}></Column>                
                                </DataTable>
                            </div>
                            
                            
                        </Dialog> 
    
                        <Dialog visible={deleteCompraDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteCompraDialogFooter} onHide={hideDeleteCompraDialog}>
    
                            <div className="flex align-items-center justify-content-center">
                                <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                                {compra && <span>¿Está seguro de que desea eliminar a la compra: <b>{compra.idCompra}</b>?</span>}
                            </div>
                        </Dialog>
    
                    </div>
                </div>
            </div>
        );
    } else {
        return (
            <h2>No tiene permisos disponibles para este módulo! </h2>
        )
    } 
};
export async function getServerSideProps({req}){
    return autenticacionRequerida(req,({session}) =>
    {
        return{
            props:{session}
        }
    })
}
export default Compras;
