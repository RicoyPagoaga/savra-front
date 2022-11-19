import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { ModeloService } from '../../demo/service/ModeloService';
import { MarcaService } from '../../demo/service/MarcaService';

const Modelos = () => {
    let modeloVacio = {
        idModelo: null,
        nombre: '',
        idMarca: null,
    };

    const [modelos, setModelos] = useState();
    const [modeloDialog, setModeloDialog] = useState(false);
    const [deleteModeloDialog, setDeleteModeloDialog] = useState(false);
    const [deleteModelosDialog, setDeleteModelosDialog] = useState(false);
    const [marcas, setMarcas] = useState([]);
    const [marca, setMarca] = useState(null);
    const [modelo, setModelo] = useState(modeloVacio);
    const [selectedModelos, setSelectedModelos] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null)


    const listarMarcas = () => {
        const marcaService = new MarcaService();
        marcaService.getMarcas().then(data => setMarcas(data));
    };
 

    const listarModelos = () => {
        const modeloService = new ModeloService();
        modeloService.getModelos().then(data => setModelos(data));
    };

    useEffect(() => {
        listarModelos();
        listarMarcas();
    }, []);

    const openNew = () => {
        setModelo(modeloVacio);
        setSubmitted(false);
        setModeloDialog(true);
    }

    const hideDialog = () => {
        setSubmitted(false);
        setModeloDialog(false);
        setMarca('');
    }

    const hideDeleteModeloDialog = () => {
        setDeleteModeloDialog(false);
    }

    const hideDeleteModelosDialog = () => {
        setDeleteModelosDialog(false);
    }

    const pasoRegistro = () => {
        listarModelos();
        setModeloDialog(false);
        setModelo(modeloVacio);
        setMarca('');
    }

    const saveModelo = async () => {
        setSubmitted(true);
        if (modelo.nombre.trim()) {
            if (modelo.idModelo) {
                try {
                    const modeloService = new ModeloService();
                    await modeloService.updateModelo(modelo);
                    toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Modelo Actualizado', life: 3000 });
                    pasoRegistro();
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails , life: 3000 });
                }
            }
            else {
                try {
                    const modeloService = new ModeloService();
                    await modeloService.addModelo(modelo);
                    toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Modelo Creado', life: 3000 });
                    pasoRegistro();
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails , life: 3000 });
                }    
            }
            
        }
    }

    const getMarca = (id) => {
        let marca_ = {};
        marcas.map((marca) => {
            if(marca.idMarca == id) {
                marca_ = marca;
            }
        });
        return marca_;
    }

    const editModelo = (modelo) => {
        setModelo({ ...modelo});
        setMarca(getMarca(modelo.idMarca));
        setModeloDialog(true);
    }

    const confirmDeleteModelo = (modelo) => {
        setModelo(modelo);
        setDeleteModeloDialog(true);
    }

    const deleteModelo = async () => {
        try {
            const modeloService = new ModeloService();
            await modeloService.removeModelo(modelo.idModelo);
            listarModelos();
            setDeleteModeloDialog(false);
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Modelo Eliminado', life: 3000 });   
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error, life:3000 });  
        }
    }

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteModelosDialog(true);
    }


    const deleteSelectedModelos = async () => {
        const modeloService = new ModeloService();
        selectedModelos.map(async (modelo) => {
            await modeloService.removeModelo(modelo.idModelo);
        });
        let _modelos = modelos.filter((val) => !selectedModelos.includes(val));
        setModelos(_modelos);
        setDeleteModelosDialog(false);
        setSelectedModelos(null);
       
        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Modelos Eliminados', life: 3000 });
    }


    const onInputChange = (e, nombre) => {
        const val = (e.target && e.target.value) || '';
        let _modelo = { ...modelo };
        if (nombre != 'idMarca')
            _modelo[`${nombre}`] = val;
        else {
            _modelo[`${nombre}`] = val.idMarca;
            setMarca(e.value)
        }
        
        setModelo(_modelo);
    }

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                    <Button label="Eliminar" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedModelos || !selectedModelos.length} />
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
                {rowData.idModelo}
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

    const marcaBodyTemplate = (rowData) => {
        let marcaNombre = '';
        marcas.map((marca) =>{
            if(rowData.idMarca == marca.idMarca) {
                marcaNombre = marca.nombre;
            }
        });
        return (
            <>
                <span className="p-column-title">Marca</span>
                {marcaNombre}
            </>
        );
    }

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editModelo(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning mt-2" onClick={() => confirmDeleteModelo(rowData)} />
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
            <h5 className="m-0">Listado de Modelos</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => filter(e)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const modeloDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" className="p-button-text" onClick={saveModelo}/>
        </>
    );
    const deleteModeloDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteModeloDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteModelo} />
        </>
    );
    const deleteModelosDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteModelosDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedModelos} />
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
                        value={modelos}
                        selection={selectedModelos}
                        onSelectionChange={(e) => setSelectedModelos(e.value)}
                        dataKey="idModelo"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} modelos" 
                        globalFilter={globalFilter}
                        emptyMessage="No se encontraron modelos."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem'}}></Column>
                        <Column field="idModelo" header="Código" sortable body={idBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="nombre" header="Nombre" sortable body={nombreBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="idMarca" header="Marca" sortable body={marcaBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column header="Acciones" body={actionBodyTemplate}></Column>
                    </DataTable>

                    <Dialog visible={modeloDialog} style={{ width: '450px' }} header="Registro Modelos" modal className="p-fluid" footer={modeloDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="nombre">Nombre</label>
                            <InputText id="nombre" value={modelo.nombre} onChange={(e) => onInputChange(e, 'nombre')} required autoFocus className={classNames({ 'p-invalid': submitted && !modelo.nombre })} />
                            { submitted && !modelo.nombre && <small className="p-invalid">Nombre es requerido.</small> }
                            
                        </div>
                        <div className="field">
                            <label htmlFor="marca">Marca</label>
                            <Dropdown id="marca" options={marcas} value={marca} onChange={(e) => onInputChange(e, 'idMarca')} optionLabel="nombre"></Dropdown>
                        </div>
                    </Dialog> 

                    <Dialog visible={deleteModeloDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteModeloDialogFooter} onHide={hideDeleteModeloDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {modelo && <span>¿Está seguro de que desea eliminar a <b>{modelo.nombre}</b>?</span>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteModelosDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteModelosDialogFooter} onHide={hideDeleteModelosDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {modelo && <span>¿Está seguro de que desea eliminar los registros seleccionados?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Modelos;