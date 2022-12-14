import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { MetodoPagoService } from '../../demo/service/MetodoPagoService';

const MetodoPago = () => {
    let metodoPagoVacio = {
        idMetodoPago: null,
        nombre: '',
    };

    const [metodos, setMetodos] = useState([]);
    const [metodoDialog, setMetodoDialog] = useState(false);
    const [deleteMetodoDialog, setDeleteMetodoDialog] = useState(false);
    const [deleteMetodosDialog, setDeleteMetodosDialog] = useState(false);
    const [metodo, setMetodo] = useState(metodoPagoVacio);
    const [selectedMetodos, setSelectedMetodos] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);

    const listarMetodos = () => {
        const metodoService = new MetodoPagoService();
        metodoService.getMetodosPago().then(data => setMetodos(data));
    };

    useEffect(() => {
        listarMetodos();
    }, []);

    const openNew = () => {
        setMetodo(metodoPagoVacio);
        setSubmitted(false);
        setMetodoDialog(true);
    }

    const hideDialog = () => {
        setSubmitted(false);
        setMetodoDialog(false);
    }

    const hideDeleteMetodoDialog = () => {
        setDeleteMetodoDialog(false);
    }

    const hideDeleteMetodosDialog = () => {
        setDeleteMetodosDialog(false);
    }

    const pasoRegistro = () => {
        listarMetodos();
        setMetodoDialog(false);
        setMetodo(metodoPagoVacio); 
    }

    const saveMetodo = async () => {
        setSubmitted(true);
        if (metodo.idMetodo) {
            try {
                 const metodoService = new MetodoPagoService();
                 await metodoService.updateMetodoPago(metodo);
                 toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Método de Pago Actualizado', life: 3000 });
                 pasoRegistro();
             } catch (error) {
                 toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });
             }
        }
        else {
             try {
                 const metodoService = new MetodoPagoService();
                 await metodoService.addMetodoPago(metodo);
                 toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Método de Pago Creado', life: 3000 });
                 pasoRegistro();
             } catch (error) {
                 toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });                    
             }
        }   
        
    }

    const editMetodo = (metodo) => {
        setMetodo({ ...metodo});
        setMetodoDialog(true);
        console.log(globalFilter);
    }

    const confirmDeleteMetodo = (metodo) => {
        setMetodo(metodo);
        setDeleteMetodoDialog(true);
    }

    const deleteMetodo = async () => {
        try {
            const metodoService = new MetodoPagoService();
            await metodoService.removeMetodoPago(metodo.idMetodoPago);
            listarMetodos();
            setDeleteMetodoDialog(false);
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Método de Pago Eliminado', life: 3000 });
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error, life: 3000 });  
        }
    }

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteMetodosDialog(true);
    }


    const deleteSelectedMetodos = async () => {
        let x = ' ';
        const metodoService = new MetodoPagoService();
        selectedMetodos.map(async (metodo) => {
            try {
                await metodoService.removeMetodoPago(metodo.idMetodo);
            } catch (error) {
                x = x + 'error'; 
                toast.current.show({ severity: 'error', summary: 'Error', detail: error + ` ${metodo.nombre}`, life: 3000 }); 
            }
            console.log(x);
        });
        if (x == '') {
            let _metodos = metodos.filter((val) => !selectedMetodos.includes(val));
            setMetodos(_metodos);
            setDeleteMetodosDialog(false);
            setSelectedMetodos(null);
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Métodos de Pago Eliminados', life: 3000 });
        }
    }


    const onInputChange = (e, nombre) => {
        const val = (e.target && e.target.value) || '';
        let _metodo = { ...metodo };
        _metodo[`${nombre}`] = val;

        setMetodo(_metodo);
    }


    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                    <Button label="Eliminar" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedMetodos || !selectedMetodos.length} />
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
                {rowData.idMetodoPago}
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

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editMetodo(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning mt-2" onClick={() => confirmDeleteMetodo(rowData)} />
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
            <h5 className="m-0">Listado de Métodos de Pago</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => filter(e)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const metodoDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" className="p-button-text" onClick={saveMetodo}/>
        </>
    );
    const deleteMetodoDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteMetodoDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteMetodo} />
        </>
    );
    const deleteMetodosDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteMetodosDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedMetodos} />
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
                        value={metodos}
                        selection={selectedMetodos}
                        onSelectionChange={(e) => setSelectedMetodos(e.value)}
                        dataKey="idMetodoPago"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} métodos de pago" 
                        globalFilter={globalFilter}
                        emptyMessage="No se encontraron métodos de pago."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem'}}></Column>
                        <Column field="idMetodoPago" header="Código" sortable body={idBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="nombre" header="Nombre" sortable body={nombreBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column header="Acciones" body={actionBodyTemplate}></Column>
                    </DataTable>

                    <Dialog visible={metodoDialog} style={{ width: '450px' }} header="Registro Métodos de Pago" modal className="p-fluid" footer={metodoDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="nombre">Nombre</label>
                            <InputText id="nombre" value={metodo.nombre} onChange={(e) => onInputChange(e, 'nombre')} tooltip="Debe ingresar más de tres caracteres"
                            className={classNames({ 'p-invalid': submitted && !metodo.nombre })} />
                            { submitted && !metodo.nombre && <small className="p-invalid">Nombre es requerido.</small> }
                        </div>
                    </Dialog> 

                    <Dialog visible={deleteMetodoDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteMetodoDialogFooter} onHide={hideDeleteMetodoDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {metodo && <span>¿Está seguro de que desea eliminar a <b>{metodo.nombre}</b>?</span>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteMetodosDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteMetodosDialogFooter} onHide={hideDeleteMetodosDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {metodo && <span>¿Está seguro de que desea eliminar los registros seleccionados?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default MetodoPago;
