import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { TipoDocumentoService } from '../../demo/service/TipoDocumentoService';

const TipoDocumentos = () => {
    let tipoDocumentoVacio = {
        idTipoDocumento: null,
        nombreDocumento: ''
    };

    const [tipoDocumentos, setTipoDocumentos] = useState();
    const [tipoDocumentoDialog, setTipoDocumentoDialog] = useState(false);
    const [deleteTipoDocumentoDialog, setDeleteTipoDocumentoDialog] = useState(false);
    const [deleteTipoDocumentosDialog, setDeleteTipoDocumentosDialog] = useState(false);
    const [tipoDocumento, setTipoDocumento] = useState(tipoDocumentoVacio);
    const [selectedTipoDocumentos, setSelectedTipoDocumentos] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);

    const listarTipoDocumentos = () => {
        const tipoDocumentoService = new TipoDocumentoService();
        tipoDocumentoService.getTipoDocumentos().then(data => setTipoDocumentos(data));
    };

    useEffect(() => {
        listarTipoDocumentos();
    }, []);

    const openNew = () => {
        setTipoDocumento(tipoDocumentoVacio);
        setSubmitted(false);
        setTipoDocumentoDialog(true);
    }

    const hideDialog = () => {
        setSubmitted(false);
        setTipoDocumentoDialog(false);
    }

    const hideDeleteTipoDocumentoDialog = () => {
        setDeleteTipoDocumentoDialog(false);
    }

    const hideDeleteTipoDocumentosDialog = () => {
        setDeleteTipoDocumentosDialog(false);
    }

    const pasoRegistro = () => {
        listarTipoDocumentos();
        setTipoDocumentoDialog(false);
        setTipoDocumento(tipoDocumentoVacio); 
    }

    const saveTipoDocumento = async () => {
        setSubmitted(true);
        if (tipoDocumento.nombreDocumento.trim()) {
            if (tipoDocumento.idTipoDocumento) {
               try {
                    const tipoDocumentoService = new TipoDocumentoService();
                    await tipoDocumentoService.updateTipoDocumento(tipoDocumento);
                    toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Tipo Documento Actualizado (^‿^)', life: 3000 });
                    pasoRegistro();
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });
                }
            }
            else {
                try {
                    const tipoDocumentoService = new TipoDocumentoService();
                    await tipoDocumentoService.addTipoDocumento(tipoDocumento);
                    toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Tipo Documento Creado (^‿^)', life: 3000 });
                    pasoRegistro();
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });                    
    
                }
            }
        }   
        
    }

    const editTipoDocumento = (tipoDocumento) => {
        setTipoDocumento({ ...tipoDocumento});
        setTipoDocumentoDialog(true);
    }

    const confirmDeleteTipoDocumento = (tipoDocumento) => {
        setTipoDocumento(tipoDocumento);
        setDeleteTipoDocumentoDialog(true);
    }

    const deleteTipoDocumento = async () => {
        try {
        const tipoDocumentoService = new TipoDocumentoService();
        await tipoDocumentoService.removeTipoDocumento(tipoDocumento.idTipoDocumento);
        listarTipoDocumentos();
        setDeleteTipoDocumentoDialog(false);
        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Tipo Documento Eliminado 🚨', life: 3000 });
            
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error, life: 3000 });  
        }
        
    }

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteTipoDocumentosDialog(true);
    }


    const deleteSelectedTipoDocumentos = async () => {
        const tipoDocumentoService = new TipoDocumentoService();
        selectedTipoDocumentos.map(async (tipoDocumento) => {
            await tipoDocumentoService.removeTipoDocumento(tipoDocumento.idTipoDocumento);
        });
        let _tipoDocumentos = tipoDocumentos.filter((val) => !selectedTipoDocumentos.includes(val));
        setTipoDocumentos(_tipoDocumentos);
        setDeleteTipoDocumentosDialog(false);
        setSelectedTipoDocumentos(null);
        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'TipoDocumentoes Eliminados 🚨', life: 3000 });
    }


    const onInputChange = (e, nombre) => {
        const val = (e.target && e.target.value) || '';
        let _tipoDocumento = { ...tipoDocumento };
        _tipoDocumento[`${nombre}`] = val;

        setTipoDocumento(_tipoDocumento);
    }


    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                    <Button label="Eliminar" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedTipoDocumentos || !selectedTipoDocumentos.length} />
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
                <span className="p-column-title">ID TipoDocumento</span>
                {rowData.idTipoDocumento}
            </>
        );
    }

    const nombreBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Nombre</span>
                {rowData.nombreDocumento}
            </>
        );
    }
    

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editTipoDocumento(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning mt-2" onClick={() => confirmDeleteTipoDocumento(rowData)} />
            </div>
        );
    }

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Tipo Documentos</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const tipoDocumentoDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" className="p-button-text" onClick={saveTipoDocumento}/>
        </>
    );
    const deleteTipoDocumentoDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteTipoDocumentoDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteTipoDocumento}   />
        </>
    );
    const deleteTipoDocumentosDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteTipoDocumentosDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedTipoDocumentos} />
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
                        value={tipoDocumentos}
                        selection={selectedTipoDocumentos}
                        onSelectionChange={(e) => setSelectedTipoDocumentos(e.value)}
                        dataKey="idTipoDocumento"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Tipo Documentos" 
                        globalFilter={globalFilter}
                        emptyMessage="No se encontraron Tipo Documentos."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem'}}></Column>
                        <Column field="idTipoDocumento" header="ID" sortable body={idBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="nombreDocumento" header="Nombre" sortable body={nombreBodyTemplate} headerStyle={{ width: '14%', minWidth: '20rem' }}></Column>
                        <Column header="Acciones" body={actionBodyTemplate}></Column>
                    </DataTable>

                    <Dialog visible={tipoDocumentoDialog} style={{ width: '450px' }} header="Registro Tipo Documentos" modal className="p-fluid" footer={tipoDocumentoDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="nombreDocumento">Nombre</label>
                            <InputText id="nombreDocumento" value={tipoDocumento.nombreDocumento} onChange={(e) => onInputChange(e, 'nombreDocumento')} required autoFocus className={classNames({ 'p-invalid': submitted && !tipoDocumento.nombreDocumento })} />
                            { submitted && !tipoDocumento.nombreDocumento && <small className="p-invalid">Nombre Documento es requerido.</small> }
                        </div>
                    </Dialog> 

                    <Dialog visible={deleteTipoDocumentoDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteTipoDocumentoDialogFooter} onHide={hideDeleteTipoDocumentoDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {tipoDocumento && <span>¿Está seguro de que desea eliminar a <b>{tipoDocumento.nombreDocumento}</b>?</span>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteTipoDocumentosDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteTipoDocumentosDialogFooter} onHide={hideDeleteTipoDocumentosDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {tipoDocumento && <span>¿Está seguro de que desea eliminar los registros seleccionados?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default TipoDocumentos;
