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
import { CategoriaRepuestoService } from '../../demo/service/CategoriaRepuestoService';
import { ModeloService } from '../../demo/service/ModeloService';
import { ProveedorService } from '../../demo/service/ProveedorService';
import { TransmisionService } from '../../demo/service/TransmisionService';

const Repuestos = () => {
    let repuestoVacio = {
        idRepuesto: null,
        nombre: '',
        fecha_referenciaInicio: null,
        fecha_referenciaFinal: null,
        idCategoria: null,
        stockActual: null,
        stockMinimo: null,
        stockMaximo: null,
        idProveedor: null,
        idModelo: null,
        idTransmision: null,
    };

    const [repuestos, setRepuestos] = useState(null);
    const [repuestoDialog, setRepuestoDialog] = useState(false);
    const [deleteRepuestoDialog, setDeleteRepuestoDialog] = useState(false);
    const [deleteRepuestosDialog, setDeleteRepuestosDialog] = useState(false);
    const [repuesto, setRepuesto] = useState(repuestoVacio);
    const [selectedRepuestos, setSelectedRepuestos] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    //fechas
    const [fechaInicio, setFechaInicio] = useState(null);
    const [fechaFinal, setFechaFinal] = useState(null);

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
    }

    const listarProveedores = () => {
        const proveedorService = new ProveedorService();
        proveedorService.getProveedores().then(data => setProveedores(data));
    }

    const listarModelos = () => {
        const modeloService = new ModeloService();
        modeloService.getModelos().then(data => setModelos(data));
    }

    const listarTransmisiones = () => {
        const transmisionService = new TransmisionService();
        transmisionService.getTransmisiones().then(data => setTransmisiones(data));
    }


    useEffect(() => {
        listarRepuestos(); 
        listarCategorias();
        listarProveedores();
        listarModelos();
        listarTransmisiones(); 
    }, []); 


    const openNew = () => {
        setRepuesto(repuestoVacio);
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
    }

    const hideDeleteRepuestoDialog = () => {
        setDeleteRepuestoDialog(false);
    }

    const hideDeleteRepuestosDialog = () => {
        setDeleteRepuestosDialog(false);
    }

    const pasoRegistro = () => {
        listarRepuestos();
        setRepuestoDialog(false);
        setRepuesto(repuestoVacio);
        //
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
                    const repuestoService = new RepuestoService();
                    await repuestoService.addRepuesto(repuesto);
                    toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Repuesto Creado', life: 3000 });
                    pasoRegistro();
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails , life: 3000 });   
                }
            }

        }
    }

    const getFecha = (fecha) => {
        const [y, m, d] = fecha.split('-');
        let _fecha = new Date(+y, m-1, +d);
        return _fecha;
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
        setRepuesto({ ...repuesto });
        //
        setCategoria(getCategoria(repuesto.idCategoria));
        setProveedor(getProveedor(repuesto.idProveedor));
        setModelo(getModelo(repuesto.idModelo));
        setTransmision(getTransmision(repuesto.idTransmision));
        //
        setRepuestoDialog(true);
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


    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                    <Button label="Eliminar" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedRepuestos || !selectedRepuestos.length} />
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
                {rowData.fecha_referenciaInicio}
            </>
        );
    }

    const fechaFinalBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Fecha de Referencia Final</span>
                {rowData.fecha_referenciaFinal}
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

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={repuestos}
                        selection={selectedRepuestos}
                        onSelectionChange={(e) => setSelectedRepuestos(e.value)}
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
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem'}}></Column>
                        <Column field="idRepuesto" header="Código" sortable body={idBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="nombre" header="Nombre" sortable body={nombreBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="fecha_referenciaInicio" header="Fecha de Referencia Inicial" sortable body={fechaInicioBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="fecha_referenciaFinal" header="Fecha de Referencia Final" body={fechaFinalBodyTemplate} sortable headerStyle={{ width: '14%', minWidth: '8rem' }}></Column>
                        <Column field="idCategoria" header="Categoría" sortable body={categoriaBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="stockActual" header="Stock Actual" body={stockActualBodyTemplate} sortable headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="stockMinimo" header="Stock Mínimo" body={stockMinimoBodyTemplate} sortable headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="stockMaximo" header="Stock Máximo" body={stockMaximoBodyTemplate} sortable headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="idProveedor" header="Proveedor" sortable body={proveedorBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="idModelo" header="Modelo" sortable body={modeloBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="idTransmision" header="Transmisión" sortable body={transmisionBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column header="Acciones" body={actionBodyTemplate}></Column>
                    </DataTable>

                    <Dialog visible={repuestoDialog} style={{ width: '450px' }} header="Detalles de Repuesto" modal className="p-fluid" footer={repuestoDialogFooter} onHide={hideDialog}>
                        {/* {product.image && <img src={`assets/demo/images/product/${product.image}`} alt={product.image} width="150" className="mt-0 mx-auto mb-5 block shadow-2" />} */}
                        <div className="field">
                            <label htmlFor="nombre">Nombre</label>
                            <InputText id="nombre" value={repuesto.nombre} onChange={(e) => onInputChange(e, 'nombre')} required autoFocus className={classNames({ 'p-invalid': submitted && !repuesto.nombre })} />
                            {submitted && !repuesto.nombre && <small className="p-invalid">El nombre es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="fecha_referenciaInicio">Fecha Referencia Inicial</label>
                            <InputText id="fecha_referenciaInicio" type="number" value={repuesto.fecha_referenciaInicio} onChange={(e) => onInputChange(e, 'fecha_referenciaInicio')} required autoFocus className={classNames({ 'p-invalid': submitted && !repuesto.fecha_referenciaInicio })} />
                            {submitted && !repuesto.fecha_referenciaInicio && <small className="p-invalid">La fecha referencia inicial es requerida.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="fecha_referenciaFinal">Fecha Referencia Final</label>
                            <InputText id="fecha_referenciaFinal" type="number" value={repuesto.fecha_referenciaFinal} onChange={(e) => onInputChange(e, 'fecha_referenciaFinal')} required autoFocus className={classNames({ 'p-invalid': submitted && !repuesto.fecha_referenciaFinal })} />
                            {submitted && !repuesto.fecha_referenciaFinal && <small className="p-invalid">La fecha referencia final es requerida.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="idCategoria">Categoría</label>
                            <Dropdown id="idCategoria" options={categorias} value={categoria} onChange={(e) => onInputChange(e, 'idCategoria')} optionLabel={"nombre"} />
                        </div>
                        <div className="field">
                            <label htmlFor="stockActual">Stock Actual</label>
                            <InputNumber id="stockActual" value={repuesto.stockActual} onValueChange={(e) => onInputChange(e, 'stockActual')} required autoFocus className={classNames({ 'p-invalid': submitted && !repuesto.stockActual })} />
                            {submitted && !repuesto.stockActual && <small className="p-invalid">El stock actual es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="stockMinimo">Stock Mínimo</label>
                            <InputNumber id="stockMinimo" value={repuesto.stockMinimo} onValueChange={(e) => onInputChange(e, 'stockMinimo')} required autoFocus className={classNames({ 'p-invalid': submitted && !repuesto.stockMinimo })} />
                            {submitted && !repuesto.stockMinimo && <small className="p-invalid">El stock mínimo es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="stockMaximo">Stock Máximo</label>
                            <InputNumber id="stockMaximo" value={repuesto.stockMaximo} onValueChange={(e) => onInputChange(e, 'stockMaximo')} required autoFocus className={classNames({ 'p-invalid': submitted && !repuesto.stockMaximo })} />
                            {submitted && !repuesto.stockMaximo && <small className="p-invalid">El stock máximo es requerido.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="idProveedor">Proveedor</label>
                            <Dropdown id="idProveedor" options={proveedores} value={proveedor} onChange={(e) => onInputChange(e, 'idProveedor')} optionLabel={"nombre"} />
                        </div>
                        <div className="field">
                            <label htmlFor="idModelo">Modelo</label>
                            <Dropdown id="idModelo" options={modelos} value={modelo} onChange={(e) => onInputChange(e, 'idModelo')} optionLabel={"nombre"} />
                        </div>
                        <div className="field">
                            <label htmlFor="idTransmision">Transmisión</label>
                            <Dropdown id="idTransmision" options={transmisiones} value={transmision} onChange={(e) => onInputChange(e, 'idTransmision')} optionLabel={"nombre"} />
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
