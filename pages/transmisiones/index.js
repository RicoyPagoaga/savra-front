import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { TransmisionService } from '../../demo/service/TransmisionService';

const Transmisiones = () => {
    let transmisionVacio = {
        idTransmision: null,
        nombre: ''
    };

    const [transmisions, setTransmisions] = useState();
    const [transmisionDialog, setTransmisionDialog] = useState(false);
    const [deleteTransmisionDialog, setDeleteTransmisionDialog] = useState(false);
    const [deleteTransmisionsDialog, setDeleteTransmisionsDialog] = useState(false);
    const [transmision, setTransmision] = useState(transmisionVacio);
    const [selectedTransmisions, setSelectedTransmisions] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);

    const listarTransmisions = () => {
        const transmisionService = new TransmisionService();
        transmisionService.getTransmisiones().then(data => setTransmisions(data));
    };

    useEffect(() => {
        listarTransmisions();
    }, []);

    const openNew = () => {
        setTransmision(transmisionVacio);
        setSubmitted(false);
        setTransmisionDialog(true);
    }

    const hideDialog = () => {
        setSubmitted(false);
        setTransmisionDialog(false);
    }

    const hideDeleteTransmisionDialog = () => {
        setDeleteTransmisionDialog(false);
    }

    const hideDeleteTransmisionsDialog = () => {
        setDeleteTransmisionsDialog(false);
    }

    const pasoRegistro = () => {
        listarTransmisions();
        setTransmisionDialog(false);
        setTransmision(transmisionVacio);
    }

    const saveTransmision = async () => {
        setSubmitted(true);
        if (transmision.nombre.trim()) {
            if (transmision.idTransmision) {
                try {
                    const transmisionService = new TransmisionService();
                    await transmisionService.updateTransmision(transmision);
                    toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Transmisión Actualizada', life: 3000 });
                    pasoRegistro();
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });
                }
            }
            else {
                try {
                    const transmisionService = new TransmisionService();
                    await transmisionService.addTransmision(transmision);
                    toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Transmisión Creada', life: 3000 });
                    pasoRegistro();
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });

                }
            }
        }

    }

    const editTransmision = (transmision) => {
        setTransmision({ ...transmision });
        setTransmisionDialog(true);
    }

    const confirmDeleteTransmision = (transmision) => {
        setTransmision(transmision);
        setDeleteTransmisionDialog(true);
    }

    const deleteTransmision = async () => {
        try {
            const transmisionService = new TransmisionService();
            await transmisionService.removeTransmision(transmision.idTransmision);
            listarTransmisions();
            setDeleteTransmisionDialog(false);
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Transmisión Eliminada', life: 3000 });
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        }
    }

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteTransmisionsDialog(true);
    }


    const deleteSelectedTransmisions = async () => {
        const transmisionService = new TransmisionService();
        selectedTransmisions.map(async (transmision) => {
            await transmisionService.removeTransmision(transmision.idTransmision);
        });
        let _transmisions = transmisions.filter((val) => !selectedTransmisions.includes(val));
        setTransmisions(_transmisions);
        setDeleteTransmisionsDialog(false);
        setSelectedTransmisions(null);
        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Transmisiones Eliminadas', life: 3000 });
    }


    const onInputChange = (e, nombre) => {
        const val = (e.target && e.target.value) || '';
        let _transmision = { ...transmision };
        _transmision[`${nombre}`] = val;

        setTransmision(_transmision);
    }


    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                    <Button label="Eliminar" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedTransmisions || !selectedTransmisions.length} />
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
                <span className="p-column-title">ID Transmision</span>
                {rowData.idTransmision}
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
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editTransmision(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning mt-2" onClick={() => confirmDeleteTransmision(rowData)} />
            </div>
        );
    }

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Transmisiones</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const transmisionDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" className="p-button-text" onClick={saveTransmision} />
        </>
    );
    const deleteTransmisionDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteTransmisionDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteTransmision} />
        </>
    );
    const deleteTransmisionsDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteTransmisionsDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedTransmisions} />
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
                        value={transmisions}
                        selection={selectedTransmisions}
                        onSelectionChange={(e) => setSelectedTransmisions(e.value)}
                        dataKey="idTransmision"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Transmisiones"
                        globalFilter={globalFilter}
                        emptyMessage="No se encontraron transmisiones."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                        <Column field="idTransmision" header="ID" sortable body={idBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="nombre" header="Nombre" sortable body={nombreBodyTemplate} headerStyle={{ width: '14%', minWidth: '20rem' }}></Column>
                        <Column header="Acciones" body={actionBodyTemplate}></Column>
                    </DataTable>

                    <Dialog visible={transmisionDialog} style={{ width: '450px' }} header="Registro Transmisiones" modal className="p-fluid" footer={transmisionDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="nombre">Nombre</label>
                            <InputText id="nombre" value={transmision.nombre} onChange={(e) => onInputChange(e, 'nombre')} required autoFocus className={classNames({ 'p-invalid': submitted && !transmision.nombre })} />
                            {submitted && !transmision.nombre && <small className="p-invalid">Nombre es requerido.</small>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteTransmisionDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteTransmisionDialogFooter} onHide={hideDeleteTransmisionDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {transmision && <span>¿Está seguro de que desea eliminar a <b>{transmision.nombre}</b>?</span>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteTransmisionsDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteTransmisionsDialogFooter} onHide={hideDeleteTransmisionsDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {transmision && <span>¿Está seguro de que desea eliminar los registros seleccionados?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Transmisiones;
