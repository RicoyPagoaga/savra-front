import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { CategoriaRepuestoService } from '../../demo/service/CategoriaRepuestoService';

const categoria_repuestos = () => {
    let categoriaVacia = {
        idCategoria: null,
        nombre: '',
        descripcion: '',
    };

    const [categorias, setCategorias] = useState();
    const [categoriaDialog, setCategoriaDialog] = useState(false);
    const [deleteCategoriaDialog, setDeleteCategoriaDialog] = useState(false);
    const [deleteCategoriasDialog, setDeleteCategoriasDialog] = useState(false);
    const [categoria, setCategoria] = useState(categoriaVacia);
    const [selectedCategorias, setSelectedCategorias] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);

    const listarCategorias = () => {
        const categoriaService = new CategoriaRepuestoService();
        categoriaService.getCategoriasRepuestos().then(data => setCategorias(data));
    };

    useEffect(() => {
        listarCategorias();
    }, []);


    const openNew = () => {
        setCategoria(categoriaVacia);
        setSubmitted(false);
        setCategoriaDialog(true);
        console.log(categorias);
    }

    const hideDialog = () => {
        setSubmitted(false);
        setCategoriaDialog(false);
    }

    const hideDeleteCategoriaDialog = () => {
        setDeleteCategoriaDialog(false);
    }

    const hideDeleteCategoriasDialog = () => {
        setDeleteCategoriasDialog(false);
    }

    const pasoRegistro = () => {
        listarCategorias();
        setCategoriaDialog(false);
        setCategoria(categoriaVacia); 
    }

    const saveCategoria = async () => {
        setSubmitted(true);
        if (categoria.nombre.trim()) {
            if (categoria.idCategoria) {
               try {
                    const categoriaService = new CategoriaRepuestoService();
                    await categoriaService.updateCategoriaRepuesto(categoria);
                    toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Categoría Actualizada', life: 3000 });
                    pasoRegistro();
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });
                }
            }
            else {
                try {
                    const categoriaService = new CategoriaRepuestoService();
                    await categoriaService.addCategoriaRepuesto(categoria);
                    toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Categoría Creada', life: 3000 });
                    pasoRegistro();
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });                    
                }
            }
        }   
        
    }

    const editCategoria = (categoria) => {
        setCategoria({ ...categoria});
        setCategoriaDialog(true);
    }

    const confirmDeleteCategoria = (categoria) => {
        setCategoria(categoria);
        setDeleteCategoriaDialog(true);
    }

    const deleteCategoria = async () => {
        try {
            const categoriaService = new CategoriaRepuestoService();
            await categoriaService.removeCategoriaRepuesto(categoria.idCategoria);
            listarCategorias();
            setDeleteCategoriaDialog(false);
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Categoría Eliminada', life: 3000 });
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error, life: 3000 });  
        }
    }

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteCategoriasDialog(true);
    }


    const deleteSelectedCategorias = async () => {
        let x = ' ';
        const categoriaService = new CategoriaRepuestoService();
        selectedCategorias.map(async (categoria) => {
            try {
                await categoriaService.removeCategoriaRepuesto(categoria.idCategoria);
            } catch (error) {
                x = x + 'error'; 
                toast.current.show({ severity: 'error', summary: 'Error', detail: error + ` ${categoria.nombre}`, life: 3000 }); 
            }
            console.log(x);
        });
        if (x == '') {
            let _categorias = categorias.filter((val) => !selectedCategorias.includes(val));
            setCategorias(_categorias);
            setDeleteCategoriasDialog(false);
            setSelectedCategorias(null);
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Categorías Eliminadas', life: 3000 });
        }
    }


    const onInputChange = (e, nombre) => {
        const val = (e.target && e.target.value) || '';
        let _categoria = { ...categoria };
        _categoria[`${nombre}`] = val;

        setCategoria(_categoria);
    }


    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                    <Button label="Eliminar" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedCategorias || !selectedCategorias.length} />
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
                {rowData.idCategoria}
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

    const descripcionBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Descripción</span>
                {rowData.descripcion}
            </>
        );
    }

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editCategoria(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning mt-2" onClick={() => confirmDeleteCategoria(rowData)} />
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
            <h5 className="m-0">Listado de Categorías de Repuesto</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => filter(e)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const categoriaDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" className="p-button-text" onClick={saveCategoria}/>
        </>
    );
    const deleteCategoriaDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteCategoriaDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteCategoria} />
        </>
    );
    const deleteCategoriasDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteCategoriaDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedCategorias} />
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
                        value={categorias}
                        selection={selectedCategorias}
                        onSelectionChange={(e) => setSelectedCategorias(e.value)}
                        dataKey="idCategoria"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} categorías de repuesto" 
                        globalFilter={globalFilter}
                        emptyMessage="No se encontraron categorías de repuesto."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem'}}></Column>
                        <Column field="idCategoria" header="Código" sortable body={idBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="nombre" header="Nombre" sortable body={nombreBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="descripcion" header="Descripción" sortable body={descripcionBodyTemplate} headerStyle={{ width: '40%', minWidth: '10rem' }}></Column>
                        <Column header="Acciones" body={actionBodyTemplate}></Column>
                    </DataTable>

                    <Dialog visible={categoriaDialog} style={{ width: '450px' }} header="Registro Categorías de Repuesto" modal className="p-fluid" footer={categoriaDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="nombre">Nombre</label>
                            <InputText id="nombre" value={categoria.nombre} onChange={(e) => onInputChange(e, 'nombre')} required autoFocus className={classNames({ 'p-invalid': submitted && !categoria.nombre })} />
                            { submitted && !categoria.nombre && <small className="p-invalid">Nombre es requerido.</small> }
                        </div>
                        <div className="field">
                            <label htmlFor="descripcion">Descripción</label>
                            <InputText id="descripcion" value={categoria.descripcion} onChange={(e) => onInputChange(e, 'descripcion')} required autoFocus className={classNames({ 'p-invalid': submitted && !categoria.descripcion })} />
                            { submitted && !categoria.descripcion && <small className="p-invalid">La descripción es requerido.</small> }
                        </div>
                    </Dialog> 

                    <Dialog visible={deleteCategoriaDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteCategoriaDialogFooter} onHide={hideDeleteCategoriaDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {categoria && <span>¿Está seguro de que desea eliminar a <b>{categoria.nombre}</b>?</span>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteCategoriasDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteCategoriasDialogFooter} onHide={hideDeleteCategoriasDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {categoria && <span>¿Está seguro de que desea eliminar los registros seleccionados?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default categoria_repuestos;
