import getConfig from 'next/config';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { RadioButton } from 'primereact/radiobutton';
import { Rating } from 'primereact/rating';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { ArqueoService } from '../../demo/service/Arqueoservice';
import { EmpleadoService } from '../../demo/service/EmpleadoService';
import Moment from 'moment';
import { Calendar } from 'primereact/calendar';
import { autenticacionRequerida } from '../../utils/AutenticacionRequerida';
import { useSession } from 'next-auth/react'


const Arqueos = () => {
    let emptyArqueo = {
        idArqueo: null,
        fecha: null,
        empleado: null,
        totalRecuento: null,
        observacion: ''
    };

    let emptyRestApiError = {
        httpStatus: '',
        errorMessage: '',
        errorDetails: ''
    };
    const [empleados, setEmpleados] = useState([]);
    const [empleado, setEmpleado] = useState(null);
    const [arqueos, setArqueos] = useState([]);
    const [calendarValueNac, setCalendarValueNac] = useState(null);
    const [arqueoDialog, setArqueoDialog] = useState(false);
    const [deleteArqueoDialog, setDeleteArqueoDialog] = useState(false);
    const [deleteArqueosDialog, setDeleteArqueosDialog] = useState(false);
    const [arqueo, setArqueo] = useState(emptyArqueo);
    const [apiError, setApiError] = useState(emptyRestApiError);
    const [selectedArqueos, setSelectedArqueos] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;
    const { data: session } = useSession();



    const listarArqueos = () => {
        const arqueoservice = new ArqueoService();
        arqueoservice.getArqueos().then(data => setArqueos(data));
    };
    const listarEmpleados = async () => {
        const empleadoService = new EmpleadoService();
        await empleadoService.getEmpleados().then(data => setEmpleados(data))
    }



    useEffect(async () => {
        listarArqueos();
        console.log(arqueos)
        await listarEmpleados();
    }, []);
    //const [documentosItem,setOpcionesDocumentoItem] = useState(null);
    //const documentosItem = tipoDocumentos.map((idTipoDocumento) =>{
    //})
    const openNew = () => {
        setArqueo(emptyArqueo);
        setEmpleado(null);
        setCalendarValueNac(null);
        setSubmitted(false);
        setArqueoDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setArqueoDialog(false);
    };

    const hideDeleteArqueoDialog = () => {
        setDeleteArqueoDialog(false);
    };

    const hideDeleteArqueosDialog = () => {
        setDeleteArqueosDialog(false);
    };

    const pasoRegistro = () => {
        listarArqueos();
        setArqueoDialog(false);
        setArqueo(emptyArqueo);
    }

    const saveArqueo = async () => {
        setSubmitted(true);

        //if (arqueo.nombre.trim()) {
        if (arqueo.idArqueo) {
            try {
                const arqueoservice = new ArqueoService();
                await arqueoservice.updateArqueo(arqueo);
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Arqueo Actualizado', life: 3000 });
                pasoRegistro();
            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });
            }
        } else {
            try {
                const arqueoservice = new ArqueoService();
                await arqueoservice.addArqueo(arqueo);
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Arqueo Registrado', life: 3000 });
                pasoRegistro();
            } catch (error) {
                console.log(arqueo);
                console.log(error);
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });
            }
        };

        //}
    };

    const editArqueo = (arqueo) => {
        console.log(arqueo);
        const empleado = empleados.find((item) => {
            if (item.idEmpleado == arqueo.idEmpleado)
                return item
        });
        const fechaA = () => {
            var arqueoDate = arqueo.fecha.toString().split('-');
            return new Date(arqueoDate[0], arqueoDate[1] - 1, arqueoDate[2]);
        }
        setCalendarValueNac(fechaA);
        setEmpleado(empleado);
        setArqueo({ ...arqueo });
        setArqueoDialog(true);
    };

    const deleteArqueo = async () => {
        try {
            const arqueoservice = new ArqueoService();
            await arqueoservice.removeArqueo(arqueo.idArqueo);
            listarArqueos();
            setDeleteArqueoDialog(false);
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Arqueo Eliminado', life: 3000 });
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        }
    };

    const confirmDeleteArqueo = (arqueo) => {
        setArqueo(arqueo);
        setDeleteArqueoDialog(true);
    };

    const cols = [
        { field: 'idArqueo', header: 'ID' },
        { field: 'fecha', header: 'Fecha Arqueo' },
        { field: 'empleado', header: 'Empleado' },
        { field: 'totalRecuento', header: 'Total Recuento' },
        { field: 'observacion', header: 'Observación' }
    ]

    const exportColumns = cols.map(col => ({ title: col.header, dataKey: col.field }));
    //metodo para sacar a la raiz del objeto, l apropiedad nombre del objeto anidado ya que no accede el datakey por si solo.
    // let dataExport = Object.assign([], arqueos);
    // dataExport = dataExport.map(obj => {
    //     obj.empleadoN = `${obj.empleado.nombre}`;
    //     return obj;
    // });
    let objModificado = arqueos.map(function (element) {
        return {
            idArqueo: element.idArqueo,
            fecha: element.fecha,
            empleado: element.empleado.nombre,
            totalRecuento: element.totalRecuento,
            observacion: element.observacion
        };
    });


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
                const txtWidth = doc.getStringUnitWidth('ARQUEOS REALIZADOS') * fontSize / doc.internal.scaleFactor;
                const x = (docWidth - txtWidth) / 2;
                image.src = '../layout/images/img_facturalogo2.png';
                doc.addImage(image, 'PNG', 10, 0, 50, 30);
                //centrar texto:
                doc.text('ARQUEOS REALIZADOS', x, 15);
                doc.setFontSize(12);
                doc.text(15, 30, 'Usuario: ' + session.user.name);
                doc.text(15, 36, 'Fecha: ' + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString());
                doc.text(docWidth - 15, 30, 'Total Arqueos: ' + arqueos.length, { align: "right" });
                doc.line(15, 40, docWidth - 15, 40);
                doc.autoTable(exportColumns, objModificado, { margin: { top: 45, bottom: 25 } });
                const pageCount = doc.internal.getNumberOfPages();
                for (var i = 1; i <= pageCount; i++) {
                    doc.line(15, docHeight - 20, docWidth - 15, docHeight - 20);
                    doc.text('Página ' + String(i) + '/' + pageCount, docWidth - 15, docHeight - 10, { align: "right" });
                }
                doc.save('Reporte_Arqueos.pdf');
            });
        });
    };

    const exportExcel = () => {
        var tbl = document.getElementById('TablaArqueo');
        import('xlsx').then((xlsx) => {
            //const worksheet = xlsx.utils.table_to_sheet(tbl);
            const worksheet = xlsx.utils.json_to_sheet(objModificado);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array'
            });

            saveAsExcelFile(excelBuffer, 'Reporte_Arqueos');
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
        setDeleteArqueosDialog(true);
    }
    const deleteSelectedArqueos = () => {
        const arqueoService = new ArqueoService();
        selectedArqueos.map(async (arqueo) => {
            await arqueoService.removeArqueo(arqueo.idArqueo);
        });
        let _arqueos = arqueos.filter((val) => !selectedArqueos.includes(val));
        setArqueos(_arqueos);
        setDeleteArqueosDialog(false);
        setSelectedArqueos(null);
        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Arqueos Eliminados', life: 3000 });
    };

    const onInputChange = (e, nombre) => {
        const val = (e.target && e.target.value) || '';
        let _arqueo = { ...arqueo };
        if (nombre == 'empleado') {
            _arqueo[`${nombre}`] = val;
            setEmpleado(e.value);
        } else if (nombre == 'fecha') {
            _arqueo[`${nombre}`] = val;
            setCalendarValueNac(e.value);
        } else {
            _arqueo[`${nombre}`] = val;
        }
        //console.log(_arqueo);
        setArqueo(_arqueo);
    };


    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                    <Button label="Eliminar" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedArqueos || !selectedArqueos.length} />
                </div>
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button type="button" icon="pi pi-file" onClick={() => exportCSV(false)} className="mr-2" tooltip="CSV" tooltipOptions={{ position: 'bottom' }} />
                <Button type="button" icon="pi pi-file-excel" onClick={exportExcel} className="p-button-success mr-2" tooltip="XLSX" tooltipOptions={{ position: 'bottom' }} />
                <Button type="button" icon="pi pi-file-pdf" onClick={exportPdf} className="p-button-warning mr-2" tooltip="PDF" tooltipOptions={{ position: 'bottom' }} />
            </React.Fragment>
        );
    };

    const idBodyTemplate = (rowData) => {
        return (
            <>

                {rowData.idArqueo}
            </>
        );
    };
    const fechaBodyTemplate = (rowData) => {
        var dateDMY = Moment(rowData.fecha).format('DD/MM/YYYY')
        return (
            <>

                {dateDMY}
            </>
        );
    };

    const idEmpleadoBodyTemplate = (rowData) => {
        return (
            <>
                {
                    rowData.empleado.nombre
                }
            </>
        );
    };

    const totalRecuentoBodyTemplate = (rowData) => {
        return (
            <>

                L. {rowData.totalRecuento}
            </>
        );
    };

    const observacionBodyTemplate = (rowData) => {
        return (
            <>

                {rowData.observacion}
            </>
        );
    };


    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editArqueo(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning" onClick={() => confirmDeleteArqueo(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Listado de Arqueos</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const arqueoDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Registar" icon="pi pi-check" className="p-button-text" onClick={saveArqueo} />
        </>
    );
    const deletearqueoDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteArqueoDialog} />
            <Button label="Si" icon="pi pi-check" className="p-button-text" onClick={deleteArqueo} />
        </>
    );
    const deleteArqueosDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteArqueosDialog} />
            <Button label="Si" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedArqueos} />
        </>
    );

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable id='TablaArqueo'
                        ref={dt}
                        value={arqueos}
                        selection={selectedArqueos}
                        onSelectionChange={(e) => setSelectedArqueos(e.value)}
                        dataKey="idArqueo"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Arqueos"
                        globalFilter={globalFilter}
                        emptyMessage="No se encontraron arqueos."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                        <Column field="idArqueo" header="ID" sortable body={idBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="fecha" header="Fecha Arqueo" sortable body={fechaBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="empleado.nombre" header="Empleado" sortable body={idEmpleadoBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="totalRecuento" header="Total Recuento" sortable body={totalRecuentoBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="observacion" header="Observación" sortable body={observacionBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column header="Acciones" body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={arqueoDialog} style={{ width: '450px' }} header="Registro Arqueos" modal className="p-fluid" footer={arqueoDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="fecha">Fecha del Arqueo</label>
                            <Calendar dateFormat="dd/mm/yy" showIcon showButtonBar value={calendarValueNac} onChange={(e) => onInputChange(e, 'fecha')} placeholder="Seleccione una fecha"></Calendar>
                            {submitted && !arqueo.fecha && <small className="p-invalid">Fecha es requerida.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="idEmpleado">Empleado</label>
                            <Dropdown id="idEmpleado" options={empleados} value={arqueo.empleado} onChange={(e) => onInputChange(e, 'empleado')} optionLabel="nombre" placeholder="Seleccione un empleado" className={classNames({ 'p-invalid': submitted && !arqueo.empleado })}></Dropdown>
                            {submitted && !arqueo.empleado && <small className="p-invalid">Tipo Documento es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="precio">Total Recuento</label>
                            <InputNumber id="precio" value={arqueo.totalRecuento} onValueChange={(e) => onInputChange(e, 'totalRecuento')} mode='currency' currency='HNL' locale='en-US' required autoFocus className={classNames({ 'p-invalid': submitted && !arqueo.totalRecuento })} />
                            {submitted && !arqueo.totalRecuento && <small className="p-invalid">El recuento total es requerido, no debe ser menor o igual a cero.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="observacion">Observación</label>
                            <InputText id="observacion" value={arqueo.observacion} onChange={(e) => onInputChange(e, 'observacion')} required autoFocus className={classNames({ 'p-invalid': submitted && !arqueo.observacion })} />
                            {submitted && !arqueo.observacion && <small className="p-invalid">Observacion es requerido.</small>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteArqueoDialog} style={{ width: '450px' }} header="Confirmación" modal footer={deletearqueoDialogFooter} onHide={hideDeleteArqueoDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {arqueo && (
                                <span>
                                    Esta seguro que desea eliminar el arqueo: <b>{arqueo.idArqueo}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteArqueosDialog} style={{ width: '450px' }} header="Confirmación" modal footer={deleteArqueosDialogFooter} onHide={hideDeleteArqueosDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {arqueo && <span>Esta seguro que desea eliminar los siguientes Arqueos?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};
export async function getServerSideProps({ req }) {
    return autenticacionRequerida(req, ({ session }) => {
        return {
            props: { session }
        }
    })
}

export default Arqueos;