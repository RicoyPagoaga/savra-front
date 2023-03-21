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
import { PaisService } from '../../demo/service/PaisService';
import { autenticacionRequerida } from '../../utils/AutenticacionRequerida';
import { useSession } from 'next-auth/react'
import { AccionService } from '../../demo/service/AccionService';


const Proveedores = () => {
    let proveedorVacio = {
        idProveedor: null,
        nombre: '',
        correo: '',
        telefono: '',
        pais: null,
        nombreContacto: '',
        sitioWeb: ''
    };

    const [proveedores, setProveedores] = useState([]);
    const [proveedorDialog, setProveedorDialog] = useState(false);
    const [deleteProveedorDialog, setDeleteProveedorDialog] = useState(false);
    const [deleteProveedoresDialog, setDeleteProveedoresDialog] = useState(false);
    const [proveedor, setProveedor] = useState(proveedorVacio);
    const [selectedProveedores, setSelectedProveedores] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const [paises, setPaises] = useState([]);
    const [codigoISO, setCodigoISO] = useState(false);
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

    const listarProveedores = () => {
        const proveedorService = new ProveedorService();
        proveedorService.getProveedores().then(data => setProveedores(data));
    };

    const listarPaises = () => {
        const paisService = new PaisService();
        paisService.getPaises().then(data => setPaises(data));
    };

    let obtenerRol = () => {
        var info = session.user.email.split('/');
        return info[4]
    }
    const listarPermisos = () => {
        const accionService = new AccionService();
        accionService.getAccionesModuloRol(obtenerRol(), 'Proveedores').then(data => {setPermisos(data) , setCargando(false) });
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

    useEffect(() => {
        listarProveedores();  
        listarPaises();
        listarPermisos();
        permisosDisponibles();
    }, []); 

    useEffect(() => {
        permisosDisponibles();
    }, [cargando]);

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

        if (proveedor.idProveedor) {
            try {
                const proveedorService = new ProveedorService();
                await proveedorService.updateProveedor(proveedor);
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Proveedor Actualizado', life: 3000 });
                pasoRegistro();
            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails , life: 3000 });
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

    const cols = [
        { field: 'idProveedor', header: 'ID' },
        { field: 'nombre', header: 'Nombre' },
        { field: 'correo', header: 'Correo' },
        { field: 'pais', header: 'País' },
        { field: 'telefono', header: 'Teléfono' },
        { field: 'nombreContacto', header: 'Contacto' },
        { field: 'sitioWeb', header: 'Sitio Web' }
    ];
    const exportColumns = cols.map(col => ({ title: col.header, dataKey: col.field }));

    let objModificado = proveedores.map(function (element) {
        return {
            idProveedor: element.idProveedor,
            nombre: element.nombre,
            correo: element.correo,
            telefono: element.telefono,
            pais: element.pais.nombre,
            nombreContacto: element.nombreContacto,
            sitioWeb: element.sitioWeb,
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
                const txtWidth = doc.getStringUnitWidth('PROVEEDORES') * fontSize / doc.internal.scaleFactor;
                const x = (docWidth - txtWidth) / 2;
                image.src = '../layout/images/img_facturalogo2.png';
                doc.addImage(image, 'PNG', 10, 0, 50, 30);
                //centrar texto:
                doc.text('PROVEEDORES', x, 15);
                doc.setFontSize(12);
                doc.text(15, 30, 'Usuario: ' + session.user.name);
                doc.text(15, 36, 'Fecha: ' + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString());
                doc.text(docWidth - 15, 30, 'Total Proveedores: ' + proveedores.length, { align: "right" });
                doc.line(15, 40, docWidth - 15, 40);
                doc.autoTable(exportColumns, objModificado, { margin: { top: 45, bottom: 25 } });
                const pageCount = doc.internal.getNumberOfPages();
                for (var i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    doc.line(15, docHeight - 20, docWidth - 15, docHeight - 20);
                    doc.text('Página ' + String(i) + '/' + pageCount, docWidth - 15, docHeight - 10, { align: "right" });
                }
                doc.save('Reporte_Proveedores.pdf');
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

            saveAsExcelFile(excelBuffer, 'Reporte_Proveedores');
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
            _proveedor[`${nombre}`] = val;
            setCodigoISO(e.value);
        } else {
            _proveedor[`${nombre}`] = val;
        }

        setProveedor(_proveedor);
        console.log(_proveedor);
    }

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    {agregar?<Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />:null}
                    {eliminar?<Button label="Eliminar" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedProveedores || !selectedProveedores.length} />:null}
                </div>
            </React.Fragment>
        )
    }

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                {exportarCVS ?<Button type="button" icon="pi pi-file" onClick={() => exportCSV(false)} className="mr-2" tooltip="CSV" tooltipOptions={{ position: 'bottom' }} /> : null}
                {exportarXLS ? <Button type="button" icon="pi pi-file-excel" onClick={exportExcel} className="p-button-success mr-2" tooltip="XLSX" tooltipOptions={{ position: 'bottom' }} /> : null}
                {exportarPDF ? <Button type="button" icon="pi pi-file-pdf" onClick={exportPdf} className="p-button-warning mr-2" tooltip="PDF" tooltipOptions={{ position: 'bottom' }} /> : null}
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
                <span className="p-column-title">Correo Electrónico</span>
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
        return (
            <>
                <span className="p-column-title">Pais</span>
                {rowData.pais.nombre}
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
                {actualizar?<Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editProveedor(rowData)} />:null}
                {eliminar?<Button icon="pi pi-trash" className="p-button-rounded p-button-warning mt-2" onClick={() => confirmDeleteProveedor(rowData)} />:null}
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
            {buscar?<span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => filter(e)} placeholder="Buscar..." />
            </span>:null}
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
                        {verLista?<DataTable
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
                            <Column field="idProveedor" header="Código" sortable body={idBodyTemplate} headerStyle={{ width: '10%', minWidth: '10rem' }}></Column>
                            <Column field="nombre" header="Nombre" sortable body={nombreBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                            <Column field="correo" header="Correo Electrónico" sortable body={correoBodyTemplate} headerStyle={{ width: '24%', minWidth: '10rem' }}></Column>
                            <Column field="telefono" header="Teléfono" body={telefonoBodyTemplate} sortable headerStyle={{ width: '14%', minWidth: '8rem' }}></Column>
                            <Column field="pais.nombre" header="Código ISO" sortable body={paisBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                            <Column field="nombreContacto" header="Contacto" body={contactoBodyTemplate} sortable headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                            <Column field="sitioWeb" header="Sitio Web" body={sitioWebBodyTemplate} sortable headerStyle={{ width: '20%', minWidth: '10rem' }}></Column>
                            <Column header="Acciones" body={actionBodyTemplate}  headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        </DataTable>:null}
    
                        <Dialog visible={proveedorDialog} style={{ width: '450px' }} header="Detalles de Proveedor" modal className="p-fluid" footer={proveedorDialogFooter} onHide={hideDialog}>
                            <div className="field">
                                <label htmlFor="nombre">Nombre</label>
                                <InputText id="nombre" value={proveedor.nombre} onChange={(e) => onInputChange(e, 'nombre')} tooltip="Debe ingresar más de cinco caracteres"
                                className={classNames({ 'p-invalid': submitted && !proveedor.nombre })} />
                                {submitted && !proveedor.nombre && <small className="p-invalid">El nombre es requerido.</small>}
                            </div>
                            <div className="field">
                                <label htmlFor="correo">Correo Electrónico</label>
                                <InputText id="correo" value={proveedor.correo} onChange={(e) => onInputChange(e, 'correo')} tooltip="Ingrese correo electrónico del proveedor"
                                className={classNames({ 'p-invalid': submitted && !proveedor.correo })} />
                                {submitted && !proveedor.correo && <small className="p-invalid">El correo es requerido.</small>}
                            </div>
                            <div className="field">
                                <label htmlFor="telefono">Teléfono</label>
                                <InputText id="telefono" value={proveedor.telefono} onChange={(e) => onInputChange(e, 'telefono')} tooltip="Indique teléfono sin espacios, puntos o guiones"
                                className={classNames({ 'p-invalid': submitted && !proveedor.telefono })} />                            
                                {submitted && !proveedor.telefono && <small className="p-invalid">El teléfono es requerido.</small>}
                            </div>
    
                            <div className="field">
                                <label htmlFor="pais">País del Proveedor</label>
                                <Dropdown id="pais" options={paises} value={proveedor.pais} onChange={(e) => onInputChange(e, 'pais')} optionLabel="nombre" emptyMessage="No se encontraron códigos ISO" 
                                className={classNames({ 'p-invalid': submitted && !proveedor.pais })}  />
                                {submitted && !proveedor.pais && <small className="p-invalid">El País es requerido.</small>}
                            </div>
                            <div className="field">
                                <label htmlFor="nombreContacto">Contacto</label>
                                <InputText id="nombreContacto" value={proveedor.nombreContacto} onChange={(e) => onInputChange(e, 'nombreContacto')} tooltip="Debe ingresar más de cinco caracteres"
                                className={classNames({ 'p-invalid': submitted && !proveedor.nombreContacto })} />
                                {submitted && !proveedor.nombreContacto && <small className="p-invalid">El nombre de contacto es requerido.</small>}
                            </div>
                            <div className="field">
                                <label htmlFor="sitioWeb">Sitio Web</label>
                                <InputText id="sitioWeb" value={proveedor.sitioWeb} onChange={(e) => onInputChange(e, 'sitioWeb')} tooltip="Ingrese sitio web del proveedor"
                                className={classNames({ 'p-invalid': submitted && !proveedor.sitioWeb })} />
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
    } else {
        {console.log(permisos)}
        return (
            <h2>No tiene permisos disponibles para este módulo! </h2>
        )
    }
};
export async function getServerSideProps({req}){
    return autenticacionRequerida(req,({session}) =>
    {
        return{
            props:{session}
        }
    })
}
export default Proveedores;
