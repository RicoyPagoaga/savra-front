import getConfig from 'next/config';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { RadioButton } from 'primereact/radiobutton';
import { Rating } from 'primereact/rating';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { ClienteService } from '../../demo/service/clienteservice';
import { TipoDocumentoService } from '../../demo/service/TipoDocumentoService';
import { CategoriaClienteService } from '../../demo/service/CategoriaClienteService';

const Clientes = () => {
    let emptyCliente = {
        idCliente: null,
        nombre: '',
        documento: '',
        idTipoDocumento : null,
        telefono: '',
        direccion: '',
        idCategoria: null
    };

    let emptyRestApiError = {
        httpStatus : '',
        errorMessage: '',
        errorDetails: ''
    };

    const [clientes, setClientes] = useState(null);
    const [tipoDocumentos,setTipoDocumentos] = useState([]);
    const [tipoDocumento, setTipoDocumento] = useState(null);
    const [categoriaClientes,setCategoriaClientes] = useState([]);
    const [categoriaCliente, setCategoriaCliente] = useState(null);
    const [clienteDialog, setClienteDialog] = useState(false);
    const [deleteClienteDialog, setDeleteClienteDialog] = useState(false);
    const [deleteClientesDialog, setDeleteClientesDialog] = useState(false);
    const [cliente, setCliente] = useState(emptyCliente);
    const [apiError, setApiError] = useState(emptyRestApiError);
    const [selectedClientes, setSelectedClientes] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;


    const listarClientes = () => {
        const clienteservice = new ClienteService();
        clienteservice.getClientes().then(data => setClientes(data));
    };
    const listarTipoDocumentos = async() => {
        const tiposDocumentoService = new TipoDocumentoService();
        await tiposDocumentoService.getTipoDocumentos().then(data => setTipoDocumentos(data));
    };
    const listarCategoriasClientes =async () => {
        const categoriaservice = new CategoriaClienteService();
        await categoriaservice.getCategoriaClientes().then(data => setCategoriaClientes(data));
    };
    
    useEffect(async() => {
        listarClientes();
        await listarTipoDocumentos();
        await listarCategoriasClientes();
    }, []);
    //const [documentosItem,setOpcionesDocumentoItem] = useState(null);
    //const documentosItem = tipoDocumentos.map((idTipoDocumento) =>{
    //})
    const openNew = () => {
        setCliente(emptyCliente);
        setTipoDocumento(null);
        setCategoriaCliente(null);
        setSubmitted(false);
        setClienteDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setClienteDialog(false);
    };

    const hideDeleteClienteDialog = () => {
        setDeleteClienteDialog(false);
    };

    const hideDeleteClientesDialog = () => {
        setDeleteClientesDialog(false);
    };

    const pasoRegistro = () =>{
        listarClientes();
        setClienteDialog(false);
        setCliente(emptyCliente);
    }
    
    const saveCliente = async () => {
        setSubmitted(true);

        if (cliente.nombre.trim()) {
            if (cliente.idCliente) {
                try {
                    const clienteservice = new ClienteService();
                    await clienteservice.updateCliente(cliente);
                    toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Cliente Actualizado', life: 3000 });
                    pasoRegistro();
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails , life: 3000 });
                    //console.log(apiError.errorDetails);
                }
            } else {
                try {
                    const clienteservice = new ClienteService();
                    await clienteservice.addCliente(cliente);
                    toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Cliente Registrado', life: 3000 });
                    pasoRegistro();
                } catch (error) {
                    console.log(cliente);
                    toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails , life: 3000 });
                }
            };
            
        }
    };

    const editCliente= (cliente) => {
        setCliente({ ...cliente });
        console.log(tipoDocumentos);
        const documento = tipoDocumentos.find((item) => {
            if(item.idTipoDocumento == cliente.idTipoDocumento)
            return item
        });
        setTipoDocumento(documento);
        const categoria = categoriaClientes.find((item) => {
            if(item.idCategoria == cliente.idCategoria)
            return item
        });
        setCategoriaCliente(categoria);
        setClienteDialog(true);
    };
    const deleteCliente = async ()=>{
        const clienteservice = new ClienteService();
        await clienteservice.removeCliente(cliente.idCliente);
        listarClientes();
        setDeleteClienteDialog(false);
        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Cliente Eliminado', life: 3000 });
    };
    const confirmDeleteCliente = (cliente) => {
        setCliente(cliente);
        setDeleteClienteDialog(true);
    };
   
    const exportCSV = () => {
        dt.current.exportCSV();
    };
    const confirmDeleteSelected = () => {
        setDeleteClientesDialog(true);
    }
    const deleteSelectedClientes = () => {
        const clienteService = new ClienteService();
        selectedClientes.map(async (cliente) => {
            await clienteService.removeCliente(cliente.idCliente);
        });
        let _clientes = clientes.filter((val) => !selectedClientes.includes(val));
        setClientes(_clientes);
        setDeleteClientesDialog(false);
        setSelectedClientes(null);
        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Clientes Eliminados', life: 3000 });
    };
    
    const onInputChange = (e, nombre) => {
        const val = (e.target && e.target.value) || '';
        let _cliente = { ...cliente };
        if (nombre == 'idTipoDocumento') {
            _cliente[`${nombre}`] = val.idTipoDocumento;
            setTipoDocumento(e.value);
            console.log(e.value);
        } else if (nombre == 'idCategoria') {
            _cliente[`${nombre}`] = val.idCategoria;
            setCategoriaCliente(e.value);
        } else {
            _cliente[`${nombre}`] = val;
        }
        //console.log(_cliente);
        setCliente(_cliente);

    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                    <Button label="Eliminar" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedClientes || !selectedClientes.length} />
                </div>
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="Exportar" icon="pi pi-upload" className="p-button-help mr-2 inline-block" onClick={exportCSV} />
            </React.Fragment>
        );
    };

    const idBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">ID Cliente</span>
                {rowData.idCliente}
            </>
        );
    };

    const nombreBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Nombre</span>
                {rowData.nombre}
            </>
        );
    };

    const documentoBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Documento</span>
                {rowData.documento}
            </>
        );
    }; 

    const idTipoDocumentoBodyTemplate = (rowData) => {
        const documento = tipoDocumentos.find((item) => {
            if(item.idTipoDocumento == rowData.idTipoDocumento)
                 return item;
            });
            console.log(documento)
        if(documento != null){
            return (
                <>
                    <span className="p-column-title">Id Tipo Documento</span>
                    {
                        documento.nombreDocumento
                    }
                    
                </>
            );
        }else{
            return (
                <>
                    <span className="p-column-title">Id Tipo Documento</span>
                    {
                        rowData.idTipoDocumento
                    }
                    
                </>
            );
        }
        
    };
    const telefonoBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Telefono</span>
                {rowData.telefono}
            </>
        );
    };
    const direccionBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Direccion</span>
                {rowData.direccion}
            </>
        );
    };
    const idCategoriaBodyTemplate = (rowData) => {
        const categoria = categoriaClientes.find((item) => {
            if(item.idCategoria == rowData.idCategoria)
            return item
        });
        if(categoria != null ){
            return (
                <>
                    <span className="p-column-title">Id Categoria</span>
                    {categoria.nombre}
                </>
            );
        }else{
            return (
                <>
                    <span className="p-column-title">Id Categoria</span>
                    {rowData.idCategoria}
                </>
            );
        }
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editCliente(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning" onClick={() => confirmDeleteCliente(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Listado de Clientes</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const clienteDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Registar" icon="pi pi-check" className="p-button-text" onClick={saveCliente} />
        </>
    );
    const deleteClienteDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteClienteDialog} />
            <Button label="Si" icon="pi pi-check" className="p-button-text" onClick={deleteCliente} />
        </>
    );
    const deleteClientesDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteClientesDialog} />
            <Button label="Si" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedClientes} />
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
                        value={clientes}
                        selection={selectedClientes}
                        onSelectionChange={(e) => setSelectedClientes(e.value)}
                        dataKey="idCliente"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Clientes"
                        globalFilter={globalFilter}
                        emptyMessage="No se encontraron clientes."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem'}}></Column>
                        <Column field="idCliente" header="Id Cliente" sortable body={idBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="nombre" header="Nombre" sortable body={nombreBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="documento" header="Documento" sortable body={documentoBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="idTipoDocumento" header="Tipo Documento" sortable body={idTipoDocumentoBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="telefono" header="Teléfono" sortable body={telefonoBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="direccion" header="Dirección" sortable body={direccionBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="idCategoria"header="Categoria" sortable body={idCategoriaBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column header="Acciones"body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={clienteDialog} style={{ width: '450px' }} header="Registro Clientes" modal className="p-fluid" footer={clienteDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="nombre">Nombre</label>
                            <InputText id="nombre" value={cliente.nombre} onChange={(e) => onInputChange(e, 'nombre')} required autoFocus className={classNames({ 'p-invalid': submitted && !cliente.nombre })} />
                            {submitted && !cliente.nombre && <small className="p-invalid">Nombre es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="documento">Documento</label>
                            <InputText id="documento" value={cliente.documento} onChange={(e) => onInputChange(e, 'documento')} required autoFocus className={classNames({ 'p-invalid': submitted && !cliente.documento })} />
                            {submitted && !cliente.documento && <small className="p-invalid">Documento es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="idTipoDocumento">Tipo Documento</label>
                            <Dropdown id="idTipoDocumento" options={tipoDocumentos} value={tipoDocumento} onChange={(e) => onInputChange(e, 'idTipoDocumento')}  optionLabel = "nombreDocumento" placeholder="Seleccione un tipo de Documento" required autoFocus className={classNames({ 'p-invalid': submitted && !cliente.idTipoDocumento })}></Dropdown>
                            {submitted && !cliente.idTipoDocumento && <small className="p-invalid">Tipo Documento es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="telefono">Teléfono</label>
                            <InputText id="telefono" value={cliente.telefono} onChange={(e) => onInputChange(e, 'telefono')} required autoFocus className={classNames({ 'p-invalid': submitted && !cliente.telefono })} />
                            {submitted && !cliente.telefono && <small className="p-invalid">Teléfono es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="direccion">Dirección</label>
                            <InputText id="direccion" value={cliente.direccion} onChange={(e) => onInputChange(e, 'direccion')} required autoFocus className={classNames({ 'p-invalid': submitted && !cliente.direccion })} />
                            {submitted && !cliente.direccion && <small className="p-invalid">Dirección es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="idCategoria">Categoría</label>
                            <Dropdown id="idCategoria" value={categoriaCliente} onChange={(e) => onInputChange(e, 'idCategoria')} options={categoriaClientes} optionLabel = "nombre" placeholder="Seleccione una Categoría" required autoFocus className={classNames({ 'p-invalid': submitted && !cliente.idCategoria })} ></Dropdown>
                            {submitted && !cliente.idCategoria && <small className="p-invalid">Categoría es requerida.</small>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteClienteDialog} style={{ width: '450px' }} header="Confirmación" modal footer={deleteClienteDialogFooter} onHide={hideDeleteClienteDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {cliente && (
                                <span>
                                    Esta seguro que desea eliminar a <b>{cliente.nombre}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteClientesDialog} style={{ width: '450px' }} header="Confirmación" modal footer={deleteClientesDialogFooter} onHide={hideDeleteClientesDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {cliente && <span>Esta seguro que desea eliminar los siguientes Clientes?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Clientes;

