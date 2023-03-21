import getConfig from 'next/config';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputMask } from 'primereact/inputmask';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { ParametroFacturaService } from '../../demo/service/ParametroFacturaService';
import Moment from 'moment';
import { autenticacionRequerida } from '../../utils/AutenticacionRequerida';
import { useSession } from 'next-auth/react'
import { AccionService } from '../../demo/service/AccionService';

const ParametrosFactura = () => {
    let emptyParametroFactura = {
        idParametro: null,
        cai: '',
        rangoInicial: '',
        rangoFinal: '',
        fechaLimiteEmision: null,
        fechaInicio: null,
        ultimaFactura: null
    };

    let emptyRestApiError = {
        httpStatus: '',
        errorMessage: '',
        errorDetails: ''
    };

    const [valueCai, setValueCai] = useState(null);
    const [parametrosFactura, setParametrosFactura] = useState([]);
    const [fechaLE, setFechaLE] = useState(null);
    const [fechaI, setFechaI] = useState(null);
    const [parametrofacturaDialog, setParametroFacturaDialog] = useState(false);
    const [deleteParametroFacturaDialog, setDeleteParametroFacturaDialog] = useState(false);
    const [deleteParametrosFacturaDialog, setDeleteParametrosFacturaDialog] = useState(false);
    const [parametrofactura, setParametroFactura] = useState(emptyParametroFactura);
    const [apiError, setApiError] = useState(emptyRestApiError);
    const [selectedParametrosFactura, setSelectedParametrosFactura] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [valueRangoI, setValueRangoI] = useState(null);
    const [valueRangoF, setValueRangoF] = useState(null);
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


    const listarParametrosFactura = () => {
        const parametrofacturaservice = new ParametroFacturaService();
        parametrofacturaservice.getParametrosFactura().then(data => setParametrosFactura(data));
    };


    let obtenerRol = () => {
        var info = session.user.email.split('/');
        return info[4]
    }
    const listarPermisos = () => {
        const accionService = new AccionService();
        accionService.getAccionesModuloRol(obtenerRol(), 'Parámetros Factura').then(data => {setPermisos(data) , setCargando(false) });
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
        listarParametrosFactura();
        listarPermisos();
        permisosDisponibles();
    }, []);

    useEffect(() => {
        permisosDisponibles();
    }, [cargando]);


    const openNew = () => {
        setParametroFactura(emptyParametroFactura);
        setValueCai(null);
        setValueRangoI(null);
        setValueRangoF(null);
        setFechaLE(null);
        setFechaI(null);
        setSubmitted(false);
        setParametroFacturaDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setParametroFacturaDialog(false);
    };

    const hideDeleteParametroFacturaDialog = () => {
        setDeleteParametroFacturaDialog(false);
    };

    const hideDeleteParametrosFacturaDialog = () => {
        setDeleteParametrosFacturaDialog(false);
    };

    const pasoRegistro = () => {
        listarParametrosFactura();
        setParametroFacturaDialog(false);
        setParametroFactura(emptyParametroFactura);
    }

    const saveParametroFactura = async () => {
        setSubmitted(true);
        const parametrofacturaservice = new ParametroFacturaService();
        let valor = parametrofactura.rangoInicial.toString().split('-');
        let valorU = new Number(valor[3]);
        if (parametrofactura.idParametro) {
            try {
                await parametrofacturaservice.updateParametroFactura(parametrofactura);
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Parámetro Factura Actualizado', life: 3000 });
                pasoRegistro();
            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });
            }
        } else {
            try {

                parametrofactura.ultimaFactura = valorU - 1;
                await parametrofacturaservice.addParametroFactura(parametrofactura);
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Parámetro Factura Registrado', life: 3000 });
                pasoRegistro();
            } catch (error) {
                console.log(parametrofactura);
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });
            }
        };
    };

    const editParametroFactura = (parametrofactura) => {
        setParametroFactura({ ...parametrofactura });
        setValueCai(parametrofactura.cai);
        setValueRangoI(parametrofactura.rangoInicial);
        setValueRangoF(parametrofactura.rangoFinal);
        const fechaLimite = () => {
            var limite = parametrofactura.fechaLimiteEmision.toString().split('-');
            return new Date(limite[0], limite[1] - 1, limite[2])
        }
        const fechaIn = () => {
            var inicio = parametrofactura.fechaInicio.toString().split('-');
            return new Date(inicio[0], inicio[1] - 1, inicio[2])
        }
        setFechaLE(fechaLimite);
        setFechaI(fechaIn)
        setParametroFacturaDialog(true);
    };

    const deleteParametroFactura = async () => {
        try {
            const parametrofacturaservice = new ParametroFacturaService();
            await parametrofacturaservice.removeParametroFactura(parametrofactura.idParametro);
            listarParametrosFactura();
            setDeleteParametroFacturaDialog(false);
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Parámetro Factura Eliminado', life: 3000 });
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        }
    };
    const confirmDeleteParametroFactura = (parametrofactura) => {
        setParametroFactura(parametrofactura);
        setDeleteParametroFacturaDialog(true);
    };

    const cols = [
        { field: 'idParametro', header: 'ID' },
        { field: 'cai', header: 'CAI' },
        { field: 'rangoInicial', header: 'Rango Inicial' },
        { field: 'rangoFinal', header: 'Rango Final' },
        { field: 'fechaLimiteEmision', header: 'Fecha Límite Emisión' },
        { field: 'fechaInicio', header: 'Fecha Inicio' },
        { field: 'ultimaFactura', header: 'Última Factura' },
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
                const txtWidth = doc.getStringUnitWidth('PARÁMETROS DE FACTURAS') * fontSize / doc.internal.scaleFactor;
                const x = (docWidth - txtWidth) / 2;
                image.src = '../layout/images/img_facturalogo2.png';
                doc.addImage(image, 'PNG', 10, 0, 50, 30);
                //centrar texto:
                doc.text('PARÁMETROS DE FACTURA', x, 15);
                doc.setFontSize(12);
                doc.text(15, 30, 'Usuario: ' + session.user.name);
                doc.text(15, 36, 'Fecha: ' + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString());
                doc.text(docWidth - 15, 30, 'Total Parámetros: ' + parametrosFactura.length, { align: "right" });
                doc.line(15, 40, docWidth - 15, 40);
                doc.autoTable(exportColumns, parametrosFactura, {margin: { top: 45, bottom: 25 },columnStyles:{1:{cellWidth: 20}} });
                const pageCount = doc.internal.getNumberOfPages();
                for (var i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    doc.line(15, docHeight - 20, docWidth - 15, docHeight - 20);
                    doc.text('Página ' + String(i) + '/' + pageCount, docWidth - 15, docHeight - 10, { align: "right" });
                }
                doc.save('Reporte_Parámetros.pdf');
            });
        });
    };

    const exportExcel = () => {
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(parametrosFactura);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array'
            });

            saveAsExcelFile(excelBuffer, 'Reporte_Parámetros');
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
        setDeleteParametrosFacturaDialog(true);
    }
    const deleteSelectedParametrosFactura = () => {
        const parametrofacturaService = new ParametroFacturaService();
        selectedParametrosFactura.map(async (parametrofactura) => {
            await parametrofacturaService.removeParametroFactura(parametrofactura.idParametro);
        });
        let _parametrosfactura = parametrosFactura.filter((val) => !selectedParametrosFactura.includes(val));
        setParametrosFactura(_parametrosfactura);
        setDeleteParametrosFacturaDialog(false);
        setSelectedParametrosFactura(null);
        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Parámetros Factura Eliminados', life: 3000 });
    };

    const onInputChange = (e, nombre) => {
        const val = (e.target && e.target.value) || '';
        let _parametrofactura = { ...parametrofactura };
        switch (nombre) {
            case "cai":
                _parametrofactura[`${nombre}`] = val;
                setValueCai(e.value);
                break;
            case "rangoInicial":
                _parametrofactura[`${nombre}`] = val;
                setValueRangoI(e.value);
                break;
            case "rangoFinal":
                _parametrofactura[`${nombre}`] = val;
                setValueRangoF(e.value);
                break;
            case "fechaLimiteEmision":
                _parametrofactura[`${nombre}`] = val;
                setFechaLE(e.value);
                break;
            case "fechaInicio":
                _parametrofactura[`${nombre}`] = val;
                setFechaI(e.value);
                break;
            default:
                _parametrofactura[`${nombre}`] = val;
                break;
        }
        console.log(_parametrofactura);
        setParametroFactura(_parametrofactura);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    {agregar?<Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />:null}
                    {eliminar?<Button label="Eliminar" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedParametrosFactura || !selectedParametrosFactura.length} />:null}
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
                <span className="p-column-title">ID Parametro Factura</span>
                {rowData.idParametro}
            </>
        );
    };

    const caiBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">CAI</span>
                {rowData.cai}
            </>
        );
    };

    const rangoInicialBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Rango Inicial</span>
                {rowData.rangoInicial}
            </>
        );
    };
    const rangoFinalBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Rango Final</span>
                {rowData.rangoFinal}
            </>
        );
    };
    const fechaLimiteEmisionBodyTemplate = (rowData) => {
        var dateDMY = Moment(rowData.fechaLimiteEmision).format('DD/MM/YYYY');
        return (
            <>
                <span className="p-column-title">Fecha Limite Emisión</span>
                {dateDMY}
            </>
        );
    };
    const fechaLimiteInicioBodyTemplate = (rowData) => {
        var dateDMY = Moment(rowData.fechaInicio).format('DD/MM/YYYY');
        return (
            <>
                <span className="p-column-title">Fecha Inicio</span>
                {dateDMY}
            </>
        );
    };
    const ultimaFacturaBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Ultima Factura</span>
                {rowData.ultimaFactura}
            </>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                {actualizar?<Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editParametroFactura(rowData)} />:null}
                {eliminar?<Button icon="pi pi-trash" className="p-button-rounded p-button-warning" onClick={() => confirmDeleteParametroFactura(rowData)} />:null}
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Listado de Parámetros Factura</h5>
            {buscar?<span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
            </span>:null}
        </div>
    );

    const parametrofacturaDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Registar" icon="pi pi-check" className="p-button-text" onClick={saveParametroFactura} />
        </>
    );
    const deleteParametroFacturaDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteParametroFacturaDialog} />
            <Button label="Si" icon="pi pi-check" className="p-button-text" onClick={deleteParametroFactura} />
        </>
    );
    const deleteParametrosFacturaDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteParametrosFacturaDialog} />
            <Button label="Si" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedParametrosFactura} />
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
                            value={parametrosFactura}
                            selection={selectedParametrosFactura}
                            onSelectionChange={(e) => setSelectedParametrosFactura(e.value)}
                            dataKey="idParametro"
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25]}
                            className="datatable-responsive"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Parámetros de Factura"
                            globalFilter={globalFilter}
                            emptyMessage="No se encontrarón parámetros de factura."
                            header={header}
                            responsiveLayout="scroll"
                        >
                            <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                            <Column field="idParametro" header="ID" sortable body={idBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                            <Column field="cai" header="CAI" sortable body={caiBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                            <Column field="rangoInicial" header="Rango Inicial" sortable body={rangoInicialBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                            <Column field="rangoFinal" header="Rango Final" sortable body={rangoFinalBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                            <Column field="fechaLimiteEmision" header="Fecha Límite Emisión" sortable body={fechaLimiteEmisionBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                            <Column field="fechaInicio" header="Fecha Inicio" sortable body={fechaLimiteInicioBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                            <Column field="ultimaFactura" header="Última Factura" sortable body={ultimaFacturaBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                            <Column header="Acciones" body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        </DataTable>:null}
                        
    
                        <Dialog visible={parametrofacturaDialog} style={{ width: '450px' }} header="Registro Parámetros Factura" modal className="p-fluid" footer={parametrofacturaDialogFooter} onHide={hideDialog}>
                            <div className="field">
                                <label htmlFor="cai">CAI</label>
                                <InputMask id="cai" value={valueCai} onChange={(e) => onInputChange(e, 'cai')} mask="******-******-******-******-******-**" slotChar="######-######-######-######-######-##" className={classNames({ 'p-invalid': submitted && !parametrofactura.cai })} />
                                {submitted && !parametrofactura.cai && <small className="p-invalid">CAI es requerido.</small>}
                            </div>
                            <div className="field">
                                <label htmlFor="rangoInicial">Rango Inicial</label>
                                <InputMask id="rangoInicial" value={valueRangoI} onChange={(e) => onInputChange(e, 'rangoInicial')} mask="999-999-99-99999999" slotChar="xxx-xxx-xx-xxxxxxxx" tooltip="Ejemplo dígitos rango  aurorizado desde: 000-001-01-00000000" className={classNames({ 'p-invalid': submitted && !parametrofactura.rangoInicial })} />
                                {submitted && !parametrofactura.rangoInicial && <small className="p-invalid">Rango Inicial es requerido.</small>}
                            </div>
                            <div className="field">
                                <label htmlFor="rangoFinal">Rango Final</label>
                                <InputMask id="rangoFinal" value={valueRangoF} onChange={(e) => onInputChange(e, 'rangoFinal')} mask="999-999-99-99999999" slotChar="xxx-xxx-xx-xxxxxxxx" tooltip="Ejemplo dígitos rango  aurorizado hasta: 000-001-01-00010000 " className={classNames({ 'p-invalid': submitted && !parametrofactura.rangoFinal })} />
                                {submitted && !parametrofactura.rangoFinal && <small className="p-invalid">Rango Final es requerido.</small>}
                            </div>
                            <div className="field">
                                <label htmlFor="fechaLimiteEmision">Fecha Límite de Emisión</label>
                                <Calendar dateFormat="dd/mm/yy" showIcon showButtonBar value={fechaLE} onChange={(e) => onInputChange(e, 'fechaLimiteEmision')} tooltip="La fecha límite de emisión de este parámetro deber ser posterior a una fecha actual." placeholder="Seleccione una fecha limite de Emisión"></Calendar>
                                {submitted && !parametrofactura.fechaLimiteEmision && <small className="p-invalid">Fecha Límite de Emisión es requerida.</small>}
                            </div>
                            <div className="field">
                                <label htmlFor="fechaInicio">Fecha Inicio</label>
                                <Calendar dateFormat="dd/mm/yy" showIcon showButtonBar value={fechaI} onChange={(e) => onInputChange(e, 'fechaInicio')} tooltip="Selecciona la fecha en que empezará a operar este parámetro, que debera ser la fecha de su registro." placeholder="Seleccione una fecha de Inicio"></Calendar>
                                {submitted && !parametrofactura.fechaInicio && <small className="p-invalid">Fecha Inicio es requerida.</small>}
                            </div>
                            {/* <div className="field">
                                <label htmlFor="direccion">Última Factura</label>
                                <InputText id="direccion" type="number" value={parametrofactura.ultimaFactura} onChange={(e) => onInputChange(e, 'ultimaFactura')} className={classNames({ 'p-invalid': submitted && !parametrofactura.ultimaFactura })} />
                                {submitted && !parametrofactura.ultimaFactura && <small className="p-invalid">Dirección es requerido.</small>}
                            </div> */}
    
                        </Dialog>
    
                        <Dialog visible={deleteParametroFacturaDialog} style={{ width: '450px' }} header="Confirmación" modal footer={deleteParametroFacturaDialogFooter} onHide={hideDeleteParametroFacturaDialog}>
                            <div className="flex align-items-center justify-content-center">
                                <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                                {parametrofactura && (
                                    <span>
                                        Esta seguro que desea eliminar a <b>{parametrofactura.cai}</b>?
                                    </span>
                                )}
                            </div>
                        </Dialog>
    
                        <Dialog visible={deleteParametrosFacturaDialog} style={{ width: '450px' }} header="Confirmación" modal footer={deleteParametrosFacturaDialogFooter} onHide={hideDeleteParametrosFacturaDialog}>
                            <div className="flex align-items-center justify-content-center">
                                <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                                {parametrofactura && <span>Esta seguro que desea eliminar los siguientes Parámetros Factura?</span>}
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
export default ParametrosFactura;