import { Calendar } from 'primereact/calendar';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import React, { useEffect, useRef, useState } from 'react';
import { CompraService } from '../../demo/service/CompraService';
import { CompraDetalleService } from '../../demo/service/CompraDetalleService';
import { RepuestoService } from '../../demo/service/RepuestoService';
import { EmpleadoService } from '../../demo/service/EmpleadoService';
import { DevolucionCompraService } from '../../demo/service/DevolucionCompraService';

const DevolucionCompra = () => {

    let devolucionVacia = { 
        idRepuesto: undefined,
        idCompraDetalle: undefined,
        cantCompra: undefined,
        fecha: undefined,
        cantDevolver: undefined,
        motivo: ''
    }

    let compraVacia = {
        idCompra: null,
        idEmpleado: null,
        fechaCompra: null,
        fechaDespacho: null,
        fechaRecibido: null,
        noComprobante: '',
    };

    const [devolucionesCompra, setDevolucionesCompra] = useState([]);
    const [devolucionCompraDialog, setDevolucionCompraDialog] = useState(false);
    const [deleteDevolucionCompraDialog, setDeleteDevolucionCompraDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const [devoluciones, setDevoluciones] = useState([]);
    const [devolucionesEditar, setDevolucionesEditar] = useState(false);

    //nueva devolucion
    const [dropdownRepuestos, setDropdownRepuestos] = useState([]);
    const [devolucion, setDevolucion] = useState(devolucionVacia);
    const [devolucionFilter, setDevolucionFilter] = useState(null);

    //overlay panel
    const [selectedCompra, setSelectedCompra] = useState(compraVacia);
    const [compraFilter, setCompraFilter] = useState(null);
    const op = useRef(null);
    const isMounted = useRef(false);

    //compras, repuestos
    const [compras, setCompras] = useState([]);
    const [comprasOverlay, setComprasOverlay] = useState([]);
    const [comprasConDevolucion, setComprasConDevolucion] = useState([]);
    const [repuesto, setRepuesto] = useState(null);
    const [repuestos, setRepuestos] = useState([]);
    const [empleados, setEmpleados] = useState([]);

    //detalle de compra
    const [allExpanded, setAllExpanded] = useState(false);
    const [compraDetalles, setCompraDetalles] = useState([]);
    const [expandedRows, setExpandedRows] = useState([]);

    const listarDevolucionesCompra = () => {
        const devolucionService = new DevolucionCompraService();
        devolucionService.getDevolucionesCompra().then(data => setDevolucionesCompra(data));
    };

    const listarCompras = () => {
        const compraService = new CompraService();
        let compras_=[];
        compraService.getCompras().then(data => { 
            devolucionesCompra.map((dev) => {
                compraDetalles.map((det) => {
                    data.map((compra) => {
                        if(dev.idCompraDetalle===det.idCompraDetalle && det.idCompra===compra.idCompra) {
                            if (!compras_.some((item) => {return item.idCompra === compra.idCompra})) {
                                compras_.push(compra);
                            }
                        }
                    });
                });
            })
            setCompras(data);
        })
        setComprasConDevolucion(compras_);
    };

    const listarDetallesCompra = () => {
        const detalleService = new CompraDetalleService();
        detalleService.getDetallesCompra().then(data => setCompraDetalles(data));
    };

    const listarRepuestos = () => {
        const repuestoService = new RepuestoService();
        repuestoService.getRepuestos().then(data => setRepuestos(data));
    };

    const listarEmpleados = () => {
        const empleadoService = new EmpleadoService();
        empleadoService.getEmpleados().then(data => setEmpleados(data));
    };

    useEffect(() => {
        isMounted.current = true;
        listarDetallesCompra();
        listarDevolucionesCompra();
        listarRepuestos();
        listarEmpleados();
    }, []); 

    useEffect(() => {
        if(devolucionesCompra && devolucionesCompra.length && compraDetalles && compraDetalles.length)
            listarCompras();
    }, [devolucionesCompra]);

    useEffect(() => {
        if (isMounted.current && selectedCompra) {
            op?.current?.hide();
            setearDropdown();
            setRepuesto(null);
            setCompraFilter(' ');
            setDevolucion(devolucionVacia);
            if(devolucionesCompra) {
                let _devoluciones=[];
                compraDetalles.map((det) => {
                    devolucionesCompra.map((item) => {
                        if(det.idCompra===selectedCompra.idCompra && 
                            det.idCompraDetalle===item.idCompraDetalle) {
                            _devoluciones.push(item);
                        }
                    })
                });
                let x = (_devoluciones.length>0) ? true : false;
                setDevolucionesEditar(x);
                setDevoluciones(_devoluciones);
            }
        }
    }, [selectedCompra]);

    const setearDropdown = () => {
        let dropdown=[];
        compraDetalles.map((detalle) => {
            repuestos.map((repuesto) => {
                if(detalle.idCompra===selectedCompra.idCompra 
                    && detalle.idRepuesto===repuesto.idRepuesto) {
                    dropdown.push(repuesto);
                }
            });
        });
        setDropdownRepuestos(dropdown);
    }

    const setearOverlay = () => {
        let overlay=[];
        compras.map((item) => {
            if(item.fechaRecibido) {
                overlay.push(item);
            }
        });
        setComprasOverlay(overlay);
    }

    const openNew = () => {
        setDevoluciones([]);
        setDevolucion(devolucionVacia);
        setDevolucionesEditar(false);
        setSelectedCompra(compraVacia);
        setSubmitted(false);
        setDevolucionCompraDialog(true);
        setearOverlay();
    }

    const hideDialog = () => {
        setSubmitted(false);
        setDevolucionCompraDialog(false);
        //
        setRepuesto(null);
    }

    const hideDeleteDevolucionCompraDialog = () => {
        setDeleteDevolucionCompraDialog(false);
    }

    const pasoRegistro = () => {
        listarDevolucionesCompra();
        setDevolucionCompraDialog(false);
        //
        setSelectedCompra(compraVacia);
        setDevolucion(devolucionVacia);
        setDevolucionesEditar(false);
    }

    const saveCompra = async () => {
        setSubmitted(true);

        if (selectedCompra.idCompra) {
            if (devolucionesEditar===true) {
                try {
                    //actualizar
                    const devolucionService = new DevolucionCompraService();
                    await devolucionService.addDevolucionesCompra(devoluciones);
                    toast.current.show({ severity: 'success', summary: '??xito', detail: 'Devoluci??n de Compra Actualizada', life: 3000 });
                    pasoRegistro();
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails , life: 3000 });
                }
            }
            else {
                try {
                    //agregar 
                    if(devoluciones.length>0) {
                        const devolucionService = new DevolucionCompraService();
                        await devolucionService.addDevolucionesCompra(devoluciones);
                        toast.current.show({ severity: 'success', summary: '??xito', detail: 'Devoluci??n de Compra Creada', life: 3000 });
                        pasoRegistro();
                    } else {
                        toast.current.show({ severity: 'error', summary: 'Error', detail: "No ha agregado devoluci??n a la compra", life: 3000 });  
                    }
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails , life: 3000 });   
                }
            }
        } else {
            toast.current.show({ severity: 'error', summary: 'Error', detail: "Indique Compra", life: 3000 });   
        }
    }

    const editDevolucion = (compra) => {
        setSelectedCompra({ ...compra });
        setDevolucionCompraDialog(true);
        //
        let _devoluciones=[];
        compraDetalles.map((det) => {
            devolucionesCompra.map((item) => {
                if(det.idCompra===compra.idCompra && 
                    det.idCompraDetalle===item.idCompraDetalle) {
                    _devoluciones.push(item);
                }
            })
        });
        setDevoluciones(_devoluciones);
        setDevolucionesEditar(true);
        //
    }

    const confirmDeleteCompra = (compra) => {
        setSelectedCompra(compra);
        let _devoluciones=[];
        compraDetalles.map((det) => {
            devolucionesCompra.map((item) => {
                if(det.idCompra===compra.idCompra && 
                    det.idCompraDetalle===item.idCompraDetalle) {
                    _devoluciones.push(item);
                }
            })
        });
        setDevoluciones(_devoluciones);
        setDeleteDevolucionCompraDialog(true);
    }

    const deleteCompra = async () => {
        try {
            const devolucionService = new DevolucionCompraService();
            devoluciones.map(async (item) => {
                await devolucionService.removeDevolucionCompra(item.idDevolucion);
            });
            let _devoluciones = devolucionesCompra.filter(val => !devoluciones.includes(val));
            setDevolucionesCompra(_devoluciones);
            setDeleteDevolucionCompraDialog(false);
            toast.current.show({ severity: 'success', summary: '??xito', detail: 'Devoluci??n de Compra Eliminada', life: 3000 });
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        }
    }

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const cantidadCompra = (devolucion) => {
        compraDetalles.map((item) => {
            if (selectedCompra.idCompra===item.idCompra 
                && devolucion.idRepuesto===item.idRepuesto) {
                    devolucion.cantCompra=item.cantidad;
            } 
        });
    };

    const onInputChange = (e, nombre) => {
        const val = (e.target && e.target.value) || '';
        let _devolucion = { ...devolucion };

        if (nombre == 'idRepuesto') {
            _devolucion[`${nombre}`]=val.idRepuesto;
            setRepuesto(e.value);
            (_devolucion.idRepuesto===undefined) ? _devolucion.cantCompra=undefined : cantidadCompra(_devolucion);
            compraDetalles.map((item) => {
                if(item.idCompra===selectedCompra.idCompra && item.idRepuesto===val.idRepuesto) {
                    _devolucion.idCompraDetalle=item.idCompraDetalle;
                }
            })
        } 
        else {
            _devolucion[`${nombre}`] = val;
        }
        setDevolucion(_devolucion);
    }

    const onInputDevolucionesChange = (e, nombre, rowData) => {
        const findIndexById = (id) => {
            let index = -1;
            for (let i = 0; i < devoluciones.length; i++) {
                if (devoluciones[i].idDevolucion === id) {
                    index = i;
                    break;
                }
            }
            return index;
        };
        const val = (e.target && e.target.value) || '';
        let _devoluciones = [...devoluciones];
        let _devolucion = {...rowData};
        if(nombre==="fecha") 
            _devolucion[`${nombre}`]=getFecha(val);
        else
            _devolucion[`${nombre}`]=val;

        let index = findIndexById(_devolucion.idDevolucion);
        _devoluciones[index]=_devolucion;
        setDevoluciones(_devoluciones);
    }


    const toggleAll = () => {
        if (allExpanded) collapseAll();
        else expandAll();
    };

    const expandAll = () => {
        let _expandedRows = {};
        comprasConDevolucion.forEach((p) => (_expandedRows[`${p.idCompra}`] = true));

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
                    <Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                    <Button icon={allExpanded ? 'pi pi-minus' : 'pi pi-plus'} label={allExpanded ? 'Colapsar Todas' : 'Expandir Todas'} onClick={toggleAll} className="w-12rem" 
                    disabled={!comprasConDevolucion || !comprasConDevolucion.length} />
                </div>
            </React.Fragment>
        )
    }

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="Exportar" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />
            </React.Fragment>
        )
    }

    const idBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">C??digo</span>
                {rowData.idDevolucion}
            </>
        );
    }


    const cantBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Cantidad Devoluci??n</span>
                {rowData.cantidad}
            </>
        );
    }

    const fechaBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Fecha de Devoluci??n</span>
                {rowData.fecha}
            </>
        );
    }

    const motivoBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Motivo</span>
                {rowData.motivo}
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

    const empleadoBodyTemplate = (rowData) => {
        let nombre = '';
        empleados.map((item) => {
            if (rowData.idEmpleado == item.idEmpleado) {
                nombre = item.nombre;
            }
        });
        return (
            <>
                <span className="p-column-title">Nombre</span>
                {nombre}
            </>
        );
    }

    const fechaEditarBodyTemplate = (rowData) => {
        let fecha=new Date();
        const getFecha_ = (fecha) => {
            if (!fecha) {
                return undefined;
            } else {
                const [y, m, d] = fecha.split('-');
                let _fecha = new Date(+y, m-1, +d);
                return _fecha;
            }
        }
        return <Calendar value={getFecha_(rowData.fecha)} showIcon showButtonBar onChange={(e) => onInputDevolucionesChange(e, "fecha", rowData)} dateFormat="yy-mm-dd"
         tooltip="Seleccione la fecha de Devoluci??n" minDate={fecha} maxDate={fecha}></Calendar>
    };

    const cantidadEditarBodyTemplate = (rowData) => {
        let detalle_=''; 
        compraDetalles.map((detalle) => {
            if(rowData.idCompraDetalle===detalle.idCompraDetalle) {
                detalle_=detalle.cantidad;
            }
        });
        
        return <InputNumber value={rowData.cantidad} onValueChange={(e) => onInputDevolucionesChange(e, "cantidad", rowData)} showButtons mode="decimal"
        min={1} max={ detalle_ } tooltip='No podr?? colocar un valor mayor al de compra' ></InputNumber>                          
    };

    const motivoEditarBodyTemplate = (rowData) => {
        return <InputText value={rowData.motivo} onChange={(e) => onInputDevolucionesChange(e, "motivo", rowData)} tooltip="Indique motivo de devoluci??n de manera breve"></InputText>
    };

    const idDetalleBodyTemplate = (rowData) => {
        let detalle_='';
        compraDetalles.map((detalle) => {
            repuestos.map((repuesto) => {
                if(rowData.idCompraDetalle===detalle.idCompraDetalle
                    && detalle.idRepuesto===repuesto.idRepuesto) {
                    detalle_=repuesto.idRepuesto +'- '+repuesto.nombre;
                }
            })
        });
        return detalle_;
    };

    const cantDetalleBodyTemplate = (rowData) => {
        let detalle_='';
        compraDetalles.map((detalle) => {
            if(rowData.idCompraDetalle===detalle.idCompraDetalle) {
                detalle_=detalle.cantidad;
            }
        });
        return detalle_;
    };


    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editDevolucion(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning mt-2" onClick={() => confirmDeleteCompra(rowData)} />
            </div>
        );
    }

    const actionDevolucionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <Button icon="pi pi-times" className="p-button-rounded p-button-danger p-button-text" 
                aria-label="Cancelar" onClick={() => eliminarDevolucion(rowData)}/>
            </div>
        );
    }

    const eliminarDevolucion = (devolucion) => {
        let _devoluciones = devoluciones.filter((val) => val.idDevolucion !== devolucion.idDevolucion);
        setDevoluciones(_devoluciones);
        toast.current.show({ severity: 'info', summary: '??xito', detail: 'Devoluci??n eliminada', life: 3000 });
    };

    const filter = (e, nombre) => {
        let x = e.target.value;
        let filter_ = (x.trim()!='') ? x : ' ';

        if(nombre==='globalFilter') 
            setGlobalFilter(filter_);
        else if(nombre==='compraFilter')
            setCompraFilter(filter_);
        else //devolucion
            setDevolucionFilter(filter_);
    }

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Listado de Devoluciones de Compras</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => filter(e, 'globalFilter')} placeholder="Buscar..." />
            </span>
        </div>
    );

    const headerCompra = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => filter(e, 'compraFilter')} placeholder="Buscar Compra..."
                disabled={!comprasOverlay || !comprasOverlay.length} />
            </span>
        </div>
    );

    const headerDev = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => filter(e, 'devFilter')} placeholder="Buscar Devoluci??n de la Compra..."
                disabled={!devoluciones || !devoluciones.length} />
            </span>
        </div>
    );


    const devolucionCompraDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" className="p-button-text" onClick={saveCompra} />
        </>
    );
    const deleteCompraDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteDevolucionCompraDialog} />
            <Button label="S??" icon="pi pi-check" className="p-button-text" onClick={deleteCompra} />
        </>
    );

    const onCompraSelect = (e) => {
        setSelectedCompra(e.value);
    };

    const getFecha = (fecha) => {
        const getDay = (day) => {
            return (day < 10) ? '0'+day : day;
        };
        const getMonth = (month) => {
            return ((month + 1) < 10) ? "0"+(month+1) : (month+1)
        };
        let _fecha = fecha.getFullYear() + "-" + getMonth(fecha.getMonth()) + "-" + getDay(fecha.getDate());
        return _fecha;
    };

    const agregarDevolucion = () => {
        const crearId = () => {
            let id = '';
            let chars = '0123456789';
            for (let i = 0; i < 5; i++) {
                id += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return id;
        };
        if(devolucion.idRepuesto && devolucion.cantDevolver && devolucion.fecha && devolucion.motivo) {
            let _devoluciones = [...devoluciones];
            let hasRepuesto = _devoluciones.some((item) => {
                return item.idCompraDetalle === devolucion.idCompraDetalle;
            });
            if(hasRepuesto===false) {
                let id = crearId();
                let devolucionVacia_ = {
                    idDevolucion: -id,
                    idCompraDetalle: devolucion.idCompraDetalle,
                    fecha: getFecha(devolucion.fecha),
                    cantidad: devolucion.cantDevolver,
                    motivo: devolucion.motivo
                };
                _devoluciones.push(devolucionVacia_);
                setDevoluciones(_devoluciones);
                setDevolucion(devolucionVacia);
                setRepuesto(null);
            }else {
                toast.current.show({ severity: 'warn', summary: 'Error', detail: "El repuesto: " + repuesto.nombre + " ya ha sido agregado!", life: 3000 });
            }
        } else {
            toast.current.show({ severity: 'warn', summary: 'Error', detail: "Verifique campos vac??os", life: 3000 });
        }
    }; 

    const rowExpansionTemplate = (data) => {
        let table = [];
        compraDetalles.map((detalle) => {
            devolucionesCompra.map((item) => {
                if (detalle.idCompra===data.idCompra &&
                    detalle.idCompraDetalle===item.idCompraDetalle) {
                    table.push(item);
                }
            });
        });
        return (
            <div className="orders-subtable">
                <h5>Devoluciones de la Compra: {data.idCompra} </h5>
                <DataTable value={table} 
                editMode="cell" 
                className="editable-cells-table"
                responsiveLayout="scroll"
                emptyMessage="No se encontraron detalles de la compra.">
                    <Column field="idDevolucion" header="C??digo de Devoluci??n" sortable body={idBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                    <Column field="idCompraDetalle" header="C??digo Detalle de Compra" sortable  headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                    <Column field="fecha" header="Fecha Devoluci??n" sortable body={fechaBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                    <Column header="Repuesto" sortable body={idDetalleBodyTemplate} headerStyle={{ width: '12%', minWidth: '10rem' }} ></Column>
                    <Column header="Cantidad Compra" sortable body={cantDetalleBodyTemplate} headerStyle={{ width: '12%', minWidth: '10rem' }} ></Column>
                    <Column field="cantidad" header="Cantidad Devoluci??n" body={cantBodyTemplate} sortable headerStyle={{ width: '14%', minWidth: '8rem' }}></Column>
                    <Column field="motivo" header="Motivo" body={motivoBodyTemplate} sortable headerStyle={{ width: '18%', minWidth: '8rem' }}></Column>
                </DataTable>
            </div>
        );
    };

    
    return (
        <div className="grid crud-demo datatable-style-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                    
                    <DataTable
                        ref={dt}
                        value={comprasConDevolucion}
                        dataKey="idCompra"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} compras" 
                        globalFilter={globalFilter}
                        emptyMessage="No se encontraron devoluciones de compras."
                        header={header}
                        responsiveLayout="scroll"
                        expandedRows={expandedRows} 
                        onRowToggle={(e) => setExpandedRows(e.data)}
                        rowExpansionTemplate={rowExpansionTemplate}
                    >
                        <Column expander style={{ width: '3em' }} />
                        <Column field="idCompra" header="C??digo" sortable  headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="fechaCompra" header="Fecha de Compra" sortable headerStyle={{ width: '18%', minWidth: '10rem' }}></Column>
                        <Column field="fechaDespacho" header="Fecha de Despacho" sortable headerStyle={{ width: '18%', minWidth: '8rem' }}></Column>
                        <Column field="fechaRecibido" header="Fecha de Entrega" sortable headerStyle={{ width: '18%', minWidth: '8rem' }}></Column>
                        <Column field="idEmpleado" header="Empleado" sortable body={empleadoBodyTemplate} headerStyle={{ width: '18%', minWidth: '10rem' }}></Column>
                        <Column field="noComprobante" header="No. de Comprobante" sortable body={comprobanteBodyTemplate} headerStyle={{ width: '18%', minWidth: '10rem' }}></Column>
                        <Column header="Acciones" body={actionBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={devolucionCompraDialog} style={{ width: '1200px' }} header="Devoluci??n de Compra" modal className="p-fluid" footer={devolucionCompraDialogFooter} onHide={hideDialog}>
                        
                        <div className='card' >
                            <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                                <h5 className="m-20">Compra a Aplicar Devoluci??n</h5>
                            </div>
                            <div className='formgrid grid' style={{ width: "500px" }}>
                                <div className='field col'>
                                    <hr></hr>
                                    <Button type="button" icon="pi pi-search" label={selectedCompra.idCompra ? selectedCompra.idCompra : 'Indique Compra'} onClick={(e) => op.current.toggle(e)} aria-haspopup aria-controls="overlay_panel" className="select-product-button" 
                                    tooltip='Solo puede seleccionar Compras cuya fecha de Entrega no est?? Pendiente' style={{ width: "200px" }}/>

                                    <OverlayPanel ref={op} showCloseIcon id="overlay_panel" style={{width: '450px'}} className="overlaypanel-demo">
                                        <DataTable value={comprasOverlay} selectionMode="single" paginator rows={5} header={headerCompra} emptyMessage="No se encontraron compras."
                                            selection={selectedCompra} onSelectionChange={onCompraSelect} globalFilter={compraFilter} >
                                            <Column field="idCompra" header="C??digo" sortable />
                                            <Column field="fechaCompra" header="Fecha de Compra" sortable />
                                            <Column field="noComprobante" header="N??mero de Comprobante" sortable  />
                                        </DataTable>
                                    </OverlayPanel>
                                    <hr></hr>
                                </div>
                                <div className='field col'>
                                    <hr></hr>
                                    <InputText id="noComprobante" value={selectedCompra ? selectedCompra.noComprobante : undefined} placeholder="N??mero de Comprobante"
                                    readOnly tooltip='No. de Comprobante'/>
                                    <hr></hr>
                                </div>
                            </div>
                            <div className='formgrid grid'>
                                <div className='field col'>
                                    <label htmlFor="idRepuesto">Repuesto</label>
                                    <Dropdown id="idRepuesto" options={dropdownRepuestos} value={repuesto} onChange={(e) => onInputChange(e, 'idRepuesto')} optionLabel="nombre" filter showClear filterBy="idRepuesto" 
                                    emptyMessage="No se encontraron repuestos." emptyFilterMessage="No hay opciones disponibles." disabled={!selectedCompra.idCompra}
                                    placeholder="Seleccione repuesto"></Dropdown>
                                </div>
                                <div className='field col'>
                                    <label htmlFor="cantidad">Cantidad Compra</label>
                                    <InputNumber id='cantidad' value={devolucion.cantCompra} mode="decimal" disabled
                                    readOnly ></InputNumber>
                                </div>
                                <div className='field col'>
                                    <label htmlFor="cantidad">Cantidad Devoluci??n</label>
                                    <InputNumber id='cantidad' value={devolucion.cantDevolver} onValueChange={(e) => onInputChange(e, 'cantDevolver')} showButtons mode="decimal"
                                    min={1} max={ !devolucion.cantCompra ? 2 : devolucion.cantCompra} tooltip='Indique cantidad a devolver' disabled={!selectedCompra.idCompra}></InputNumber>
                                
                                </div>
                               
                            </div>
                           
                            <div className='formgrid grid'>
                                <div className='field col'>
                                    <label htmlFor="fecha">Fecha</label>
                                    <Calendar inputId="fecha" value={devolucion.fecha} showIcon showButtonBar onChange={(e) => onInputChange(e, 'fecha')} dateFormat="yy-mm-dd"
                                    readOnlyInput disabled={!selectedCompra.idCompra} 
                                    tooltip="Seleccione la fecha de Devoluci??n"></Calendar>
                                </div>
                                <div className='field col'>
                                    <label htmlFor="motivo">Motivo</label>
                                    <InputText id="motivo" value={devolucion.motivo} onChange={(e) => onInputChange(e, 'motivo')} disabled={!selectedCompra.idCompra}   
                                    tooltip="Indique motivo de devoluci??n de manera breve" style={{ width:"515px" }} />
                                </div>
                                <div className='field col-3' style={{ width: "200px" }}>
                                    <hr></hr>
                                    <Button type='button' label="Agregar" icon="pi pi-plus" className="p-button-outlined p-button-primary ml-auto" disabled={!selectedCompra.idCompra} 
                                    onClick={agregarDevolucion} style={{ width: "200px" }}/>
                                    <hr></hr>
                                </div>
                            </div>

                            <DataTable 
                            ref={dt}
                            value={devoluciones}
                            dataKey="idDevolucion"
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25]}
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} devoluciones" 
                            className="datatable-responsive editable-cells-table"
                            emptyMessage="No se han agregado devoluciones de la compra."
                            header={headerDev}
                            globalFilter={devolucionFilter}
                            responsiveLayout="scroll"
                            >
                                <Column field="idCompraDetalle" header="C??digo de Detalle" sortable headerStyle={{ width: '8%', minWidth: '10rem' }}></Column>
                                <Column header="Repuesto" sortable body={idDetalleBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                                <Column field="fecha" header="Fecha" sortable body={fechaEditarBodyTemplate} headerStyle={{ width: '15%', minWidth: '10rem' }}></Column>
                                <Column header="Cantidad Compra" sortable body={cantDetalleBodyTemplate} headerStyle={{ width: '8%', minWidth: '10rem' }}></Column>
                                <Column field="cantidad" header="Cantidad Devoluci??n" sortable body={cantidadEditarBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                                <Column field="motivo" header="Motivo" sortable body={motivoEditarBodyTemplate} headerStyle={{ width: '20%', minWidth: '10rem' }}></Column>
                                <Column header="Eliminar" body={actionDevolucionBodyTemplate} headerStyle={{ width: '8%', minWidth: '3em' }} bodyStyle={{ textAlign: 'center' }}></Column>                
                            </DataTable>
                        </div>

                    </Dialog> 

                    <Dialog visible={deleteDevolucionCompraDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteCompraDialogFooter} onHide={hideDeleteDevolucionCompraDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {selectedCompra && <span>??Est?? seguro de que desea eliminar devoluciones en Compra: <b>{selectedCompra.idCompra}</b>?</span>}
                        </div>
                    </Dialog>

                </div>
            </div>
        </div>
    );
};

export default DevolucionCompra;
