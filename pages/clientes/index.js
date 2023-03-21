import getConfig from 'next/config';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { ClienteService } from '../../demo/service/clienteservice';
import { TipoDocumentoService } from '../../demo/service/TipoDocumentoService';
import { CategoriaClienteService } from '../../demo/service/CategoriaClienteService';
import { autenticacionRequerida } from '../../utils/AutenticacionRequerida';
import { useSession } from 'next-auth/react'
import { AccionService } from '../../demo/service/AccionService';

const Clientes = () => {
    let emptyCliente = {
        idCliente: null,
        nombre: '',
        documento: '',
        tipoDocumento: null,
        telefono: '',
        direccion: '',
        categoria: null
    };

    let emptyRestApiError = {
        httpStatus: '',
        errorMessage: '',
        errorDetails: ''
    };

    const [clientes, setClientes] = useState([]);
    const [tipoDocumentos, setTipoDocumentos] = useState([]);
    const [tipoDocumento, setTipoDocumento] = useState(null);
    const [categoriaClientes, setCategoriaClientes] = useState([]);
    const [categoriaCliente, setCategoriaCliente] = useState(null);
    const [clienteDialog, setClienteDialog] = useState(false);
    const [deleteClienteDialog, setDeleteClienteDialog] = useState(false);
    const [deleteClientesDialog, setDeleteClientesDialog] = useState(false);
    const [cliente, setCliente] = useState(emptyCliente);
    const [apiError, setApiError] = useState(emptyRestApiError);
    const [selectedClientes, setSelectedClientes] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;
    const { data: session } = useSession();

    const [permisos, setPermisos] = useState([]);
    const [cargando, setCargando] = useState(true);
    //Estado de acciones
    const [verLista, setVerLista] = useState(false);
    const [buscar, setBuscar] = useState(false);
    const [agregar, setAgregar] = useState(false);
    const [actualizar, setActualizar] = useState(false);
    const [eliminar, setEliminar] = useState(false);
    const [exportarCVS, setExportarCVS] = useState(false);
    const [exportarXLS, setExportarXLS] = useState(false);
    const [exportarPDF, setExportarPDF] = useState(false);



    const listarClientes = () => {
        const clienteservice = new ClienteService();
        clienteservice.getClientes().then(data => setClientes(data));
    };
    const listarTipoDocumentos = async () => {
        const tiposDocumentoService = new TipoDocumentoService();
        await tiposDocumentoService.getTipoDocumentos().then(data => setTipoDocumentos(data));
    };
    const listarCategoriasClientes = async () => {
        const categoriaservice = new CategoriaClienteService();
        await categoriaservice.getCategoriaClientes().then(data => setCategoriaClientes(data));
    };

    let obtenerRol = () => {
        var info = session.user.email.split('/');
        return info[4]
    }
    const listarPermisos = () => {
        const accionService = new AccionService();
        accionService.getAccionesModuloRol(obtenerRol(), 'Clientes').then(data => {setPermisos(data) , setCargando(false) });
    };

    const permisosDisponibles = () => {
        permisos.forEach(element => {
            switch (element.nombre) {
                case "Ver Lista":
                    setVerLista(true);
                    break;
                case "Buscar":
                    setBuscar(true);
                    break;
                case "Registrar":
                    console.log('Hola3.2')
                    setAgregar(true);
                    break;
                case "Actualizar":
                    setActualizar(true);
                    break;
                case "Eliminar":
                    setEliminar(true);
                    break;
                case "Exportar CSV":
                    setExportarCVS(true);
                    break;
                case "Exportar Excel":
                    setExportarXLS(true);
                    break;
                case "Exportar PDF":
                    setExportarPDF(true);
                    break;
                default:
                    break;
            }
        });
    };

    useEffect(async () => {
        listarClientes();
        await listarTipoDocumentos();
        await listarCategoriasClientes();
        permisosDisponibles();
        listarPermisos();
        console.log(clientes);
    }, []);

    useEffect(() => {
        permisosDisponibles();
    }, [cargando]);
    //const [documentosItem,setOpcionesDocumentoItem] = useState(null);
    //const documentosItem = tipoDocumentos.map((idTipoDocumento) =>{
    //})
    const openNew = () => {
        setCliente(emptyCliente);
        setTipoDocumento(null);
        setCategoriaCliente(null);
        setSubmitted(false);
        setClienteDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setClienteDialog(false);
    };

    const hideDeleteClienteDialog = () => {
        setDeleteClienteDialog(false);
    };

    const hideDeleteClientesDialog = () => {
        setDeleteClientesDialog(false);
    };

    const pasoRegistro = () => {
        listarClientes();
        setClienteDialog(false);
        setCliente(emptyCliente);
    }

    const saveCliente = async () => {
        setSubmitted(true);

        if (cliente.idCliente) {
            try {
                const clienteservice = new ClienteService();
                await clienteservice.updateCliente(cliente);
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Cliente Actualizado', life: 3000 });
                pasoRegistro();
            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });
            }
        } else {
            try {
                const clienteservice = new ClienteService();
                await clienteservice.addCliente(cliente);
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Cliente Registrado', life: 3000 });
                pasoRegistro();
            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });
            }
        };
    };

    const editCliente = (cliente) => {
        setCliente({ ...cliente });
        setClienteDialog(true);
    };
    const deleteCliente = async () => {
        try {
            const clienteservice = new ClienteService();
            await clienteservice.removeCliente(cliente.idCliente);
            listarClientes();
            setDeleteClienteDialog(false);
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Cliente Eliminado', life: 3000 });
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        }
    };
    const confirmDeleteCliente = (cliente) => {
        setCliente(cliente);
        setDeleteClienteDialog(true);
    };

    const cols = [
        { field: 'idCliente', header: 'ID' },
        { field: 'nombre', header: 'Nombre' },
        { field: 'documento', header: 'Documento' },
        { field: 'tipoDocumento', header: 'Tipo de Documento' },
        { field: 'telefono', header: 'Teléfono' },
        { field: 'direccion', header: 'Dirección' },
        { field: 'categoria', header: 'Categoría' }
    ];
    const exportColumns = cols.map(col => ({ title: col.header, dataKey: col.field }));

    let objModificado = clientes.map(function (element) {
        return {
            idCliente: element.idCliente,
            nombre: element.nombre,
            documento: element.documento,
            tipoDocumento: element.tipoDocumento?element.tipoDocumento.nombreDocumento:'',
            telefono: element.telefono,
            direccion: element.direccion,
            categoria: element.categoria?element.categoria.nombre: ''
        };
    })

    const exportCSV = (selectionOnly) => {
        dt.current.exportCSV({ selectionOnly });
    };
    const exportPdf = () => {
        import('jspdf').then((jsPDF) => {
            import('jspdf-autotable').then(() => {
                const doc = new jsPDF.default('portrait');
                var image = new Image();
                var fontSize = doc.internal.getFontSize();
                const docWidth = doc.internal.pageSize.getWidth();
                const docHeight = doc.internal.pageSize.getHeight();
                const txtWidth = doc.getStringUnitWidth('CLIENTES REGISTRADOS') * fontSize / doc.internal.scaleFactor;
                const x = (docWidth - txtWidth) / 2;
                image.src = '../layout/images/img_facturalogo2.png';
                doc.addImage(image, 'PNG', 10, 0, 50, 30);
                //centrar texto:
                doc.text('CLIENTES REGISTRADOS', x, 15);
                doc.setFontSize(12);
                doc.text(15, 30, 'Usuario: ' + session.user.name);
                doc.text(15, 36, 'Fecha: ' + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString());
                doc.text(docWidth - 15, 30, 'Total Clientes: ' + clientes.length, { align: "right" });
                doc.line(15, 40, docWidth - 15, 40);
                doc.autoTable(exportColumns, objModificado, { margin: { top: 45, bottom: 25 } });
                const pageCount = doc.internal.getNumberOfPages();
                for (var i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    doc.line(15, docHeight - 20, docWidth - 15, docHeight - 20);
                    doc.text('Página ' + String(i) + '/' + pageCount, docWidth - 15, docHeight - 10, { align: "right" });
                }
                doc.save('Reporte_Clientes.pdf');
            });
        });
    };

    const exportExcel = () => {
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(objModificado);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array'
            });

            saveAsExcelFile(excelBuffer, 'Reporte_Clientes');
        });
    };
    const saveAsExcelFile = (buffer, fileName) => {
        import('file-saver').then((module) => {
            if (module && module.default) {
                let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
                let EXCEL_EXTENSION = '.xlsx';
                const data = new Blob([buffer], {
                    type: EXCEL_TYPE
                });

                module.default.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
            }
        });
    };
    const confirmDeleteSelected = () => {
        setDeleteClientesDialog(true);
    }
    const deleteSelectedClientes = () => {
        let x = ' ';
        const clienteService = new ClienteService();
        selectedClientes.map(async (cliente) => {
            try {
                await clienteService.removeCliente(cliente.idCliente);
            } catch (error) {
                x = x + 'error';
                toast.current.show({ severity: 'error', summary: 'Error', detail: error + ` ${cliente.nombre}`, life: 3000 });
            }
        });
        if (x == '') {
            let _clientes = clientes.filter((val) => !selectedClientes.includes(val));
            setClientes(_clientes);
            setDeleteClientesDialog(false);
            setSelectedClientes(null);
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Clientes Eliminados', life: 3000 });
        }
    };

    const onInputChange = (e, nombre) => {
        const val = (e.target && e.target.value) || '';
        let _cliente = { ...cliente };
        if (nombre == 'idTipoDocumento') {
            _cliente[`${nombre}`] = val;
            setTipoDocumento(e.value);
        } else if (nombre == 'idCategoria') {
            _cliente[`${nombre}`] = val;
            setCategoriaCliente(e.value);
        } else {
            _cliente[`${nombre}`] = val;
        }
        //console.log(val);
        setCliente(_cliente);

    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    {agregar?<Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />:null}
                    {eliminar?<Button label="Eliminar" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedClientes || !selectedClientes.length} />:null}
                </div>
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                {exportarCVS ?<Button type="button" icon="pi pi-file" onClick={() => exportCSV(false)} className="mr-2" tooltip="CSV" tooltipOptions={{ position: 'bottom' }} /> : null}
                {exportarXLS ? <Button type="button" icon="pi pi-file-excel" onClick={exportExcel} className="p-button-success mr-2" tooltip="XLSX" tooltipOptions={{ position: 'bottom' }} /> : null}
                {exportarPDF ? <Button type="button" icon="pi pi-file-pdf" onClick={exportPdf} className="p-button-warning mr-2" tooltip="PDF" tooltipOptions={{ position: 'bottom' }} /> : null}
            </React.Fragment>
        );
    };

    const idBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">ID Cliente</span>
                {rowData.idCliente}
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

    const documentoBodyTemplate = (rowData) => {
        console.log(rowData.documento)
        return (
            <>
                <span className="p-column-title">Documento</span>
                {rowData.documento == null ? ' ' : rowData.documento}
            </>
        );
    };

    const idTipoDocumentoBodyTemplate = (rowData) => {

        return (
            <>
                <span className="p-column-title">Id Tipo Documento</span>
                {
                    rowData.documento == null ? ' ' : rowData.tipoDocumento.nombreDocumento
                }

            </>
        );


    };
    const telefonoBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Telefono</span>
                {rowData.telefono == null ? ' ' : rowData.telefono}
            </>
        );
    };
    const direccionBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Direccion</span>
                {rowData.direccion == null ? ' ' : rowData.direccion}
            </>
        );
    };
    const idCategoriaBodyTemplate = (rowData) => {

        return (
            <>
                <span className="p-column-title">Id Categoria</span>
                {rowData.categoria == null ? ' ' : rowData.categoria.nombre}
            </>
        );

    };

    const actionBodyTemplate = (rowData) => {
        const clientefinal = false;
        if (rowData.idCliente === 1) {
            clientefinal = true;
        }
        return (
            <>
                {actualizar?<Button icon="pi pi-pencil" disabled={clientefinal} className="p-button-rounded p-button-success mr-2" onClick={() => editCliente(rowData)} />:null}
                {eliminar?<Button icon="pi pi-trash" disabled={clientefinal} className="p-button-rounded p-button-warning" onClick={() => confirmDeleteCliente(rowData)} />:null}
            </>
        );
    };

    const filter = (e) => {
        let x = e.target.value;

        if (x.trim() != '')
            setGlobalFilter(x);
        else
            setGlobalFilter(' ');
    }

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Listado de Clientes</h5>
            {buscar?<span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => filter(e)} placeholder="Buscar..." />
            </span>:null}
        </div>
    );

    const clienteDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Registar" icon="pi pi-check" className="p-button-text" onClick={saveCliente} />
        </>
    );
    const deleteClienteDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteClienteDialog} />
            <Button label="Si" icon="pi pi-check" className="p-button-text" onClick={deleteCliente} />
        </>
    );
    const deleteClientesDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteClientesDialog} />
            <Button label="Si" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedClientes} />
        </>
    );
    if(cargando){
        return 'Cargando...'
    }
    if (permisos.length > 0) {
        return (
            <div className="grid crud-demo">
                <div className="col-12">
                    <div className="card">
                        <Toast ref={toast} />
                        <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
    
                        <DataTable
                            ref={dt}
                            value={clientes}
                            selection={selectedClientes}
                            onSelectionChange={(e) => setSelectedClientes(e.value)}
                            dataKey="idCliente"
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25]}
                            className="datatable-responsive"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Clientes"
                            globalFilter={globalFilter}
                            emptyMessage="No se encontraron clientes."
                            header={header}
                            responsiveLayout="scroll"
                        >
                            <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                            <Column field="idCliente" header="Id Cliente" sortable body={idBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                            <Column field="nombre" header="Nombre" sortable body={nombreBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                            <Column field="documento" header="Documento" sortable body={documentoBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                            <Column field="tipoDocumento.nombreDocumento" header="Tipo Documento" sortable body={idTipoDocumentoBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                            <Column field="telefono" header="Teléfono" sortable body={telefonoBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                            <Column field="direccion" header="Dirección" sortable body={direccionBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                            <Column field="categoria.nombre" header="Categoria" sortable body={idCategoriaBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                            <Column header="Acciones" body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        </DataTable>
    
                        <Dialog visible={clienteDialog} style={{ width: '450px' }} header="Registro Clientes" modal className="p-fluid" footer={clienteDialogFooter} onHide={hideDialog}>
                            <div className="field">
                                <label htmlFor="nombre">Nombre</label>
                                <InputText id="nombre" value={cliente.nombre} onChange={(e) => onInputChange(e, 'nombre')} required autoFocus className={classNames({ 'p-invalid': submitted && !cliente.nombre })} />
                                {submitted && !cliente.nombre && <small className="p-invalid">Nombre es requerido.</small>}
                            </div>
                            <div className="field">
                                <label htmlFor="documento">Documento</label>
                                <InputText id="documento" value={cliente.documento} onChange={(e) => onInputChange(e, 'documento')} required autoFocus className={classNames({ 'p-invalid': submitted && !cliente.documento })} />
                                {submitted && !cliente.documento && <small className="p-invalid">Documento es requerido.</small>}
                            </div>
                            <div className="field">
                                <label htmlFor="idTipoDocumento">Tipo Documento</label>
                                <Dropdown id="idTipoDocumento" options={tipoDocumentos} value={cliente.tipoDocumento} onChange={(e) => onInputChange(e, 'tipoDocumento')} optionLabel="nombreDocumento" placeholder="Seleccione un tipo de Documento" required autoFocus className={classNames({ 'p-invalid': submitted && !cliente.tipoDocumento })}></Dropdown>
                                {submitted && !cliente.tipoDocumento && <small className="p-invalid">Tipo Documento es requerido.</small>}
                            </div>
                            <div className="field">
                                <label htmlFor="telefono">Teléfono</label>
                                <InputText id="telefono" value={cliente.telefono} onChange={(e) => onInputChange(e, 'telefono')} required autoFocus className={classNames({ 'p-invalid': submitted && !cliente.telefono })} />
                                {submitted && !cliente.telefono && <small className="p-invalid">Teléfono es requerido.</small>}
                            </div>
                            <div className="field">
                                <label htmlFor="direccion">Dirección</label>
                                <InputText id="direccion" value={cliente.direccion} onChange={(e) => onInputChange(e, 'direccion')} required autoFocus className={classNames({ 'p-invalid': submitted && !cliente.direccion })} />
                                {submitted && !cliente.direccion && <small className="p-invalid">Dirección es requerido.</small>}
                            </div>
                            <div className="field">
                                <label htmlFor="idCategoria">Categoría</label>
                                <Dropdown id="idCategoria" value={cliente.categoria} onChange={(e) => onInputChange(e, 'categoria')} options={categoriaClientes} optionLabel="nombre" placeholder="Seleccione una Categoría" required autoFocus className={classNames({ 'p-invalid': submitted && !cliente.categoria })} ></Dropdown>
                                {submitted && !cliente.categoria && <small className="p-invalid">Categoría es requerida.</small>}
                            </div>
                        </Dialog>
    
                        <Dialog visible={deleteClienteDialog} style={{ width: '450px' }} header="Confirmación" modal footer={deleteClienteDialogFooter} onHide={hideDeleteClienteDialog}>
                            <div className="flex align-items-center justify-content-center">
                                <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                                {cliente && (
                                    <span>
                                        ¿Está seguro que desea eliminar a <b>{cliente.nombre}</b>?
                                    </span>
                                )}
                            </div>
                        </Dialog>
    
                        <Dialog visible={deleteClientesDialog} style={{ width: '450px' }} header="Confirmación" modal footer={deleteClientesDialogFooter} onHide={hideDeleteClientesDialog}>
                            <div className="flex align-items-center justify-content-center">
                                <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                                {cliente && <span>¿Está seguro que desea eliminar los siguientes Clientes?</span>}
                            </div>
                        </Dialog>
                    </div>
                </div>
            </div>
        );
    } else {
        {console.log(permisos)}
        return (
            <h2>No tiene permisos disponibles para este módulo! </h2>
        )
    }
};

export async function getServerSideProps({ req }) {
    return autenticacionRequerida(req, ({ session }) => {
        return {
            props: { session }
        }
    })
}
export default Clientes;

