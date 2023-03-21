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
import { autenticacionRequerida } from '../../utils/AutenticacionRequerida';
import { useSession } from 'next-auth/react';
import { AccionService } from '../../demo/service/AccionService';

const Transmisiones = () => {
    let transmisionVacio = {
        idTransmision: null,
        nombre: ''
    };

    const [transmisions, setTransmisions] = useState([]);
    const [transmisionDialog, setTransmisionDialog] = useState(false);
    const [deleteTransmisionDialog, setDeleteTransmisionDialog] = useState(false);
    const [deleteTransmisionsDialog, setDeleteTransmisionsDialog] = useState(false);
    const [transmision, setTransmision] = useState(transmisionVacio);
    const [selectedTransmisions, setSelectedTransmisions] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const { data: session } = useSession();
    //
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


    const listarTransmisions = () => {
        const transmisionService = new TransmisionService();
        transmisionService.getTransmisiones().then(data => setTransmisions(data));
    };

    let obtenerRol = () => {
        var info = session.user.email.split('/');
        return info[4]
    }
    const listarPermisos = () => {
        const accionService = new AccionService();
        accionService.getAccionesModuloRol(obtenerRol(), 'Transmisiones Automotrices').then(data => {setPermisos(data) , setCargando(false) });
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
        listarTransmisions();
        listarPermisos();
        permisosDisponibles();
    }, []);

    useEffect(() => {
        permisosDisponibles();
    }, [cargando]);

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

    const cols = [
        { field: 'idTransmision', header: 'ID' },
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
                const txtWidth = doc.getStringUnitWidth('TRANSMISIONES AUTOMOTRICES') * fontSize / doc.internal.scaleFactor;
                const x = (docWidth - txtWidth) / 2;
                image.src = '../layout/images/img_facturalogo2.png';
                doc.addImage(image, 'PNG', 10, 0, 50, 30);
                //centrar texto:
                doc.text('TRANSMISIONES AUTOMOTRICES', x, 15);
                doc.setFontSize(12);
                doc.text(15, 30, 'Usuario: ' + session.user.name);
                doc.text(15, 36, 'Fecha: ' + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString());
                doc.text(docWidth - 15, 30, 'Total Transmisiones: ' + transmisions.length, { align: "right" });
                doc.line(15, 40, docWidth - 15, 40);
                doc.autoTable(exportColumns, transmisions, { margin: { top: 45, bottom: 25 } });
                const pageCount = doc.internal.getNumberOfPages();
                for (var i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    doc.line(15, docHeight - 20, docWidth - 15, docHeight - 20);
                    doc.text('Página ' + String(i) + '/' + pageCount, docWidth - 15, docHeight - 10, { align: "right" });
                }
                doc.save('Reporte_Transmisiones.pdf');
            });
        });
    };

    const exportExcel = () => {
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(transmisions);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array'
            });

            saveAsExcelFile(excelBuffer, 'Reporte_Transmisiones');
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
                    {agregar?<Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />:null}
                    {eliminar?<Button label="Eliminar" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedTransmisions || !selectedTransmisions.length} />:null}     
                </div>
            </React.Fragment>
        )
    }

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                {exportarCVS ? <Button type="button" icon="pi pi-file" onClick={() => exportCSV(false)} className="mr-2" tooltip="CSV" tooltipOptions={{ position: 'bottom' }} /> : null}
                {exportarXLS ? <Button type="button" icon="pi pi-file-excel" onClick={exportExcel} className="p-button-success mr-2" tooltip="XLSX" tooltipOptions={{ position: 'bottom' }} /> : null}
                {exportarPDF ? <Button type="button" icon="pi pi-file-pdf" onClick={exportPdf} className="p-button-warning mr-2" tooltip="PDF" tooltipOptions={{ position: 'bottom' }} /> : null}
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
                {actualizar?<Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editTransmision(rowData)} />:null}
                {eliminar?<Button icon="pi pi-trash" className="p-button-rounded p-button-warning mt-2" onClick={() => confirmDeleteTransmision(rowData)} />:null}     
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
            <h5 className="m-0">Transmisiones</h5>
            {buscar?<span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => filter(e)} placeholder="Buscar..." />
            </span>:null}
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
                        </DataTable>:null}
                        
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
    } else {
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
export default Transmisiones;
