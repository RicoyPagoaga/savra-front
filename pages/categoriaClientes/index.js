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

    const [categoriaClientes, setCategoriaClientes] = useState(null);
    const [categoriaClienteDialog, setCategoriaClienteDialog] = useState(false);
    const [deleteCategoriaClienteDialog, setDeleteCategoriaClienteDialog] = useState(false);
    const [deleteCategoriasClientesDialog, setDeleteCategoriasClientesDialog] = useState(false);
    const [CategoriaCliente, setCategoriaCliente] = useState(emptyCategoriaCliente);
    const [selectedProducts, setSelectedProducts] = useState(null);
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

    const formatCurrency = (value) => {
        return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    };

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

    const saveCategoriaCliente = async () => {
        setSubmitted(true);

        if (CategoriaCliente.nombre.trim()) {
            if (CategoriaCliente.idCategoria) {
                const categoriaClienteService = new CategoriaClienteService();
                await categoriaClienteService.updateCategoriaCliente(CategoriaCliente);
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Categoria Actualizada', life: 3000 });
            } else {
                const categoriaClienteService = new CategoriaClienteService();
                await categoriaClienteService.addCategoriaCliente(CategoriaCliente);
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Categoria Registrada', life: 3000 });
            }
            listarCategoriaClientes();
            setCategoriaClienteDialog(false);
            setCategoriaCliente(emptyCategoriaCliente);
        }
    };

    const editCategoriaCliente= (categoriaCliente) => {
        setCategoriaCliente({ ...categoriaCliente });
        setCategoriaClienteDialog(true);
    };

    const confirmDeleteProduct = (categoriaCliente) => {
        setCategoriaCliente(categoriaCliente);
        setDeleteCategoriaClienteDialog(true);
    };

    const deleteCategoriaCliente = async ()=>{
        const categoriaClienteService = new CategoriaClienteService();
        await categoriaClienteService.removeCategoriaCliente(CategoriaCliente.idCategoria);
        listarCategoriaClientes();
        setDeleteCategoriaClienteDialog(false);
        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Categoria Eliminada', life: 3000 });
    };

    const findIndexById = (id) => {
        let index = -1;
        for (let i = 0; i < categoriaClientes.length; i++) {
            if (categoriaClientes[i].id === id) {
                index = i;
                break;
            }
        }

        return index;
    };

    const createId = () => {
        let id = '';
        let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 5; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteCategoriasClientesDialog(true);
    };

    const deleteSelectedProducts = () => {
        let _products = products.filter((val) => !selectedProducts.includes(val));
        setProducts(_products);
        setDeleteProductsDialog(false);
        setSelectedProducts(null);
        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Categoria Eliminado', life: 3000 });
    };

    const onCategoryChange = (e) => {
        let _product = { ...product };
        _product['category'] = e.value;
        setProduct(_product);
    };

    const onInputChange = (e, nombre) => {
        const val = (e.target && e.target.value) || '';
        let _product = { ...CategoriaCliente };
        _product[`${nombre}`] = val;

        setCategoriaCliente(_product);
    };

    const onInputNumberChange = (e, name) => {
        const val = e.value || 0;
        let _product = { ...product };
        _product[`${name}`] = val;

        setProduct(_product);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                    <Button label="Eliminar" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedProducts || !selectedProducts.length} />
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
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning" onClick={() => confirmDeleteProduct(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Listado de Categoria Clientes</h5>
            <Button label="Listar" icon="pi pi-list" className="p-button-success mr-2" onClick={listarCategoriaClientes}/>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
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
            <Button label="Si" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedProducts} />
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
                        selection={selectedProducts}
                        onSelectionChange={(e) => setSelectedProducts(e.value)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Categorias de Clientes"
                        globalFilter={globalFilter}
                        emptyMessage="No products found."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
                        <Column field="idCategoria" header="Id Categoria" sortable body={idBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="nombre" header="Nombre" sortable body={nombreBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="descripcion"header="Descripción" sortable body={descripcionBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column header="Acciones"body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={categoriaClienteDialog} style={{ width: '450px' }} header="Registro Categorias Clientes" modal className="p-fluid" footer={categoriaClienteDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="name">Nombre</label>
                            <InputText id="nombre" value={CategoriaCliente.nombre} onChange={(e) => onInputChange(e, 'nombre')} required autoFocus className={classNames({ 'p-invalid': submitted && !CategoriaCliente.nombre })} />
                            {submitted && !CategoriaCliente.nombre && <small className="p-invalid">Nombre es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="name">Descripción</label>
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
                            {CategoriaCliente && <span>Esta seguro que desea eliminar esta Categoria?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default CategoriaCliente;

