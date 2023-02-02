import getConfig from 'next/config';
import { ApiError } from 'next/dist/server/api-utils';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { RadioButton } from 'primereact/radiobutton';
import { Rating } from 'primereact/rating';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { CategoriaClienteService } from '../../demo/service/CategoriaClienteService';

const CategoriaCliente = () => {
    let emptyCategoriaCliente = {
        idCategoria: null,
        nombre: '',
        descripcion: ''
    };

    let emptyRestApiError = {
        httpStatus : '',
        errorMessage: '',
        errorDetails: ''
    };

    const [categoriaClientes, setCategoriaClientes] = useState(null);
    const [categoriaClienteDialog, setCategoriaClienteDialog] = useState(false);
    const [deleteCategoriaClienteDialog, setDeleteCategoriaClienteDialog] = useState(false);
    const [deleteCategoriasClientesDialog, setDeleteCategoriasClientesDialog] = useState(false);
    const [CategoriaCliente, setCategoriaCliente] = useState(emptyCategoriaCliente);
    const [apiError, setApiError] = useState(emptyRestApiError);
    const [selectedCategoriaClientes, setSelectedCategoriaClientes] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;


    const listarCategoriaClientes = () => {
        const categoriaClienteService = new CategoriaClienteService();
        categoriaClienteService.getCategoriaClientes().then(data => setCategoriaClientes(data));
    };
    useEffect(() => {
        listarCategoriaClientes()
    }, []);

    const openNew = () => {
        setCategoriaCliente(emptyCategoriaCliente);
        setSubmitted(false);
        setCategoriaClienteDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setCategoriaClienteDialog(false);
    };

    const hideDeleteCategoriaClienteDialog = () => {
        setDeleteCategoriaClienteDialog(false);
    };

    const hideDeleteCategoriasClientesDialog = () => {
        setDeleteCategoriasClientesDialog(false);
    };

    const pasoRegistro = () =>{
        listarCategoriaClientes();
        setCategoriaClienteDialog(false);
        setCategoriaCliente(emptyCategoriaCliente);
    }
    const saveCategoriaCliente = async () => {
        setSubmitted(true);
        if (CategoriaCliente.nombre.trim()) {
            if (CategoriaCliente.idCategoria) {
                try {
                    const categoriaClienteService = new CategoriaClienteService();
                    await categoriaClienteService.updateCategoriaCliente(CategoriaCliente);
                    toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Categoría Actualizada', life: 3000 });
                    pasoRegistro();
                } catch (error) {
                    //console.log(error);
                    toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails , life: 3000 });
                    //console.log(apiError.errorDetails);
                }
            } else {
                try {
                    const categoriaClienteService = new CategoriaClienteService();
                    await categoriaClienteService.addCategoriaCliente(CategoriaCliente);
                    toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Categoría Registrada', life: 3000 });
                    pasoRegistro();
                } catch (error) {
                    //setApiError(error);
                    toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails , life: 3000 });
                    //setApiError(emptyRestApiError);
                }
            };
            
        }
    };

    const editCategoriaCliente= (categoriaCliente) => {
        setCategoriaCliente({ ...categoriaCliente });
        setCategoriaClienteDialog(true);
    };

    const confirmDeleteCategoriaCliente = (categoriaCliente) => {
        setCategoriaCliente(categoriaCliente);
        setDeleteCategoriaClienteDialog(true);
    };

    const deleteCategoriaCliente = async ()=>{
        try {
            const categoriaClienteService = new CategoriaClienteService();
            await categoriaClienteService.removeCategoriaCliente(CategoriaCliente.idCategoria);
            listarCategoriaClientes();
            setDeleteCategoriaClienteDialog(false);
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Categoría Eliminada', life: 3000 });
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        }
    };
    const confirmDeleteSelected = () => {
        setDeleteCategoriasClientesDialog(true);
    }

   
    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const deleteSelectedCategoriaClientes = () => {
        const categoriaService = new CategoriaClienteService();
        selectedCategoriaClientes.map(async (categoria) => {
            await categoriaService.removeCategoriaCliente(categoria.idCategoria);
        });
        let categoriaCientes = categoriaClientes.filter((val) => !selectedCategoriaClientes.includes(val));
        setCategoriaClientes(categoriaCientes);
        setDeleteCategoriasClientesDialog(false);
        setSelectedCategoriaClientes(null);
        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Categorías Eliminadas', life: 3000 });
    };

    
    const onInputChange = (e, nombre) => {
        const val = (e.target && e.target.value) || '';
        let _categoriaCliente = { ...CategoriaCliente };
        _categoriaCliente[`${nombre}`] = val;

        setCategoriaCliente(_categoriaCliente);
    };


    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                    <Button label="Eliminar" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedCategoriaClientes || !selectedCategoriaClientes.length} />
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
                <span className="p-column-title">ID Categoria</span>
                {rowData.idCategoria}
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

    const descripcionBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Descripción</span>
                {rowData.descripcion}
            </>
        );
    }; 

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editCategoriaCliente(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning" onClick={() => confirmDeleteCategoriaCliente(rowData)} />
            </>
        );
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
            <h5 className="m-0">Listado de Categoria Clientes</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => filter(e)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const categoriaClienteDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Registar" icon="pi pi-check" className="p-button-text" onClick={saveCategoriaCliente} />
        </>
    );
    const deleteCategoriaClienteDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteCategoriaClienteDialog} />
            <Button label="Si" icon="pi pi-check" className="p-button-text" onClick={deleteCategoriaCliente} />
        </>
    );
    const deleteCategoriasClientesDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteCategoriasClientesDialog} />
            <Button label="Si" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedCategoriaClientes} />
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
                        value={categoriaClientes}
                        selection={selectedCategoriaClientes}
                        onSelectionChange={(e) => setSelectedCategoriaClientes(e.value)}
                        dataKey="idCategoria"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Categorias de Clientes"
                        globalFilter={globalFilter}
                        emptyMessage="No se encontraron categorias de clientes."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem'}}></Column>
                        <Column field="idCategoria" header="Id Categoría" sortable body={idBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="nombre" header="Nombre" sortable body={nombreBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="descripcion"header="Descripción" sortable body={descripcionBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column header="Acciones"body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={categoriaClienteDialog} style={{ width: '450px' }} header="Registro Categorias Clientes" modal className="p-fluid" footer={categoriaClienteDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="nombre">Nombre</label>
                            <InputText id="nombre" value={CategoriaCliente.nombre} onChange={(e) => onInputChange(e, 'nombre')} required autoFocus className={classNames({ 'p-invalid': submitted && !CategoriaCliente.nombre })} />
                            {submitted && !CategoriaCliente.nombre && <small className="p-invalid">Nombre es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="descripcion">Descripción</label>
                            <InputTextarea id="descripcion" value={CategoriaCliente.descripcion} onChange={(e) => onInputChange(e, 'descripcion')} required autoFocus className={classNames({ 'p-invalid': submitted && !CategoriaCliente.descripcion })} />
                            {submitted && !CategoriaCliente.descripcion && <small className="p-invalid">Descripción es requerida.</small>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteCategoriaClienteDialog} style={{ width: '450px' }} header="Confirmación" modal footer={deleteCategoriaClienteDialogFooter} onHide={hideDeleteCategoriaClienteDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {CategoriaCliente && (
                                <span>
                                    Esta seguro que desea eliminar a <b>{CategoriaCliente.nombre}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteCategoriasClientesDialog} style={{ width: '450px' }} header="Confirmación" modal footer={deleteCategoriasClientesDialogFooter} onHide={hideDeleteCategoriasClientesDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {CategoriaCliente && <span>Esta seguro que desea eliminar esta Categoria (s)?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default CategoriaCliente;

