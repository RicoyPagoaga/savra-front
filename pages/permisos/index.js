import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { PermisoService } from '../../demo/service/PermisoService';

const Permisos = () => {
    let permisoVacio = {
        idPermiso: null,
        nombre: '',
        descripcion: ''
    };

    let emptyRestApiError = {
        httpStatus: '',
        errorMessage: '',
        errorDetails: ''
    };

    const [permisos, setPermisos] = useState(null);
    const [permisoDialog, setPermisoDialog] = useState(false);
    const [deletePermisoDialog, setDeletePermisoDialog] = useState(false);
    const [deletePermisosDialog, setDeletePermisosDialog] = useState(false);
    const [permiso, setPermiso] = useState(permisoVacio);
    const [apiError, setApiError] = useState(emptyRestApiError);
    const [selectedPermisos, setSelectedPermisos] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);

    const listarPermisos = () => {
        const permisoService = new PermisoService();
        permisoService.getPermisos().then(data => setPermisos(data));
    };

    useEffect(() => {
        listarPermisos();
    }, []);

    const openNew = () => {
        setPermiso(permisoVacio);
        setSubmitted(false);
        setPermisoDialog(true);
    }

    const hideDialog = () => {
        setSubmitted(false);
        setPermisoDialog(false);
    }

    const hideDeletePermisoDialog = () => {
        setDeletePermisoDialog(false);
    }

    const hideDeletePermisosDialog = () => {
        setDeletePermisosDialog(false);
    }

    const pasoRegistro = () => {
        listarPermisos();
        setPermisoDialog(false);
        setPermiso(permisoVacio);
    }

    const savePermiso = async () => {
        setSubmitted(true);
        if (permiso.idPermiso) {
            try {
                const permisoService = new PermisoService();
                await permisoService.updatePermiso(permiso);
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Permiso Actualizado (^‿^)', life: 3000 });
                pasoRegistro();
            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });
            }
        }
        else {
            try {
                const permisoService = new PermisoService();
                await permisoService.addPermiso(permiso);
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Permiso Creado (^‿^)', life: 3000 });
                pasoRegistro();
            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });

            }
        }
    }

    const editPermiso = (permiso) => {
        setPermiso({ ...permiso });
        setPermisoDialog(true);
    }

    const confirmDeletePermiso = (permiso) => {
        setPermiso(permiso);
        setDeletePermisoDialog(true);
    }

    const deletePermiso = async () => {
        const permisoService = new PermisoService();
        await permisoService.removePermiso(permiso.idPermiso);
        listarPermisos();
        setDeletePermisoDialog(false);
        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Permiso Eliminado', life: 3000 });
    }

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeletePermisosDialog(true);
    }


    const deleteSelectedPermisos = async () => {
        const permisoService = new PermisoService();
        selectedPermisos.map(async (permiso) => {
        await permisoService.removePermiso(permiso.idPermiso);
        });
        let _permisos = permisos.filter((val) => !selectedPermisos.includes(val));
        setPermisos(_permisos);
        setDeletePermisosDialog(false);
        setSelectedPermisos(null);
        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Permisos Eliminados ', life: 3000 });
    }


    const onInputChange = (e, nombre) => {
        const val = (e.target && e.target.value) || '';
        let _permiso = { ...permiso };
        _permiso[`${nombre}`] = val;

        setPermiso(_permiso);
    }


    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                    <Button label="Eliminar" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedPermisos || !selectedPermisos.length} />
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
                <span className="p-column-title">ID Permiso</span>
                {rowData.idPermiso}
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
                <span className="p-column-title">descripcion</span>
                {rowData.descripcion}
            </>
        );
    }


    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editPermiso(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning mt-2" onClick={() => confirmDeletePermiso(rowData)} />
            </div>
        );
    }

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Listado Permisos De Usuarios</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const permisoDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" className="p-button-text" onClick={savePermiso} />
        </>
    );
    const deletePermisoDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeletePermisoDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deletePermiso} />
        </>
    );
    const deletePermisosDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeletePermisosDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedPermisos} />
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
                        value={permisos}
                        selection={selectedPermisos}
                        onSelectionChange={(e) => setSelectedPermisos(e.value)}
                        dataKey="idPermiso"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Permisos"
                        globalFilter={globalFilter}
                        emptyMessage="No se encontraron Permisos."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                        <Column field="idPermiso" header="ID" sortable body={idBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="nombre" header="Nombre" sortable body={nombreBodyTemplate} headerStyle={{ width: '14%', minWidth: '20rem' }}></Column>
                        <Column field="descripcion" header="Descripción" sortable body={descripcionBodyTemplate} headerStyle={{ width: '14%', minWidth: '20rem' }}></Column>
                        <Column header="Acciones" body={actionBodyTemplate}></Column>
                    </DataTable>

                    <Dialog visible={permisoDialog} style={{ width: '450px' }} header="Registro de Permisos" modal className="p-fluid" footer={permisoDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="nombre">Nombre</label>
                            <InputText id="nombre" value={permiso.nombre} onChange={(e) => onInputChange(e, 'nombre')} required autoFocus className={classNames({ 'p-invalid': submitted && !permiso.nombre })}tooltip="Ingrese un nombre de permiso" />
                            {submitted && !permiso.nombre && <small className="p-invalid">Nombre permiso es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="descripcion">Descripción</label>
                            <InputText id="descripcion" value={permiso.descripcion} onChange={(e) => onInputChange(e, 'descripcion')}  className={classNames({ 'p-invalid': submitted && !permiso.descripcion })}tooltip="Ingrese una descripción relacionada al permiso" />
                            {submitted && !permiso.descripcion && <small className="p-invalid">Descripcion permiso es requerido.</small>}
                        </div>
                    </Dialog>

                    <Dialog visible={deletePermisoDialog} style={{ width: '450px' }} header="Confirm" modal footer={deletePermisoDialogFooter} onHide={hideDeletePermisoDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {permiso && <span>¿Está seguro de que desea eliminar a <b>{permiso.nombre}</b>?</span>}
                        </div>
                    </Dialog>

                    <Dialog visible={deletePermisosDialog} style={{ width: '450px' }} header="Confirm" modal footer={deletePermisosDialogFooter} onHide={hideDeletePermisosDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {permiso && <span>¿Está seguro de que desea eliminar los registros seleccionados?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Permisos;
