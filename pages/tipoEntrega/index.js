import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { InputTextarea } from 'primereact/inputtextarea';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { TipoEntregaService } from '../../demo/service/TipoEntregaService';

const tipos_entrega = () => {
    let tipoEntregaVacia = {
        idTipoEntrega: null,
        nombre: '',
        descripcion: '',
    };

    const [tipos, setTipos] = useState();
    const [tipoDialog, setTipoDialog] = useState(false);
    const [deleteTipoDialog, setDeleteTipoDialog] = useState(false);
    const [deleteTiposDialog, setDeleteTiposDialog] = useState(false);
    const [tipo, setTipo] = useState(tipoEntregaVacia);
    const [selectedTipos, setSelectedTipos] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);

    const listarTipos = () => {
        const tipoService = new TipoEntregaService();
        tipoService.getTiposEntrega().then(data => setTipos(data));
    };

    useEffect(() => {
        listarTipos();
    }, []);


    const openNew = () => {
        setTipo(tipoEntregaVacia);
        setSubmitted(false);
        setTipoDialog(true);
    }

    const hideDialog = () => {
        setSubmitted(false);
        setTipoDialog(false);
    }

    const hideDeleteTipoDialog = () => {
        setDeleteTipoDialog(false);
    }

    const hideDeleteTiposDialog = () => {
        setDeleteTiposDialog(false);
    }

    const pasoRegistro = () => {
        listarTipos();
        setTipoDialog(false);
        setTipo(tipoEntregaVacia); 
    }

    const saveTipo = async () => {
        setSubmitted(true);
        if (tipo.idTipoEntrega) {
            try {
                const tipoService = new TipoEntregaService();
                await tipoService.updateTipoEntrega(tipo);
                toast.current.show({ severity: 'success', summary: '??xito', detail: 'Tipo de Entrega Actualizada', life: 3000 });
                pasoRegistro();
            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });
            }
        }
        else {
            try {
                const tipoService = new TipoEntregaService();
                await tipoService.addTipoEntrega(tipo);
                toast.current.show({ severity: 'success', summary: '??xito', detail: 'Tipo de Entrega Creada', life: 3000 });
                pasoRegistro();
            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });                    
            }
        }   
        
    }

    const editTipo = (tipo) => {
        setTipo({ ...tipo});
        setTipoDialog(true);
    }

    const confirmDeleteTipo = (tipo) => {
        setTipo(tipo);
        setDeleteTipoDialog(true);
    }

    const deleteTipo = async () => {
        try {
            const tipoService = new TipoEntregaService();
            await tipoService.removeTipoEntrega(tipo.idTipoEntrega);
            listarTipos();
            setDeleteTipoDialog(false);
            toast.current.show({ severity: 'success', summary: '??xito', detail: 'Tipo de Entrega Eliminada', life: 3000 });
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error, life: 3000 });  
        }
    }

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteTiposDialog(true);
    }


    const deleteSelectedTipos = async () => {
        let x = ' ';
        const tipoService = new TipoEntregaService();
        selectedTipos.map(async (tipo) => {
            try {
                await tipoService.removeTipoEntrega(tipo.idTipoEntrega);
            } catch (error) {
                x = x + 'error'; 
                toast.current.show({ severity: 'error', summary: 'Error', detail: error + ` ${tipo.nombre}`, life: 3000 }); 
            }
        });
        if (x == '') {
            let _tipos = tipos.filter((val) => !selectedTipos.includes(val));
            setTipos(_tipos);
            setDeleteTiposDialog(false);
            setSelectedTipos(null);
            toast.current.show({ severity: 'success', summary: '??xito', detail: 'Tipos de Entrega Eliminadas', life: 3000 });
        }
    }


    const onInputChange = (e, nombre) => {
        const val = (e.target && e.target.value) || '';
        let _tipo = { ...tipo };
        _tipo[`${nombre}`] = val;

        setTipo(_tipo);
    }


    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                    <Button label="Eliminar" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedTipos || !selectedTipos.length} />
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
                <span className="p-column-title">C??digo</span>
                {rowData.idTipoEntrega}
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
                <span className="p-column-title">Descripci??n</span>
                {rowData.descripcion}
            </>
        );
    }

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editTipo(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning mt-2" onClick={() => confirmDeleteTipo(rowData)} />
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
            <h5 className="m-0">Listado de Tipos de Entrega</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => filter(e)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const tipoDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" className="p-button-text" onClick={saveTipo}/>
        </>
    );
    const deleteTipoDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteTipoDialog} />
            <Button label="S??" icon="pi pi-check" className="p-button-text" onClick={deleteTipo} />
        </>
    );
    const deleteTiposDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteTipoDialog} />
            <Button label="S??" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedTipos} />
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
                        value={tipos}
                        selection={selectedTipos}
                        onSelectionChange={(e) => setSelectedTipos(e.value)}
                        dataKey="idTipoEntrega"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} tipos de entrega" 
                        globalFilter={globalFilter}
                        emptyMessage="No se encontraron tipos de entrega."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem'}}></Column>
                        <Column field="idTipoEntrega" header="C??digo" sortable body={idBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="nombre" header="Nombre" sortable body={nombreBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="descripcion" header="Descripci??n" sortable body={descripcionBodyTemplate} headerStyle={{ width: '40%', minWidth: '10rem' }}></Column>
                        <Column header="Acciones" body={actionBodyTemplate}></Column>
                    </DataTable>

                    <Dialog visible={tipoDialog} style={{ width: '450px' }} header="Registro Tipos de Entrega" modal className="p-fluid" footer={tipoDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="nombre">Nombre</label>
                            <InputText id="nombre" value={tipo.nombre} onChange={(e) => onInputChange(e, 'nombre')} tooltip="Debe ingresar m??s de tres caracteres"
                            className={classNames({ 'p-invalid': submitted && !tipo.nombre })} />
                            { submitted && !tipo.nombre && <small className="p-invalid">Nombre es requerido.</small> }
                        </div>
                        <div className="field">
                            <label htmlFor="descripcion">Descripci??n</label>
                            <InputTextarea id="descripcion" value={tipo.descripcion} onChange={(e) => onInputChange(e, 'descripcion')} tooltip="Debe ingresar m??s de cinco caracteres"
                            className={classNames({ 'p-invalid': submitted && !tipo.descripcion })} />
                            { submitted && !tipo.descripcion && <small className="p-invalid">La descripci??n es requerida.</small> }
                        </div>
                    </Dialog> 

                    <Dialog visible={deleteTipoDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteTipoDialogFooter} onHide={hideDeleteTipoDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {tipo && <span>??Est?? seguro de que desea eliminar a <b>{tipo.nombre}</b>?</span>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteTiposDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteTiposDialogFooter} onHide={hideDeleteTiposDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {tipo && <span>??Est?? seguro de que desea eliminar los registros seleccionados?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default tipos_entrega;
