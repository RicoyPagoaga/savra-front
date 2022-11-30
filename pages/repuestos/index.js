import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { RepuestoService } from '../../demo/service/RepuestoService';
import { RepuestoTemporalService } from '../../demo/service/RepuestoTemporalService';
import { CategoriaRepuestoService } from '../../demo/service/CategoriaRepuestoService';
import { ModeloService } from '../../demo/service/ModeloService';
import { ProveedorService } from '../../demo/service/ProveedorService';
import { TransmisionService } from '../../demo/service/TransmisionService';
import { PrecioHistoricoRepuestoService } from '../../demo/service/PrecioHistoricoRepuestoService';

const Repuestos = () => {
    
    let repuestoVacio = {
        idRepuesto: null,
        nombre: '',
        anio_referenciaInicio: null,
        anio_referenciaFinal: null,
        idCategoria: null,
        stockActual: '0',
        stockMinimo: '0',
        stockMaximo: '0',
        idProveedor: null,
        idModelo: null,
        idTransmision: null,
    };

    let precioHistoricoVacio = {
        idRepuesto: null,
        fechaInicio: null,
        fechaFinal: null,
        precio: 0,
    };

    const [repuestos, setRepuestos] = useState([]);
    const [repuestoDialog, setRepuestoDialog] = useState(false);
    const [deleteRepuestoDialog, setDeleteRepuestoDialog] = useState(false);
    const [deleteRepuestosDialog, setDeleteRepuestosDialog] = useState(false);
    const [repuesto, setRepuesto] = useState(repuestoVacio);
    const [selectedRepuestos, setSelectedRepuestos] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    
    //precio historico
    const [allExpanded, setAllExpanded] = useState(false);
    const [precioHistorico, setPrecioHistorico] = useState(precioHistoricoVacio);
    const [precioHistoricos, setPrecioHistoricos] = useState([]);
    const [expandedRows, setExpandedRows] = useState([]);

    //foraneas categoria, proveedor, modelo, transmision
    const [categoria, setCategoria] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [proveedor, setProveedor] = useState(null);
    const [proveedores, setProveedores] = useState([]);
    const [modelo, setModelo] = useState(null);
    const [modelos, setModelos] = useState([]);
    const [transmision, setTransmision] = useState(null);
    const [transmisiones, setTransmisiones] = useState([]);


    const listarRepuestos = () => {
        const repuestoService = new RepuestoService();
        repuestoService.getRepuestos().then(data => setRepuestos(data));
    };

    const listarCategorias = () => {
        const categoriaService = new CategoriaRepuestoService();
        categoriaService.getCategoriasRepuestos().then(data => setCategorias(data));
    };

    const listarProveedores = () => {
        const proveedorService = new ProveedorService();
        proveedorService.getProveedores().then(data => setProveedores(data));
    };

    const listarModelos = () => {
        const modeloService = new ModeloService();
        modeloService.getModelos().then(data => setModelos(data));
    };

    const listarTransmisiones = () => {
        const transmisionService = new TransmisionService();
        transmisionService.getTransmisiones().then(data => setTransmisiones(data));
    };

    const listarPrecios = () => {
        const precioHistoricoService = new PrecioHistoricoRepuestoService();
        precioHistoricoService.getPreciosHistorico().then(data => setPrecioHistoricos(data));
    };

    useEffect(() => {
        listarRepuestos(); 
        listarCategorias();
        listarProveedores();
        listarModelos();
        listarTransmisiones(); 
        listarPrecios();
    }, []); 

    const openNew = () => {
        setRepuesto(repuestoVacio);
        setPrecioHistorico(precioHistoricoVacio);
        setSubmitted(false);
        setRepuestoDialog(true);
    }

    const hideDialog = () => {
        setSubmitted(false);
        setRepuestoDialog(false);
        //
        setCategoria(null);
        setProveedor(null);
        setModelo(null);
        setTransmision(null);
        setPrecioHistorico(precioHistoricoVacio);
    }

    const hideDeleteRepuestoDialog = () => {
        setDeleteRepuestoDialog(false);
    }

    const hideDeleteRepuestosDialog = () => {
        setDeleteRepuestosDialog(false);
    }

    const pasoRegistro = () => {
        listarRepuestos();
        listarPrecios();
        setRepuestoDialog(false);
        setRepuesto(repuestoVacio);
        //
        setPrecioHistorico(precioHistoricoVacio);
        setCategoria(null);
        setProveedor(null);
        setModelo(null);
        setTransmision(null);   
    }

    const saveRepuesto = async () => {
        setSubmitted(true);

        if (repuesto.nombre.trim()) {
            if (repuesto.idRepuesto) {
                try {
                    const precioHistoricoService = new PrecioHistoricoRepuestoService(); 
                    
                    if (precioHistorico.idRepuesto == null) {
                        //si es primera vez 
                        precioHistorico.idRepuesto = repuesto.idRepuesto;
                        precioHistorico.fechaInicio = '2022-01-01';
                        precioHistorico.fechaFinal = '2022-03-03'
                        await precioHistoricoService.addPrecioHistorico(precioHistorico);
                    } else {
                        precioHistorico.fechaFinal = '2022-03-03'
                        await precioHistoricoService.addPrecioHistorico(precioHistorico);
                    }      
                    const repuestoService = new RepuestoService();
                    await repuestoService.updateRepuesto(repuesto);             
                    toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Repuesto Actualizado', life: 3000 });
                    pasoRegistro();   
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails , life: 3000 });
                }
            }
            else {
                try {
                    const repuestoTemporalService = new RepuestoTemporalService();
                    let repuestoTemporal = {
                        idRepuesto: null,
                        nombre: repuesto.nombre,
                        anio_referenciaInicio: repuesto.anio_referenciaInicio,
                        anio_referenciaFinal: repuesto.anio_referenciaFinal,
                        idCategoria: repuesto.idCategoria,
                        stockActual: repuesto.stockActual,
                        stockMinimo: repuesto.stockMinimo,
                        stockMaximo: repuesto.stockMaximo,
                        idProveedor: repuesto.idProveedor,
                        idModelo: repuesto.idModelo,
                        idTransmision: repuesto.idTransmision,
                        precio: precioHistorico.precio,
                    };
                    await repuestoTemporalService.addRepuestoTemporal(repuestoTemporal);
                    //agregar repuesto
                    const repuestoService = new RepuestoService();
                    await repuestoService.addRepuesto(repuesto);
                    //agregar precio historico
                    const precioHistoricoService = new PrecioHistoricoRepuestoService();   
                    precioHistorico.fechaInicio = '2022-01-01';
                    precioHistorico.fechaFinal = '2022-03-03'
                    await precioHistoricoService.addPrecioHistorico(precioHistorico);
                    toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Repuesto Creado', life: 3000 });
                    pasoRegistro();
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails , life: 3000 });   
                }
            }

        }
    }

    const getCategoria = (id) => {
        let categoria = {};
        categorias.map((item) => {
            if (item.idCategoria == id) {
                categoria = item;
            }
        });
        return categoria;
    }

    const getProveedor = (id) => {
        let proveedor = {};
        proveedores.map((item) => {
            if (item.idProveedor == id) {
                proveedor = item;
            }
        });
        return proveedor;
    }

    const getModelo = (id) => {
        let modelo = {};
        modelos.map((item) => {
            if (item.idModelo == id) {
                modelo = item;
            }
        });
        return modelo;
    }

    const getTransmision = (id) => {
        let transmision = {};
        transmisiones.map((item) => {
            if (item.idTransmision == id) {
                transmision = item;
            }
        });
        return transmision;
    }

    const editRepuesto = (repuesto) => {
        if (repuesto.stockActual == 0) {
            repuesto.stockActual = "0"
        }
        if (repuesto.stockMinimo == 0) {
            repuesto.stockMinimo = "0"
        }
        setRepuesto({ ...repuesto });
        //
        setCategoria(getCategoria(repuesto.idCategoria));
        setProveedor(getProveedor(repuesto.idProveedor));
        setModelo(getModelo(repuesto.idModelo));
        setTransmision(getTransmision(repuesto.idTransmision));
        //
        setRepuestoDialog(true);

        precioHistoricos.map((item) => {
            if (item.idRepuesto == repuesto.idRepuesto && item.fechaFinal == null) {
                setPrecioHistorico(item);
            } 
        });
    }

    const confirmDeleteRepuesto = (repuesto) => {
        setRepuesto(repuesto);
        setDeleteRepuestoDialog(true);
    }

    const deleteRepuesto = async () => {
        try {
            const repuestoService = new RepuestoService();
            await repuestoService.removeRepuesto(repuesto.idRepuesto);
            listarRepuestos();
            setDeleteRepuestoDialog(false);
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Repuesto Eliminado', life: 3000 });
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        }
    }


    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteRepuestosDialog(true);
    }

    const deleteSelectedRepuestos = () => {
        const repuestoService = new RepuestoService();
        selectedRepuestos.map(async (repuesto) => {
            await repuestoService.removeRepuesto(repuesto.idRepuesto);
        });
        let _repuestos = repuestos.filter(val => !selectedRepuestos.includes(val));
        setRepuestos(_repuestos);
        setDeleteRepuestosDialog(false);
        setSelectedRepuestos(null);
        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Repuestos Eliminados', life: 3000 });
    }


    const onInputChange = (e, nombre) => {
        //categoria, proveedor, modelo, transmision
        const val = (e.target && e.target.value) || '';
        let _Repuesto = { ...repuesto };

        if (nombre == 'idCategoria') {
            _Repuesto[`${nombre}`]=val.idCategoria;
            setCategoria(e.value);
        } 
        else if (nombre == 'idProveedor') {
            _Repuesto[`${nombre}`]=val.idProveedor;
            setProveedor(e.value);
        } 
        else if (nombre == 'idModelo') {
            _Repuesto[`${nombre}`]=val.idModelo;
            setModelo(e.value);
        } 
        else if (nombre == 'idTransmision') {
            _Repuesto[`${nombre}`]=val.idTransmision;
            setTransmision(e.value);
        } 
        else {
            _Repuesto[`${nombre}`] = val;
        }
        setRepuesto(_Repuesto);
    }

    const onPriceChange = (e, nombre) => {
        const val = e.value || 0 || null;
        let _PrecioHistorico = { ...precioHistorico };
        _PrecioHistorico[`${nombre}`] = val;

        setPrecioHistorico(_PrecioHistorico);
    };

    const toggleAll = () => {
        if (allExpanded) collapseAll();
        else expandAll();
    };

    const expandAll = () => {
        let _expandedRows = {};
        repuestos.forEach((p) => (_expandedRows[`${p.idRepuesto}`] = true));

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
                    disabled={!repuestos || !repuestos.length} />
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
                {rowData.idRepuesto}
            </>
        );
    }

    const nombreBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Nombre</span>
                {rowData.nombre}
            </>
        );
    }

    const fechaInicioBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Fecha de Referencia Inicial</span>
                {rowData.anio_referenciaInicio}
            </>
        );
    }

    const fechaFinalBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Fecha de Referencia Final</span>
                {rowData.anio_referenciaFinal}
            </>
        );
    }

    const categoriaBodyTemplate = (rowData) => {
        let categoriaNombre = '';
        categorias.map((categoria) => {
            if (rowData.idCategoria == categoria.idCategoria) {
                categoriaNombre = categoria.nombre;
            }
        });
        return (
            <>
                <span className="p-column-title">Categoría</span>
                {categoriaNombre}
            </>
        )
    }

    const stockActualBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Stock Actual</span>
                {rowData.stockActual}
            </>
        );
    }

    const stockMinimoBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Stock Mínimo</span>
                {rowData.stockMinimo}
            </>
        );
    }

    const stockMaximoBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Stock Máximo</span>
                {rowData.stockMaximo}
            </>
        );
    }

    const proveedorBodyTemplate = (rowData) => {
        let proveedorNombre = '';
        proveedores.map((proveedor) => {
            if (rowData.idProveedor == proveedor.idProveedor) {
                proveedorNombre = proveedor.nombre;
            }
        });
        return (
            <>
                <span className="p-column-title">Proveedor</span>
                {proveedorNombre}
            </>
        );
    }

    const modeloBodyTemplate = (rowData) => {
        let modeloNombre = '';
        modelos.map((modelo) => {
            if (rowData.idModelo == modelo.idModelo) {
                modeloNombre = modelo.nombre;
            }
        });
        return (
            <>
                <span className="p-column-title">Modelo</span>
                {modeloNombre}
            </>
        );
    }

    const transmisionBodyTemplate = (rowData) => {
        let transmisionNombre = '';
        transmisiones.map((transmision) => {
            if (rowData.idTransmision == transmision.idTransmision) {
                transmisionNombre = transmision.nombre;
            }
        });
        return (
            <>
                <span className="p-column-title">Transmisión</span>
                {transmisionNombre}
            </>
        )
    }

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editRepuesto(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning mt-2" onClick={() => confirmDeleteRepuesto(rowData)} />
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
            <h5 className="m-0">Listado de Repuestos</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => filter(e)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const repuestoDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" className="p-button-text" onClick={saveRepuesto} />
        </>
    );
    const deleteRepuestoDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteRepuestoDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteRepuesto} />
        </>
    );
    const deleteRepuestosDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteRepuestosDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedRepuestos} />
        </>
    );

    const precioBodyTemplate = (rowData) => {
        return rowData.precio;
    };

    const rowExpansionTemplate = (data) => {
        let table = [];
        precioHistoricos.map((item) => {
            if (item.idRepuesto == data.idRepuesto) {
                table.push(item);
            }
        });
        return (
            <div className="orders-subtable">
                <h5>Precio Histórico del Repuesto: {data.nombre}</h5>
                <DataTable value={table} 
                responsiveLayout="scroll"
                emptyMessage="No se encontraron precios del repuesto.">
                    <Column field="fechaInicio" header="Fecha Inicial" sortable  headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                    <Column field="fechaFinal" header="Fecha Final" sortable  headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                    <Column field="precio" header="Precio" body={precioBodyTemplate} sortable headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                </DataTable>
            </div>
        );
    };

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={repuestos}
                        dataKey="idRepuesto"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} repuestos" 
                        globalFilter={globalFilter}
                        emptyMessage="No se encontraron repuestos."
                        header={header}
                        responsiveLayout="scroll"
                        expandedRows={expandedRows}
                        onRowToggle={(e) => setExpandedRows(e.data)}
                        rowExpansionTemplate={rowExpansionTemplate}
                    >
                        <Column expander style={{ width: '3em' }} />
                        <Column field="idRepuesto" header="Código" sortable body={idBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="nombre" header="Nombre" sortable body={nombreBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="anio_referenciaInicio" header="Año de Referencia Inicial" sortable body={fechaInicioBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="anio_referenciaFinal" header="Año de Referencia Final" body={fechaFinalBodyTemplate} sortable headerStyle={{ width: '14%', minWidth: '8rem' }}></Column>
                        <Column field="idCategoria" header="Categoría" sortable body={categoriaBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="stockActual" header="Stock Actual" body={stockActualBodyTemplate} sortable headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="stockMinimo" header="Stock Mínimo" body={stockMinimoBodyTemplate} sortable headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="stockMaximo" header="Stock Máximo" body={stockMaximoBodyTemplate} sortable headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="idProveedor" header="Proveedor" sortable body={proveedorBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="idModelo" header="Modelo" sortable body={modeloBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="idTransmision" header="Transmisión" sortable body={transmisionBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column header="Acciones" body={actionBodyTemplate}  headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={repuestoDialog} style={{ width: '450px' }} header="Detalles de Repuesto" modal className="p-fluid" footer={repuestoDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="nombre">Nombre</label>
                            <InputText id="nombre" value={repuesto.nombre} onChange={(e) => onInputChange(e, 'nombre')} required autoFocus className={classNames({ 'p-invalid': submitted && !repuesto.nombre })} />
                            {submitted && !repuesto.nombre && <small className="p-invalid">El nombre es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="anio_referenciaInicio">Año de Referencia Inicial</label>
                            <InputText id="anio_referenciaInicio" type="number" value={repuesto.anio_referenciaInicio} onChange={(e) => onInputChange(e, 'anio_referenciaInicio')} required autoFocus className={classNames({ 'p-invalid': submitted && !repuesto.anio_referenciaInicio })} />
                            {submitted && !repuesto.anio_referenciaInicio && <small className="p-invalid">El año de referencia inicial es requerida.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="anio_referenciaFinal">Año de Referencia Final</label>
                            <InputText id="anio_referenciaFinal" type="number" value={repuesto.anio_referenciaFinal} onChange={(e) => onInputChange(e, 'anio_referenciaFinal')} required autoFocus className={classNames({ 'p-invalid': submitted && !repuesto.anio_referenciaFinal })} />
                            {submitted && !repuesto.anio_referenciaFinal && <small className="p-invalid">El año de referencia final es requerida.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="idCategoria">Categoría</label>
                            <Dropdown id="idCategoria" options={categorias} value={categoria} onChange={(e) => onInputChange(e, 'idCategoria')} optionLabel={"nombre"} required autoFocus className={classNames({ 'p-invalid': submitted && !repuesto.idCategoria })} />
                            {submitted && !repuesto.idCategoria && <small className="p-invalid">La categoría es requerida.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="stockActual">Stock Actual</label>
                            <InputText id="stockActual" type="number" value={repuesto.stockActual} onChange={(e) => onInputChange(e, 'stockActual')} required autoFocus className={classNames({ 'p-invalid': submitted && !repuesto.stockActual })} />
                            {submitted && !repuesto.stockActual && <small className="p-invalid">El stock actual es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="stockMinimo">Stock Mínimo</label>
                            <InputText id="stockMinimo" type="number" value={repuesto.stockMinimo} onChange={(e) => onInputChange(e, 'stockMinimo')} required autoFocus className={classNames({ 'p-invalid': submitted && !repuesto.stockMinimo })} />
                            {submitted && !repuesto.stockMinimo && <small className="p-invalid">El stock mínimo es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="stockMaximo">Stock Máximo</label>
                            <InputText id="stockMaximo" type="number" value={repuesto.stockMaximo} onChange={(e) => onInputChange(e, 'stockMaximo')} required autoFocus className={classNames({ 'p-invalid': submitted && !repuesto.stockMaximo })} />
                            {submitted && !repuesto.stockMaximo && <small className="p-invalid">El stock máximo es requerido.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="idProveedor">Proveedor</label>
                            <Dropdown id="idProveedor" options={proveedores} value={proveedor} onChange={(e) => onInputChange(e, 'idProveedor')} optionLabel={"nombre"} required autoFocus className={classNames({ 'p-invalid': submitted && !repuesto.idProveedor })} />
                            {submitted && !repuesto.idProveedor && <small className="p-invalid">El proveedor es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="idModelo">Modelo</label>
                            <Dropdown id="idModelo" options={modelos} value={modelo} onChange={(e) => onInputChange(e, 'idModelo')} optionLabel={"nombre"} required autoFocus className={classNames({ 'p-invalid': submitted && !repuesto.idModelo })}/>
                            {submitted && !repuesto.idModelo && <small className="p-invalid">El modelo es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="idTransmision">Transmisión</label>
                            <Dropdown id="idTransmision" options={transmisiones} value={transmision} onChange={(e) => onInputChange(e, 'idTransmision')} optionLabel={"nombre"} required autoFocus className={classNames({ 'p-invalid': submitted && !repuesto.idTransmision })} />
                            {submitted && !repuesto.idTransmision && <small className="p-invalid">La transmisión es requerida.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="precio">Precio</label>
                            <InputNumber id="precio" value={precioHistorico.precio} onValueChange={(e) => onPriceChange(e, 'precio')} mode='currency' currency='HNL' locale='en-US' required autoFocus className={classNames({ 'p-invalid': submitted && !precioHistorico.precio })}/>
                            {submitted && !precioHistorico.precio && <small className="p-invalid">El precio es requerido, no debe ser menor o igual a cero.</small>}
                        </div>
                    </Dialog> 

                    <Dialog visible={deleteRepuestoDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteRepuestoDialogFooter} onHide={hideDeleteRepuestoDialog}>

                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {repuesto && <span>¿Está seguro de que desea eliminar a <b>{repuesto.nombre}</b>?</span>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteRepuestosDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteRepuestosDialogFooter} onHide={hideDeleteRepuestosDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {repuesto && <span>¿Está seguro de que desea eliminar los registros seleccionados?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Repuestos;
