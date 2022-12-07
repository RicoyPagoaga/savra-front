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

const Compras = () => {

    let compraVacia = {
        idCompra: null,
        idEmpleado: null,
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
    const toast = useRef(null);
    const dt = useRef(null);
    const [detalles, setDetalles] = useState([]);

    //fechas
    const [fechaCompra_, setFechaCompra_] = useState(null);
    const [fechaDespacho_, setFechaDespacho_] = useState(null);
    const [fechaRecibido_, setFechaRecibido_] = useState(null);

    //foraneas empleado, repuestos
    const [empleado, setEmpleado] = useState(null);
    const [empleados, setEmpleados] = useState([]);
    const [repuesto, setRepuesto] = useState(null);
    const [repuestos, setRepuestos] = useState([]);
    const [inputNumberValue, setInputNumberValue] = useState(null);

    //detalle de compra
    const [allExpanded, setAllExpanded] = useState(false);
    const [compraDetalles, setCompraDetalles] = useState([]);
    const [expandedRows, setExpandedRows] = useState([]);

    const listarCompras = () => {
        const compraService = new CompraService();
        compraService.getCompras().then(data => setCompras(data));
    };

    const listarDetallesCompra = () => {
        const detalleService = new CompraDetalleService();
        detalleService.getDetallesCompra().then(data => setCompraDetalles(data));
    };

    const listarEmpleados = () => {
        const empleadoService = new EmpleadoService();
        empleadoService.getEmpleados().then(data => setEmpleados(data));
    };

    const listarRepuestos = () => {
        const repuestoService = new RepuestoService();
        repuestoService.getRepuestos().then(data => setRepuestos(data));
    };

    useEffect(() => {
        listarCompras();
        listarDetallesCompra();
        listarEmpleados();
        listarRepuestos();
    }, []); 


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
        setFechaCompra_(null);
        setFechaDespacho_(null);
        setFechaRecibido_(null);
    }

    const saveCompra = async () => {
        setSubmitted(true);

        if (compra.idEmpleado) {
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

    const exportCSV = () => {
        dt.current.exportCSV();
    };


    const onInputChange = (e, nombre) => {
        //empleado
        const val = (e.target && e.target.value) || '';
        let _Compra = { ...compra };

        if (nombre == 'idEmpleado') {
            _Compra[`${nombre}`]=val.idEmpleado;
            setEmpleado(e.value);
        } else if (nombre == 'idRepuesto') {
            setRepuesto(e.value);    
        } 
        else {
            _Compra[`${nombre}`] = val;
        }
        setCompra(_Compra);
        console.log(_Compra);
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
                    <Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                    <Button icon={allExpanded ? 'pi pi-minus' : 'pi pi-plus'} label={allExpanded ? 'Colapsar Todas' : 'Expandir Todas'} onClick={toggleAll} className="w-12rem" 
                    disabled={!compras || !compras.length} />
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
                <span className="p-column-title">Código</span>
                {rowData.idCompra}
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

    const fechaCompraBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Fecha de Compra</span>
                {rowData.fechaCompra}
            </>
        );
    }

    const fechaDespachoBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Fecha de Despacho</span>
                {rowData.fechaDespacho}
            </>
        );
    }

    const fechaRecibidoBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Fecha de Entrega</span>
                {rowData.fechaRecibido}
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
        return <InputNumber value={rowData.cantidad} onValueChange={(e) => rowData.cantidad=e.value} showButtons mode="decimal" min={1} max={x}
        tooltip="No podrá colocar un valor que supere al Stock Máximo del Repuesto"/>
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editCompra(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning mt-2" onClick={() => confirmDeleteCompra(rowData)} />
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
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => filter(e)} placeholder="Buscar..." />
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
                    <Column field="idRepuesto" header="Repuesto" sortable body={repBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                    <Column field="cantidad" header="Cantidad" sortable  headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                </DataTable>
            </div>
        );
    };

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
                        //agregar detalle
                        let idCompra = (!compra.idCompra) ? undefined : compra.idCompra;
                        let detalleVacio = {
                            idCompraDetalle: 0,
                            idCompra: idCompra,
                            idRepuesto: repuesto.idRepuesto,
                            cantidad: inputNumberValue,
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
                }
            } else {
                Toast('El repuesto: ' + repuesto.nombre + ' ya ha sido agregado al detalle!');
            }
        } else {
            Toast("Debe seleccionar el repuesto a agregar");
        }
    }; 

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
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
                        <Column field="idEmpleado" header="Empleado" sortable body={empleadoBodyTemplate} headerStyle={{ width: '18%', minWidth: '10rem' }}></Column>
                        <Column field="noComprobante" header="No. de Comprobante" sortable body={comprobanteBodyTemplate} headerStyle={{ width: '18%', minWidth: '10rem' }}></Column>
                        <Column header="Acciones" body={actionBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={compraDialog} style={{ width: '720px' }} header="Registro Compra" modal className="p-fluid" footer={compraDialogFooter} onHide={hideDialog}>
                        <div className='card' style={{ width: '640px' }}>   
                            <div className="field">
                                <label htmlFor="idEmpleado">Empleado</label>
                                <Dropdown id="idEmpleado" options={empleados} value={empleado} onChange={(e) => onInputChange(e, 'idEmpleado')} optionLabel={"nombre"} 
                                emptyMessage="No se encontraron empleados" className={classNames({ 'p-invalid': submitted && !compra.idEmpleado })} />
                                {submitted && !compra.idEmpleado && <small className="p-invalid">El empleado es requerido.</small>}
                            </div>
                            <div className="field">
                                <label htmlFor="fechaCompra">Fecha de Compra</label>
                                <Calendar inputId="fechaCompra" value={fechaCompra_} showIcon showButtonBar onChange={(e) => onInputChange(e, 'fechaCompra')} dateFormat="yy-mm-dd"
                                placeholder='Seleccione fecha de compra'  className={classNames({ 'p-invalid': submitted && !compra.fechaCompra })}
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
                                <InputText id="noComprobante" value={compra.noComprobante} onChange={(e) => onInputChange(e, 'noComprobante')} tooltip="Indique no. de Comprobante sin espacios, puntos o guiones"
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
                                    <Dropdown id="idRepuesto" options={repuestos} value={repuesto} onChange={(e) => onInputChange(e, 'idRepuesto')} optionLabel="nombre" filter showClear filterBy="nombre" 
                                    emptyMessage="No se encontraron repuestos."
                                    placeholder="Seleccione un repuesto a agregar"></Dropdown>
                                </div>
                                <div className='field col'>
                                    <hr></hr>
                                    <InputNumber value={inputNumberValue} onValueChange={(e) => setInputNumberValue(e.value)} showButtons mode="decimal"
                                    min={1} placeholder='#' tooltip='Indique cantidad'></InputNumber>
                                </div>
                                <div className='field col-3'>
                                    <hr></hr>
                                    <Button type='button' label="Agregar" icon="pi pi-plus" className="p-button-outlined p-button-primary ml-auto" onClick={agregarDetalle} />
                                </div>
                            </div>

                            <DataTable 
                            ref={dt}
                            value={detalles}
                            dataKey="idCompraDetalle"
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25]}
                            className="datatable-responsive editable-cells-table"
                            emptyMessage="No se han agregado detalles de la compra."
                            editMode='cell'
                            responsiveLayout="scroll"
                            >
                                <Column field="idRepuesto" header="Repuesto" body={repBodyTemplate} sortable headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                                <Column field="cantidad" header="Cantidad" body={cantidadBodyTemplate} sortable headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
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
};

export default Compras;
