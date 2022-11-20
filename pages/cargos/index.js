import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { CargoService } from '../../demo/service/CargoService';

const Cargos = () => {
    let cargoVacio = {
        idCargo: null,
        nombre: '',
        descrpcion:''
    };

    let emptyRestApiError = {
        httpStatus : '',
        errorMessage: '',
        errorDetails: ''
    };

    const [cargos, setCargos] = useState(null);
    const [cargoDialog, setCargoDialog] = useState(false);
    const [deleteCargoDialog, setDeleteCargoDialog] = useState(false);
    const [deleteCargosDialog, setDeleteCargosDialog] = useState(false);
    const [cargo, setCargo] = useState(cargoVacio);
    const [apiError, setApiError] = useState(emptyRestApiError);
    const [selectedCargos, setSelectedCargos] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);

    const listarCargos = () => {
        const cargoService = new CargoService();
        cargoService.getCargos().then(data => setCargos(data));
    };

    useEffect(() => {
        listarCargos();
    }, []);

    const openNew = () => {
        setCargo(cargoVacio);
        setSubmitted(false);
        setCargoDialog(true);
    }

    const hideDialog = () => {
        setSubmitted(false);
        setCargoDialog(false);
    }

    const hideDeleteCargoDialog = () => {
        setDeleteCargoDialog(false);
    }

    const hideDeleteCargosDialog = () => {
        setDeleteCargosDialog(false);
    }

    const pasoRegistro = () => {
        listarCargos();
        setCargoDialog(false);
        setCargo(cargoVacio); 
    }

    const saveCargo = async () => {
        setSubmitted(true);
        if (cargo.nombre.trim()) {
            if (cargo.idCargo) {
               try {
                    const cargoService = new CargoService();
                    await cargoService.updateCargo(cargo);
                    toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Cargo Actualizado (^‿^)', life: 3000 });
                    pasoRegistro();
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });
                }
            }
            else {
                try {
                    const cargoService = new CargoService();
                    await cargoService.addCargo(cargo);
                    toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Cargo Creado (^‿^)', life: 3000 });
                    pasoRegistro();
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });                    
    
                }
            }
        }   
        
    }

    const editCargo = (cargo) => {
        setCargo({ ...cargo});
        setCargoDialog(true);
    }

    const confirmDeleteCargo = (cargo) => {
        setCargo(cargo);
        setDeleteCargoDialog(true);
    }

    const deleteCargo = async () => {
        const cargoService = new CargoService();
        await cargoService.removeCargo(cargo.idCargo);
        listarCargos();
        setDeleteCargoDialog(false);
        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Cargo Eliminado', life: 3000 });
    }

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteCargosDialog(true);
    }


    const deleteSelectedCargos = async () => {
        const cargoService = new CargoService();
        selectedCargos.map(async (cargo) => {
            await cargoService.removeCargo(cargo.idCargo);
        });
        let _cargos = cargos.filter((val) => !selectedCargos.includes(val));
        setCargos(_cargos);
        setDeleteCargosDialog(false);
        setSelectedCargos(null);
        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Cargos Eliminados ', life: 3000 });
    }


    const onInputChange = (e, nombre) => {
        const val = (e.target && e.target.value) || '';
        let _cargo = { ...cargo };
        _cargo[`${nombre}`] = val;

        setCargo(_cargo);
    }


    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                    <Button label="Eliminar" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedCargos || !selectedCargos.length} />
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
                <span className="p-column-title">ID Cargo</span>
                {rowData.idCargo}
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
    const descrpcionBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">descrpcion</span>
                {rowData.descrpcion}
            </>
        );
    }
    

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editCargo(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning mt-2" onClick={() => confirmDeleteCargo(rowData)} />
            </div>
        );
    }

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Cargos de personal</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const cargoDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" className="p-button-text" onClick={saveCargo}/>
        </>
    );
    const deleteCargoDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteCargoDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteCargo}   />
        </>
    );
    const deleteCargosDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteCargosDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedCargos} />
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
                        value={cargos}
                        selection={selectedCargos}
                        onSelectionChange={(e) => setSelectedCargos(e.value)}
                        dataKey="idCargo"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Cargos" 
                        globalFilter={globalFilter}
                        emptyMessage="No se encontraron Cargos."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem'}}></Column>
                        <Column field="idCargo" header="ID" sortable body={idBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="nombre" header="Nombre" sortable body={nombreBodyTemplate} headerStyle={{ width: '14%', minWidth: '20rem' }}></Column>
                        <Column field="descrpcion" header="Descripción" sortable body={descrpcionBodyTemplate} headerStyle={{ width: '14%', minWidth: '20rem' }}></Column>
                        <Column header="Acciones" body={actionBodyTemplate}></Column>
                    </DataTable>

                    <Dialog visible={cargoDialog} style={{ width: '450px' }} header="Registro de Cargos" modal className="p-fluid" footer={cargoDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="nombre">Nombre</label>
                            <InputText id="nombre" value={cargo.nombre} onChange={(e) => onInputChange(e, 'nombre')} required autoFocus className={classNames({ 'p-invalid': submitted && !cargo.nombre })} />
                            { submitted && !cargo.nombre && <small className="p-invalid">Nombre cargo es requerido.</small> }
                        </div>
                        <div className="field">
                            <label htmlFor="descrpcion">Descripción</label>
                            <InputText id="descrpcion" value={cargo.descrpcion} onChange={(e) => onInputChange(e, 'descrpcion')} required autoFocus className={classNames({ 'p-invalid': submitted && !cargo.descrpcion })} />
                            { submitted && !cargo.descrpcion && <small className="p-invalid">Descripcion cargo es requerido.</small> }
                        </div>
                    </Dialog> 

                    <Dialog visible={deleteCargoDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteCargoDialogFooter} onHide={hideDeleteCargoDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {cargo && <span>¿Está seguro de que desea eliminar a <b>{cargo.nombre}</b>?</span>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteCargosDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteCargosDialogFooter} onHide={hideDeleteCargosDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {cargo && <span>¿Está seguro de que desea eliminar los registros seleccionados?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Cargos;
