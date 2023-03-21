import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { ImpuestoService } from '../../demo/service/ImpuestoService';
import { ImpuestoHistoricoService } from '../../demo/service/ImpuestoHistoricoService';
import { autenticacionRequerida } from '../../utils/AutenticacionRequerida';
import { useSession } from 'next-auth/react';
import { AccionService } from '../../demo/service/AccionService';


const Impuestos = () => {
    let impuestoVacio = {
        idImpuesto: null,
        nombre: "",
        descripcion: "",
        estado: 1,
    };

    let impuestoHistoricoVacio = {
        idImpuesto: null,
        fechaInicio: null,
        fechaFinal: null,
        valor: "",
    };

    const [impuestos, setImpuestos] = useState([]);
    const [impuestoDialog, setImpuestoDialog] = useState(false);
    const [activarDesactivarImpuestoDialog, setActivarDesactivarImpuestoDialog] = useState(false);
    const [impuesto, setImpuesto] = useState(impuestoVacio);
    const [selectedImpuestos, setSelectedImpuestos] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const { data: session } = useSession();

    //impuesto historico
    const [allExpanded, setAllExpanded] = useState(false);
    const [impuestoHistorico, setImpuestoHistorico] = useState(impuestoHistoricoVacio);
    const [impuestoHistoricos, setImpuestoHistoricos] = useState([]);
    const [expandedRows, setExpandedRows] = useState([]);
    const [minDate, setMinDate] = useState(null);
    const [maxDate, setMaxDate] = useState(null);

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
    const [activarDesactivar, setActivarDesactivar] = useState(false);


    const listarImpuestos = () => {
        const impuestoService = new ImpuestoService();
        impuestoService.getImpuestos().then(data => setImpuestos(data));
    };

    const listarImpuestosHistorico = async () => {
        const impuestoHistoricoService = new ImpuestoHistoricoService();
        await impuestoHistoricoService.getImpuestosHistorico().then(data => setImpuestoHistoricos(data));
    };

    const setearRangoFechas = () => {
        const fechaActual = Date.now(); //fecha actual
        let fecha = new Date(fechaActual);

        let fechaAyer = fecha.getFullYear() + "-" + (fecha.getMonth() + 1) + "-" + (fecha.getDate() - 1);
        const [y, m, d] = fechaAyer.split('-');
        let fechaMin = new Date(+y, m - 1, +d);

        setMinDate(fechaMin);
        setMaxDate(fecha);
    };
    let obtenerRol = () => {
        var info = session.user.email.split('/');
        return info[4]
    }
    const listarPermisos = () => {
        const accionService = new AccionService();
        accionService.getAccionesModuloRol(obtenerRol(), 'Impuestos').then(data => { setPermisos(data), setCargando(false) });
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
                case "Activar/Desactivar":
                    setActivarDesactivar(true);
                    break;
                default:
                    break;
            }
        });
    };

    useEffect(async () => {
        listarImpuestos();
        await listarImpuestosHistorico();
        setearRangoFechas();
        listarPermisos();
        permisosDisponibles();
    }, []);

    useEffect(() => {
        permisosDisponibles();
    }, [cargando])

    const openNew = () => {
        setImpuesto(impuestoVacio);
        setImpuestoHistorico(impuestoHistoricoVacio);
        setSubmitted(false);
        setImpuestoDialog(true);
    }

    const hideDialog = () => {
        setSubmitted(false);
        setImpuestoDialog(false);
        //
        setImpuestoHistorico(impuestoHistoricoVacio);
    }

    const hideDeleteImpuestoDialog = () => {
        setActivarDesactivarImpuestoDialog(false);
    }

    const pasoRegistro = () => {
        listarImpuestos();
        listarImpuestosHistorico();
        setImpuestoDialog(false);
        setImpuesto(impuestoVacio);
        //
        setImpuestoHistorico(impuestoHistoricoVacio);
    }

    const saveImpuesto = async () => {
        setSubmitted(true);

        if (impuesto.idImpuesto) {
            try {
                const impuestoService = new ImpuestoService();
                if (!impuestoHistorico.valor)
                    await impuestoService.updateImpuesto(impuesto, 0, true);
                else
                    await impuestoService.updateImpuesto(impuesto, impuestoHistorico.valor, false);
                const impuestoHistoricoService = new ImpuestoHistoricoService();
                if (impuestoHistorico.idImpuesto == null) {
                    //si es primera vez 
                    impuestoHistorico.idImpuesto = impuesto.idImpuesto;
                    impuestoHistorico.fechaInicio = '1822-01-01';
                    impuestoHistorico.fechaFinal = '1822-03-03'
                    await impuestoHistoricoService.addImpuestoHistorico(impuestoHistorico);
                } else {
                    impuestoHistorico.fechaFinal = '1822-03-03'
                    await impuestoHistoricoService.addImpuestoHistorico(impuestoHistorico);
                }
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Impuesto Actualizado', life: 3000 });
                pasoRegistro();
            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });
            }
        }
        else {
            try {
                //agregar impuesto
                const impuestoService = new ImpuestoService();
                if (!impuestoHistorico.valor)
                    await impuestoService.addImpuesto(impuesto, 0, true);
                else
                    await impuestoService.addImpuesto(impuesto, impuestoHistorico.valor, false);
                //agregar impuesto historico
                const impuestoHistoricoService = new ImpuestoHistoricoService();
                impuestoHistorico.fechaInicio = '1822-01-01';
                impuestoHistorico.fechaFinal = '1822-03-03'
                await impuestoHistoricoService.addImpuestoHistorico(impuestoHistorico);
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Impuesto Creado', life: 3000 });
                pasoRegistro();
            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });
            }
        }
    }

    const editImpuesto = (impuesto) => {
        setImpuesto({ ...impuesto });
        impuestoHistoricos.map((item) => {
            if (item.idImpuesto == impuesto.idImpuesto && item.fechaFinal == null) {
                if (item.valor == 0) {
                    let isv = {
                        idImpuesto: item.idImpuesto,
                        fechaInicio: item.fechaInicio,
                        fechaFinal: item.fechaFinal,
                        valor: "0",
                    };
                    setImpuestoHistorico(isv);
                } else {
                    setImpuestoHistorico(item);
                }
            }
        });
        setImpuestoDialog(true);
    }

    const confirmBloquearDesbloquearImpuesto = (impuesto) => {
        setImpuesto(impuesto);
        setActivarDesactivarImpuestoDialog(true);
    }

    const activarDesactivarImpuesto = async () => {
        try {
            const impuestoService = new ImpuestoService();
            impuesto.estado = impuesto.estado == 1 ? 0 : 1;
            await impuestoService.updateImpuesto(impuesto, 1, false);
            listarImpuestos();
            setActivarDesactivarImpuestoDialog(false);
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: `Impuesto ${impuesto.estado == 1 ? 'activado' : 'desactivado'}`, life: 3000 });
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });
        }
    }

    const cols = [
        { field: 'idImpuesto', header: 'ID' },
        { field: 'nombre', header: 'Nombre' },
        { field: 'descripcion', header: 'Descripción' },
        { field: 'estado', header: 'Estado' },
    ]

    const exportColumns = cols.map(col => ({ title: col.header, dataKey: col.field }));

    let objModificado = impuestos.map(function (element) {
        return {
            idImpuesto: element.idImpuesto,
            nombre: element.nombre,
            descripcion: element.descripcion,
            estado: element.estado ? 'Activo' : 'Inactivo'
        }
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
                const txtWidth = doc.getStringUnitWidth('IMPUESTOS REGISTRADOS') * fontSize / doc.internal.scaleFactor;
                const x = (docWidth - txtWidth) / 2;
                image.src = '../layout/images/img_facturalogo2.png';
                doc.addImage(image, 'PNG', 10, 0, 50, 30);
                //centrar texto:
                doc.text('IMPUESTOS REGISTRADOS', x, 15);
                doc.setFontSize(12);
                doc.text(15, 30, 'Usuario: ' + session.user.name);
                doc.text(15, 36, 'Fecha: ' + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString());
                doc.text(docWidth - 15, 30, 'Total Impuestos: ' + impuestos.length, { align: "right" });
                doc.line(15, 40, docWidth - 15, 40);
                doc.autoTable(exportColumns, objModificado, { margin: { top: 45, bottom: 25 } });
                const pageCount = doc.internal.getNumberOfPages();
                for (var i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    doc.line(15, docHeight - 20, docWidth - 15, docHeight - 20);
                    doc.text('Página ' + String(i) + '/' + pageCount, docWidth - 15, docHeight - 10, { align: "right" });
                }
                doc.save('Reporte_Impuestos.pdf');
            });
        });
    }

    const exportExcel = () => {
        var tbl = document.getElementById('TablaImpuesto');
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(objModificado);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array'
            });

            saveAsExcelFile(excelBuffer, 'Reporte_Impuestos');
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


    const onInputChange = (e, nombre) => {
        const val = (e.target && e.target.value) || '';
        let _Impuesto = { ...impuesto };
        _Impuesto[`${nombre}`] = val;
        setImpuesto(_Impuesto);
    }

    const onValorChange = (e, nombre) => {
        const val = (e.target && e.target.value) || '';
        let _ImpuestoHistorico = { ...impuestoHistorico };
        let valor = 0;
        valor = (val == '00') ? '0' : val;
        _ImpuestoHistorico[`${nombre}`] = valor;
        setImpuestoHistorico(_ImpuestoHistorico);
    }

    const toggleAll = () => {
        if (allExpanded) collapseAll();
        else expandAll();
    };

    const expandAll = () => {
        let _expandedRows = {};
        impuestos.forEach((p) => (_expandedRows[`${p.idImpuesto}`] = true));

        setExpandedRows(_expandedRows);
        setAllExpanded(true);
    };

    const collapseAll = () => {
        setExpandedRows(null);
        setAllExpanded(false);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    {agregar ? <Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} /> : null}
                    {verLista ? <Button icon={allExpanded ? 'pi pi-minus' : 'pi pi-plus'} label={allExpanded ? 'Colapsar Todas' : 'Expandir Todas'} onClick={toggleAll} className="w-12rem"
                        disabled={!impuestos || !impuestos.length} /> : null}
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
                <span className="p-column-title">Código</span>
                {rowData.idImpuesto}
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
                <span className="p-column-title">Descripción</span>
                {rowData.descripcion}
            </>
        );
    }

    const estadoBodyTemplate = (rowData) => {
        if (rowData.estado == 1) {
            return (
                <>
                    <span className={`customer-badge status-qualified`}>Activo</span>
                </>
            );
        } else {
            return (
                <>
                    <span className={`customer-badge status-unqualified`}>Inactivo</span>
                </>
            );
        }
    }

    const actionBodyTemplate = (rowData) => {
        let iconResult = ''
        if (rowData.estado == 1) {
            iconResult = 'pi pi-lock-open'
        } else {
            iconResult = 'pi pi-lock'
        }
        return (
            <div className="actions">
                {actualizar ? <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editImpuesto(rowData)} /> : null}
                {activarDesactivar ? <Button icon={iconResult} className="p-button-rounded p-button-secondary mt-2" onClick={() => confirmBloquearDesbloquearImpuesto(rowData)} /> : null}

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
            <h5 className="m-0">Listado de Impuestos</h5>
            {buscar? <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => filter(e)} placeholder="Buscar..." />
            </span>:null}
        </div>
    );

    const impuestoDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" className="p-button-text" onClick={saveImpuesto} />
        </>
    );
    const ActivarDesactivarImpuestoDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteImpuestoDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={activarDesactivarImpuesto} />
        </>
    );

    const valorBodyTemplate = (rowData) => {
        return rowData.valor + '%';
    };

    const cellEditor = (options) => {
        //disabled={!options.value || (options.value != minDate && options.value != maxDate)}
        if (options.value) {
            return calendarEditor(options);
        }
        else
            return options.value;
    };

    const calendarEditor = (options) => {
        return <Calendar minDate={minDate} maxDate={maxDate} dateFormat="yy-mm-dd" value={options.value} onChange={(e) => options.editorCallback(e.target.value)}
        ></Calendar>;
    };

    const getFecha = (fecha) => {
        const getDay = (day) => {
            return (day < 10) ? "0" + day : day;
        };
        const getMonth = (month) => {
            return ((month + 1) < 10) ? "0" + (month + 1) : (month + 1)
        };
        let _fecha = fecha.getFullYear() + "-" + getMonth(fecha.getMonth()) + "-" + getDay(fecha.getDate());
        return _fecha;
    };

    const onCellEditComplete = async (e) => {
        let { rowData, newValue, field, originalEvent: event } = e;
        let min_date = getFecha(minDate);
        let max_date = getFecha(maxDate);
        let impuesto_historico = { ...impuestoHistoricoVacio };
        impuesto_historico = rowData;
        let fecha; let fechaActualizar; let valor;
        if (newValue == impuesto_historico.fechaFinal) {
            let valor = '' + newValue;
            const [y, m, d] = valor.split('-');
            fecha = new Date(+y, m - 1, +d);
            fechaActualizar = getFecha(fecha);
        } else {
            valor = '' + newValue;
            fecha = new Date(valor);
            fechaActualizar = getFecha(fecha);
        }

        try {

            if (fechaActualizar != impuesto_historico.fechaFinal &&
                (fechaActualizar == min_date || fechaActualizar == max_date) &&
                (impuesto_historico.fechaFinal == min_date || impuesto_historico.fechaFinal == max_date)) {

                impuesto_historico[field] = fechaActualizar;
                //actualizar BD
                const impuestoHistoricoService = new ImpuestoHistoricoService();
                impuestoHistoricoService.updateImpuestoHistorico(impuesto_historico);
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Fechas Actualizadas', life: 3000 });
                listarImpuestosHistorico();
            } else {
                event.preventDefault();
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });
        }
    };

    const rowExpansionTemplate = (data) => {
        let table = [];
        impuestoHistoricos.map((item) => {
            if (item.idImpuesto == data.idImpuesto) {
                table.push(item);
            }
        });
        return (
            <div className="orders-subtable">
                <h5>Histórico del Impuesto: {data.nombre}</h5>
                <DataTable value={table}
                    editMode="cell"
                    className="editable-cells-table"
                    responsiveLayout="scroll"
                    emptyMessage="No se encontraron valores del impuesto.">
                    <Column field="fechaInicio" header="Fecha Inicial" sortable headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                    <Column key="fechaFinal" field="fechaFinal" header="Fecha Final" sortable headerStyle={{ width: '14%', minWidth: '10rem' }}
                        editor={(options) => cellEditor(options)} onCellEditComplete={onCellEditComplete} ></Column>
                    <Column field="valor" header="Valor" body={valorBodyTemplate} sortable headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                </DataTable>
            </div>
        );
    };
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
                            value={impuestos}
                            dataKey="idImpuesto"
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25]}
                            className="datatable-responsive"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} impuestos"
                            globalFilter={globalFilter}
                            emptyMessage="No se encontraron impuestos."
                            header={header}
                            responsiveLayout="scroll"
                            expandedRows={expandedRows}
                            onRowToggle={(e) => setExpandedRows(e.data)}
                            rowExpansionTemplate={rowExpansionTemplate}
                        >
                            <Column expander style={{ width: '3em' }} />
                            <Column field="idImpuesto" header="Código" sortable body={idBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                            <Column field="nombre" header="Nombre" sortable body={nombreBodyTemplate} headerStyle={{ width: '20%', minWidth: '10rem' }}></Column>
                            <Column field="descripcion" header="Descripción" sortable body={descripcionBodyTemplate} headerStyle={{ width: '40%', minWidth: '10rem' }}></Column>
                            <Column field="estado" header="Estado" body={estadoBodyTemplate} sortable headerStyle={{ width: '14%', minWidth: '8rem' }}></Column>
                            <Column header="Acciones" body={actionBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        </DataTable>:null}
                        
    
                        <Dialog visible={impuestoDialog} style={{ width: '450px' }} header="Detalles de Impuesto" modal className="p-fluid" footer={impuestoDialogFooter} onHide={hideDialog}>
                            <div className="field">
                                <label htmlFor="nombre">Nombre</label>
                                <InputText id="nombre" value={impuesto.nombre} onChange={(e) => onInputChange(e, 'nombre')} tooltip="Debe ingresar más de tres caracteres"
                                    className={classNames({ 'p-invalid': submitted && !impuesto.nombre })} />
                                {submitted && !impuesto.nombre && <small className="p-invalid">El nombre es requerido.</small>}
                            </div>
                            <div className="field">
                                <label htmlFor="descripcion">Descripción</label>
                                <InputTextarea id="descripcion" value={impuesto.descripcion} onChange={(e) => onInputChange(e, 'descripcion')} tooltip="Debe ingresar más de cinco caracteres"
                                    className={classNames({ 'p-invalid': submitted && !impuesto.descripcion })} />
                                {submitted && !impuesto.descripcion && <small className="p-invalid">La descripción es requerida.</small>}
                            </div>
                            <div className="field">
                                <label htmlFor="valor">Valor</label>
                                <span className='p-float-label p-input-icon-left'>
                                    <i className='pi pi-percentage' />
                                    <InputText id="valor" type="number" value={impuestoHistorico.valor} onChange={(e) => onValorChange(e, 'valor')} tooltip="Escribe solamente el número (sin su tanto porciento) del valor del impuesto"
                                        keyfilter={/[0-9]+/} className={classNames({ 'p-invalid': submitted && !impuestoHistorico.valor })} />
                                    {submitted && !impuestoHistorico.valor && <small className="p-invalid">El valor es requerido.</small>}
                                </span>
                            </div>
                        </Dialog>
    
                        <Dialog visible={activarDesactivarImpuestoDialog} style={{ width: '450px' }} header="Confirmar" modal footer={ActivarDesactivarImpuestoDialogFooter} onHide={hideDeleteImpuestoDialog}>
                            <div className="flex align-items-center justify-content-center">
                                <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                                {impuesto && <span>¿Está seguro de que desea <b>{impuesto.estado == 1 ? "desactivar " : "activar "}</b> a <b>{impuesto.nombre}</b>?</span>}
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

export default Impuestos;
