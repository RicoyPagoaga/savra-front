import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { ShipperService } from '../../demo/service/ShipperService';
import Moment from 'moment';
import { Calendar } from 'primereact/calendar';
import { autenticacionRequerida } from '../../utils/AutenticacionRequerida';
import { useSession } from 'next-auth/react'
import { AccionService } from '../../demo/service/AccionService';

const Shippers = () => {
    let shipperVacio = {
        idShipper: null,
        nombre: '',
        telefono: '',
        correo: '',
        sitioWeb: '',
        fechaContrato: null
    };

    const [calendarValueNac, setCalendarValueNac] = useState(null);
    const [shippers, setShippers] = useState(null);
    const [shipperDialog, setShipperDialog] = useState(false);
    const [deleteShipperDialog, setDeleteShipperDialog] = useState(false);
    const [deleteShippersDialog, setDeleteShippersDialog] = useState(false);
    const [shipper, setShipper] = useState(shipperVacio);
    const [selectedShippers, setSelectedShippers] = useState(null);
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


    const listarShippers = () => {
        const shipperService = new ShipperService();
        shipperService.getShippers().then(data => setShippers(data));
    };

    let obtenerRol = () => {
        var info = session.user.email.split('/');
        return info[4]
    }
    const listarPermisos = () => {
        const accionService = new AccionService();
        accionService.getAccionesModuloRol(obtenerRol(), 'Transportistas').then(data => {setPermisos(data) , setCargando(false) });
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
        listarShippers();
        listarPermisos();
        permisosDisponibles();
    }, []);

    useEffect(() => {
        permisosDisponibles();
    }, [cargando]);

    const openNew = () => {
        setShipper(shipperVacio);
        setSubmitted(false);
        setShipperDialog(true);
    }

    const hideDialog = () => {
        setSubmitted(false);
        setShipperDialog(false);
    }

    const hideDeleteShipperDialog = () => {
        setDeleteShipperDialog(false);
    }

    const hideDeleteShippersDialog = () => {
        setDeleteShippersDialog(false);
    }

    const pasoRegistro = () => {
        listarShippers();
        setShipperDialog(false);
        setShipper(shipperVacio);
    }

    const saveShipper = async () => {
        setSubmitted(true);
        if (shipper.idShipper) {
            try {
                const shipperService = new ShipperService();
                await shipperService.updateShipper(shipper);
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Transportista Actualizado (^‿^)', life: 3000 });
                pasoRegistro();
            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });
            }
        }
        else {
            try {
                const shipperService = new ShipperService();
                await shipperService.addShipper(shipper);
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Transportista Creado (^‿^)', life: 3000 });
                pasoRegistro();
            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });

            }
        }

    }

    const editShipper = (shipper) => {
        setShipper({ ...shipper });
        setShipperDialog(true);
    }

    const confirmDeleteShipper = (shipper) => {
        setShipper(shipper);
        setDeleteShipperDialog(true);
    }

    const deleteShipper = async () => {
        try {
            const shipperService = new ShipperService();
            await shipperService.removeShipper(shipper.idShipper);
            listarShippers();
            setDeleteShipperDialog(false);
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Transportista Eliminado', life: 3000 });

        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        }
    }

    const cols = [
        { field: 'idShipper', header: 'ID' },
        { field: 'nombre', header: 'Nombre' },
        { field: 'telefono', header: 'Teléfono' },
        { field: 'correo', header: 'Correo' },
        { field: 'sitioWeb', header: 'Sitio Web' },
        { field: 'fechaContrato', header: 'Fecha de Contrato' }
    ];
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
                const txtWidth = doc.getStringUnitWidth('TRANSPORTISTAS') * fontSize / doc.internal.scaleFactor;
                const x = (docWidth - txtWidth) / 2;
                image.src = '../layout/images/img_facturalogo2.png';
                doc.addImage(image, 'PNG', 10, 0, 50, 30);
                //centrar texto:
                doc.text('TRANSPORTISTAS', x, 15);
                doc.setFontSize(12);
                doc.text(15, 30, 'Usuario: ' + session.user.name);
                doc.text(15, 36, 'Fecha: ' + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString());
                doc.text(docWidth - 15, 30, 'Total Transportistas: ' + shippers.length, { align: "right" });
                doc.line(15, 40, docWidth - 15, 40);
                doc.autoTable(exportColumns, shippers, { margin: { top: 45, bottom: 25 } });
                const pageCount = doc.internal.getNumberOfPages();
                for (var i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    doc.line(15, docHeight - 20, docWidth - 15, docHeight - 20);
                    doc.text('Página ' + String(i) + '/' + pageCount, docWidth - 15, docHeight - 10, { align: "right" });
                }
                doc.save('Reporte_Transportistas.pdf');
            });
        });
    };

    const exportExcel = () => {
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(shippers);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array'
            });

            saveAsExcelFile(excelBuffer, 'Reporte_Transportistas');
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
        setDeleteShippersDialog(true);
    }


    const deleteSelectedShippers = async () => {
        const shipperService = new ShipperService();
        selectedShippers.map(async (shipper) => {
            await shipperService.removeShipper(shipper.idShipper);
        });
        let _shippers = shippers.filter((val) => !selectedShippers.includes(val));
        setShippers(_shippers);
        setDeleteShippersDialog(false);
        setSelectedShippers(null);
        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Transportistas Eliminados ', life: 3000 });
    }


    const onInputChange = (e, nombre) => {
        const val = (e.target && e.target.value) || '';
        let _shipper = { ...shipper };
        _shipper[`${nombre}`] = val;

        setShipper(_shipper);
    }
    const onInputChangeDate = (e, fecha) => {
        const val = (e.target && e.target.value) || '';
        let _shipper = { ...shipper };

        if (fecha == 'fechaContrato') {
            _shipper[`${fecha}`] = val;
            setCalendarValueNac(e.value);
        } else {
            _empleado[`${fecha}`] = val;
            setCalendarValueIn(e.value);
        }
        //console.log(val)
        setShipper(_shipper);
    };


    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    {agregar?<Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />:null}
                    {eliminar?<Button label="Eliminar" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedShippers || !selectedShippers.length} />:null}
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
                <span className="p-column-title">ID Shipper</span>
                {rowData.idShipper}
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
    const telefonoBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">telefono</span>
                {rowData.telefono}
            </>
        );
    }
    const correoBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">correo</span>
                {rowData.correo}
            </>
        );
    }
    const sitioWebBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">sitioWeb</span>
                {rowData.sitioWeb}
            </>
        );
    }

    const fechaContratoBodyTemplate = (rowData) => {
        var dateDMY = Moment(rowData.fechaContrato).format('DD/MM/YYYY')
        return (
            <>
                <span className="p-column-title">Fecha Contrato</span>
                {dateDMY}
            </>
        );
    };

    //Fecha 


    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                {actualizar?<Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editShipper(rowData)} />:null}
                {eliminar?<Button icon="pi pi-trash" className="p-button-rounded p-button-warning mt-2" onClick={() => confirmDeleteShipper(rowData)} />:null}
                
            </div>
        );
    }

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Listado de Transportistas:</h5>
            {buscar?<span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
            </span>:null}
            
        </div>
    );

    const shipperDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" className="p-button-text" onClick={saveShipper} />
        </>
    );
    const deleteShipperDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteShipperDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteShipper} />
        </>
    );
    const deleteShippersDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteShippersDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedShippers} />
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
                        value={shippers}
                        selection={selectedShippers}
                        onSelectionChange={(e) => setSelectedShippers(e.value)}
                        dataKey="idShipper"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Shippers"
                        globalFilter={globalFilter}
                        emptyMessage="No se encontraron Transportistas."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                        <Column field="idShipper" header="ID" sortable body={idBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="nombre" header="Nombre" sortable body={nombreBodyTemplate} headerStyle={{ width: '14%', minWidth: '20rem' }}></Column>
                        <Column field="telefono" header="Telefono" sortable body={telefonoBodyTemplate} headerStyle={{ width: '14%', minWidth: '20rem' }}></Column>
                        <Column field="correo" header="Correo" sortable body={correoBodyTemplate} headerStyle={{ width: '14%', minWidth: '20rem' }}></Column>
                        <Column field="sitioWeb" header="Sitio Web" sortable body={sitioWebBodyTemplate} headerStyle={{ width: '14%', minWidth: '20rem' }}></Column>
                        <Column field="fechaContrato" header="Fecha Contrato" sortable body={fechaContratoBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column header="Acciones" body={actionBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                    </DataTable>:null}
                    

                    <Dialog visible={shipperDialog} style={{ width: '450px' }} header="Registro de Transportistas" modal className="p-fluid" footer={shipperDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="nombre">Nombre</label>
                            <InputText id="nombre" value={shipper.nombre} onChange={(e) => onInputChange(e, 'nombre')} required autoFocus className={classNames({ 'p-invalid': submitted && !shipper.nombre })} />
                            {submitted && !shipper.nombre && <small className="p-invalid">Nombre shipper es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="telefono">Telefono</label>
                            <InputText id="telefono" value={shipper.telefono} onChange={(e) => onInputChange(e, 'telefono')} className={classNames({ 'p-invalid': submitted && !shipper.telefono })} />
                            {submitted && !shipper.telefono && <small className="p-invalid">Telefono shipper es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="correo">Correo</label>
                            <InputText id="correo" value={shipper.correo} onChange={(e) => onInputChange(e, 'correo')} className={classNames({ 'p-invalid': submitted && !shipper.correo })} />
                            {submitted && !shipper.correo && <small className="p-invalid">Correo de shipper es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="sitioWeb">SitioWeb</label>
                            <InputText id="sitioWeb" value={shipper.sitioWeb} onChange={(e) => onInputChange(e, 'sitioWeb')} className={classNames({ 'p-invalid': submitted && !shipper.sitioWeb })} />
                            {submitted && !shipper.sitioWeb && <small className="p-invalid">Sitio Web shipper es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="fechaContrato">Fecha Contrato</label>
                            <Calendar dateFormat="dd/mm/yy" showIcon showButtonBar value={calendarValueNac} onChange={(e) => onInputChangeDate(e, 'fechaContrato')} tooltip="Utiliza la fecha de hoy" placeholder="Seleccione una fecha de Contrato"></Calendar>

                            {submitted && !shipper.fechaContrato && <small className="p-invalid">Fecha de Contrato es requerida.</small>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteShipperDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteShipperDialogFooter} onHide={hideDeleteShipperDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {shipper && <span>¿Está seguro de que desea eliminar a <b>{shipper.nombre}</b>?</span>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteShippersDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteShippersDialogFooter} onHide={hideDeleteShippersDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {shipper && <span>¿Está seguro de que desea eliminar los registros seleccionados?</span>}
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
export default Shippers;
