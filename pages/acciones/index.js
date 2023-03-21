import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { AccionService } from '../../demo/service/AccionService';
import { autenticacionRequerida } from '../../utils/AutenticacionRequerida';
import { useSession } from 'next-auth/react'


const Acciones = () => {
    let accionVacio = {
        idAccion: null,
        nombre: ''
    };

    const [acciones, setAcciones] = useState(null);
    const [accionDialog, setAccionDialog] = useState(false);
    const [deleteAccionDialog, setDeleteAccionDialog] = useState(false);
    const [deleteAccionesDialog, setDeleteAccionesDialog] = useState(false);
    const [accion, setAccion] = useState(accionVacio);
    const [selectedAcciones, setSelectedAcciones] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
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



    const listarAcciones = () => {
        const accionService = new AccionService();
        accionService.getAcciones().then(data => setAcciones(data));
    };

    let obtenerRol = () => {
        var info = session.user.email.split('/');
        return info[4]
    }
    const listarPermisos = () => {
        const accionService = new AccionService();
        accionService.getAccionesModuloRol(obtenerRol(), 'Acciones').then(data => {setPermisos(data) , setCargando(false) });
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
        listarAcciones();
        permisosDisponibles();
        listarPermisos();
    }, []);

    useEffect(() => {
        permisosDisponibles();
    }, [cargando]);

    const openNew = () => {
        setAccion(accionVacio);
        setSubmitted(false);
        setAccionDialog(true);
    }

    const hideDialog = () => {
        setSubmitted(false);
        setAccionDialog(false);
    }

    const hideDeleteAccionDialog = () => {
        setDeleteAccionDialog(false);
    }

    const hideDeleteAccionesDialog = () => {
        setDeleteAccionesDialog(false);
    }

    const pasoRegistro = () => {
        listarAcciones();
        setAccionDialog(false);
        setAccion(accionVacio);
    }

    const saveAccion = async () => {
        setSubmitted(true);
        if (accion.idAccion) {
            try {
                const accionService = new AccionService();
                await accionService.updateAccion(accion);
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Acción Actualizada (^‿^)', life: 3000 });
                pasoRegistro();
            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });
            }
        }
        else {
            try {
                const accionService = new AccionService();
                await accionService.addAccion(accion);
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Acción Creada (^‿^)', life: 3000 });
                pasoRegistro();
            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });

            }
        }
    }

    const editAccion = (accion) => {
        setAccion({ ...accion });
        setAccionDialog(true);
    }

    const confirmDeleteAccion = (accion) => {
        setAccion(accion);
        setDeleteAccionDialog(true);
    }

    const deleteAccion = async () => {
        const accionService = new AccionService();
        await accionService.removeAccion(accion.idAccion);
        listarAcciones();
        setDeleteAccionDialog(false);
        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Accion Eliminada', life: 3000 });
    }

    const cols = [
        { field: 'idAccion', header: 'ID' },
        { field: 'nombre', header: 'Nombre' }
    ]

    const exportColumns = cols.map(col => ({ title: col.header, dataKey: col.field }));

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
                const txtWidth = doc.getStringUnitWidth('ACCIONES DE MODULOS') * fontSize / doc.internal.scaleFactor;
                const x = (docWidth - txtWidth) / 2;
                image.src = '../layout/images/img_facturalogo2.png';
                doc.addImage(image, 'PNG', 10, 0, 50, 30);
                //centrar texto:
                doc.text('ACCIONES DE MODULOS', x, 15);
                doc.setFontSize(12);
                doc.text(15, 30, 'Usuario: ' + session.user.name);
                doc.text(15, 36, 'Fecha: ' + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString());
                doc.text(docWidth - 15, 30, 'Total Acciones: ' + acciones.length, { align: "right" });
                doc.line(15, 40, docWidth - 15, 40);
                doc.autoTable(exportColumns, acciones, { margin: { top: 45, bottom: 25 } });
                const pageCount = doc.internal.getNumberOfPages();
                for (var i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    doc.line(15, docHeight - 20, docWidth - 15, docHeight - 20);
                    doc.text('Página ' + String(i) + '/' + pageCount, docWidth - 15, docHeight - 10, { align: "right" });
                }
                doc.save('Reporte_Acciones.pdf');
            });
        });
    };

    const exportExcel = () => {
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(acciones);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array'
            });

            saveAsExcelFile(excelBuffer, 'Reporte_Acciones');
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
        setDeleteAccionesDialog(true);
    }


    const deleteSelectedAcciones = async () => {
        const accionService = new AccionService();
        selectedAcciones.map(async (accion) => {
        await accionService.removeAccion(accion.idAccion);
        });
        let _acciones = acciones.filter((val) => !selectedAcciones.includes(val));
        setAcciones(_acciones);
        setDeleteAccionesDialog(false);
        setSelectedAcciones(null);
        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Acciones Eliminados ', life: 3000 });
    }


    const onInputChange = (e, nombre) => {
        const val = (e.target && e.target.value) || '';
        let _accion = { ...accion };
        _accion[`${nombre}`] = val;
        setAccion(_accion);
    }


    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    {agregar?
                    <Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />:null}
                    {eliminar?
                    <Button label="Eliminar" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedAcciones || !selectedAcciones.length} />:null}
                </div>
            </React.Fragment>
        )
    }

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
               {exportarCVS ?
 <Button type="button" icon="pi pi-file" onClick={() => exportCSV(false)} className="mr-2" tooltip="CSV" tooltipOptions={{ position: 'bottom' }} /> : null}
                {exportarXLS ? <Button type="button" icon="pi pi-file-excel" onClick={exportExcel} className="p-button-success mr-2" tooltip="XLSX" tooltipOptions={{ position: 'bottom' }} /> : null}
                {exportarPDF ? <Button type="button" icon="pi pi-file-pdf" onClick={exportPdf} className="p-button-warning mr-2" tooltip="PDF" tooltipOptions={{ position: 'bottom' }} /> : null}
            </React.Fragment>
        )
    }

    const idBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">ID Accion</span>
                {rowData.idAccion}
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
                {actualizar?
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editAccion(rowData)} />:null}
                {eliminar?
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning mt-2" onClick={() => confirmDeleteAccion(rowData)} />:null}
            </div>
        );
    }

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Listado Acciones De Usuarios</h5>
            {buscar? <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
            </span>:null}
           
        </div>
    );

    const accionDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" className="p-button-text" onClick={saveAccion} />
        </>
    );
    const deleteAccionDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteAccionDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteAccion} />
        </>
    );
    const deleteAccionesDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteAccionesDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedAcciones} />
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
                            value={acciones}
                            selection={selectedAcciones}
                            onSelectionChange={(e) => setSelectedAcciones(e.value)}
                            dataKey="idAccion"
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25]}
                            className="datatable-responsive"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Acciones"
                            globalFilter={globalFilter}
                            emptyMessage="No se encontraron Acciones."
                            header={header}
                            responsiveLayout="scroll"
                        >
                            <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                            <Column field="idAccion" header="ID" sortable body={idBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                            <Column field="nombre" header="Nombre" sortable body={nombreBodyTemplate} headerStyle={{ width: '14%', minWidth: '20rem' }}></Column>
                            <Column header="Acciones" body={actionBodyTemplate}></Column>
                        </DataTable>:null}
                        
    
                        <Dialog visible={accionDialog} style={{ width: '450px' }} header="Registro de Acciones" modal className="p-fluid" footer={accionDialogFooter} onHide={hideDialog}>
                            <div className="field">
                                <label htmlFor="nombre">Nombre</label>
                                <InputText id="nombre" value={accion.nombre} onChange={(e) => onInputChange(e, 'nombre')} required autoFocus className={classNames({ 'p-invalid': submitted && !accion.nombre })}tooltip="Ingrese un nombre de acción" />
                                {submitted && !accion.nombre && <small className="p-invalid">Nombre acción es requerido.</small>}
                            </div>
                        </Dialog>
    
                        <Dialog visible={deleteAccionDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteAccionDialogFooter} onHide={hideDeleteAccionDialog}>
                            <div className="flex align-items-center justify-content-center">
                                <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                                {accion && <span>¿Está seguro de que desea eliminar a <b>{accion.nombre}</b>?</span>}
                            </div>
                        </Dialog>
    
                        <Dialog visible={deleteAccionesDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteAccionesDialogFooter} onHide={hideDeleteAccionesDialog}>
                            <div className="flex align-items-center justify-content-center">
                                <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                                {accion && <span>¿Está seguro de que desea eliminar los registros seleccionados?</span>}
                            </div>
                        </Dialog>
                    </div>
                </div>
            </div>
        );
    } else {
        {console.log(permisos)}
        return (
            <h2>No tiene permisos disponibles para este modulo! </h2>
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
export default Acciones;
