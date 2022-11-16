import getConfig from 'next/config';
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
import { ProveedorService } from '../../demo/service/ProveedorService';

const Proveedores = () => {
    let proveedorVacio = {
        idProveedor: null,
        nombre: '',
        correo: '',
        telefono: '',
        idPais: null,
        nombreContacto: '',
        sitioWeb: '',
    };

    const [proveedores, setProveedores] = useState(null);
    const [proveedorDialog, setProveedorDialog] = useState(false);
    const [deleteProveedorDialog, setDeleteProveedorDialog] = useState(false);
    const [deleteProveedoresDialog, setDeleteProveedoresDialog] = useState(false);
    const [proveedor, setProveedor] = useState(proveedorVacio);
    const [selectedProveedores, setSelectedProveedores] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    //const [paises, setPaises] = useState([]);
    const [codigoISO, setCodigoISO] = useState(false);

    const listarProveedores = () => {
        const proveedorService = new ProveedorService();
        proveedorService.getProveedores().then(data => setProveedores(data));
    };

    /*const listarPaises = () => {
        const paisService = new PaisService();
        paisService.getPaises().then(data => setPaises(data));
    };*/

    useEffect(() => {
        listarProveedores();  
        //listarPaises();
    }, []); 


    const paises = [
        { idPais: 1, cod_iso: 'HN'}, 
        { idPais: 2, cod_iso: 'CO' }, 
        { idPais: 3, cod_iso: 'TH' }
    ];

    const openNew = () => {
        setProveedor(proveedorVacio);
        setSubmitted(false);
        setProveedorDialog(true);
    }

    const hideDialog = () => {
        setSubmitted(false);
        setProveedorDialog(false);
        setCodigoISO('');
    }

    const hideDeleteProveedorDialog = () => {
        setDeleteProveedorDialog(false);
    }

    const hideDeleteProveedoresDialog = () => {
        setDeleteProveedoresDialog(false);
    }

    const pasoRegistro = () => {
        listarProveedores();
        setProveedorDialog(false);
        setProveedor(proveedorVacio);
        setCodigoISO('');
    }

    const saveProveedor = async () => {
        setSubmitted(true);

        if (proveedor.nombre.trim()) {
            if (proveedor.idProveedor) {
                try {
                    const proveedorService = new ProveedorService();
                    await proveedorService.updateProveedor(proveedor);
                    toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Proveedor Actualizado', life: 3000 });
                    pasoRegistro();
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails , life: 3000 });
                    //console.log(error.errorDetails);
                }
            }
            else {
                try {
                    const proveedorService = new ProveedorService();
                    await proveedorService.addProveedor(proveedor);
                    toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Proveedor Creado', life: 3000 });
                    pasoRegistro();
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails , life: 3000 });
                }
            }
        }
    }

    const getCodIso = (id) => {
        let cod_ = {};
        paises.map((pais) => {
            if (pais.idPais == id) {
                cod_ = pais;
            }
        });
        return cod_;
    }

    const editProveedor = (proveedor) => {
        setProveedor({ ...proveedor });
        setCodigoISO(getCodIso(proveedor.idPais));
        setProveedorDialog(true);
    }

    const confirmDeleteProveedor = (proveedor) => {
        setProveedor(proveedor);
        setDeleteProveedorDialog(true);
    }

    const deleteProveedor = async () => {
        try {
            const proveedorService = new ProveedorService();
            await proveedorService.removeProveedor(proveedor.idProveedor);
            listarProveedores();
            setDeleteProveedorDialog(false);
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Proveedor Eliminado', life: 3000 });
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        }
    }


    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteProveedoresDialog(true);
    }

    const deleteSelectedProveedores = () => {
        const proveedorService = new ProveedorService();
        selectedProveedores.map(async (proveedor) => {
            await proveedorService.removeProveedor(proveedor.idProveedor);
        });
        let _proveedores = proveedores.filter(val => !selectedProveedores.includes(val));
        setProveedores(_proveedores);
        setDeleteProveedoresDialog(false);
        setSelectedProveedores(null);
        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Proveedores Eliminados', life: 3000 });
    }


    const onInputChange = (e, nombre) => {
        const val = (e.target && e.target.value) || '';
        let _proveedor = { ...proveedor };
        if (nombre == 'idPais') {
            _proveedor[`${nombre}`] = val.idPais;
            setCodigoISO(e.value);
        } else {
            _proveedor[`${nombre}`] = val;
        }

        setProveedor(_proveedor);
    }


    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                    <Button label="Eliminar" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedProveedores || !selectedProveedores.length} />
                </div>
            </React.Fragment>
        )
    }

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                {/* <FileUpload mode="basic" accept="image/*" maxFileSize={1000000} label="Importar" chooseLabel="Import" className="mr-2 inline-block" /> */}
                <Button label="Exportar" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />
            </React.Fragment>
        )
    }

    const idBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Código</span>
                {rowData.idProveedor}
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

    const correoBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Correo</span>
                {rowData.correo}
            </>
        )
    }

    const telefonoBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Teléfono</span>
                {rowData.telefono}
            </>
        );
    }

    const paisBodyTemplate = (rowData) => {
        let codIso = '';
        paises.map((pais) => {
            if (rowData.idPais == pais.idPais) {
                codIso = pais.cod_iso;
            }
        });
        return (
            <>
                <span className="p-column-title">Código ISO</span>
                {codIso}
            </>
        );
    }

    const contactoBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Contacto</span>
                {rowData.nombreContacto}
            </>
        );
    }

    const sitioWebBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Sitio Web</span>
                {rowData.sitioWeb}
            </>
        )
    }

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editProveedor(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning mt-2" onClick={() => confirmDeleteProveedor(rowData)} />
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
            <h5 className="m-0">Listado de Proveedores</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => filter(e)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const proveedorDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" className="p-button-text" onClick={saveProveedor} />
        </>
    );
    const deleteProveedorDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteProveedorDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteProveedor} />
        </>
    );
    const deleteProveedoresDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteProveedoresDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedProveedores} />
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
                        value={proveedores}
                        selection={selectedProveedores}
                        onSelectionChange={(e) => setSelectedProveedores(e.value)}
                        dataKey="idProveedor"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} proveedores" 
                        globalFilter={globalFilter}
                        emptyMessage="No se encontraron proveedores."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem'}}></Column>
                        <Column field="idProveedor" header="Código" sortable body={idBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="nombre" header="Nombre" sortable body={nombreBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="correo" header="Correo" sortable body={correoBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="telefono" header="Teléfono" body={telefonoBodyTemplate} sortable headerStyle={{ width: '14%', minWidth: '8rem' }}></Column>
                        <Column field="idPais" header="Código ISO" sortable body={paisBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="nombreContacto" header="Contacto" body={contactoBodyTemplate} sortable headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="sitioWeb" header="Sitio Web" body={sitioWebBodyTemplate} sortable headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column header="Acciones" body={actionBodyTemplate}  headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={proveedorDialog} style={{ width: '450px' }} header="Detalles de Proveedor" modal className="p-fluid" footer={proveedorDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="nombre">Nombre</label>
                            <InputText id="nombre" value={proveedor.nombre} onChange={(e) => onInputChange(e, 'nombre')} required autoFocus className={classNames({ 'p-invalid': submitted && !proveedor.nombre })} />
                            {submitted && !proveedor.nombre && <small className="p-invalid">El nombre es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="correo">Correo</label>
                            <InputText id="correo" value={proveedor.correo} onChange={(e) => onInputChange(e, 'correo')} required autoFocus className={classNames({ 'p-invalid': submitted && !proveedor.correo })} />
                            {submitted && !proveedor.correo && <small className="p-invalid">El correo es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="telefono">Teléfono</label>
                            <InputText id="telefono" type="number" value={proveedor.telefono} onChange={(e) => onInputChange(e, 'telefono')} required autoFocus className={classNames({ 'p-invalid': submitted && !proveedor.telefono })} />
                            {submitted && !proveedor.telefono && <small className="p-invalid">El teléfono es requerido.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="cod_iso">Código ISO</label>
                            <Dropdown id="cod_iso" options={paises} value={codigoISO} onChange={(e) => onInputChange(e, 'idPais')} optionLabel="cod_iso" />
                        </div>
                        <div className="field">
                            <label htmlFor="nombreContacto">Contacto</label>
                            <InputText id="nombreContacto" value={proveedor.nombreContacto} onChange={(e) => onInputChange(e, 'nombreContacto')} required autoFocus className={classNames({ 'p-invalid': submitted && !proveedor.nombreContacto })} />
                            {submitted && !proveedor.nombreContacto && <small className="p-invalid">El nombre de contacto es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="sitioWeb">Sitio Web</label>
                            <InputText id="sitioWeb" value={proveedor.sitioWeb} onChange={(e) => onInputChange(e, 'sitioWeb')} required autoFocus className={classNames({ 'p-invalid': submitted && !proveedor.sitioWeb })} />
                            {submitted && !proveedor.sitioWeb && <small className="p-invalid">El sitio web es requerido.</small>}
                        </div>
                    </Dialog> 

                    <Dialog visible={deleteProveedorDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteProveedorDialogFooter} onHide={hideDeleteProveedorDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {proveedor && <span>¿Está seguro de que desea eliminar a <b>{proveedor.nombre}</b>?</span>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteProveedoresDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteProveedoresDialogFooter} onHide={hideDeleteProveedoresDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {proveedor && <span>¿Está seguro de que desea eliminar los registros seleccionados?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Proveedores;
