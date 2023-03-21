import getConfig from 'next/config';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { PickList } from 'primereact/picklist';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { ModuloService } from '../../demo/service/ModuloService';
import { AccionService } from '../../demo/service/AccionService';
import { ModuloAccionService } from '../../demo/service/ModuloAccionService';
import { autenticacionRequerida } from '../../utils/AutenticacionRequerida';
import { useSession } from 'next-auth/react'
import { InputGroup } from 'react-bootstrap';

const Modulos = () => {
    let moduloVacio = {
        idModulo: null,
        nombre: ''
    };

    const [modulos, setModulos] = useState([]);
    const [moduloDialog, setModuloDialog] = useState(false);
    const [deleteModuloDialog, setDeleteModuloDialog] = useState(false);
    const [deleteModulosDialog, setDeleteModulosDialog] = useState(false);
    const [modulo, setModulo] = useState(moduloVacio);
    const [selectedModulos, setSelectedModulos] = useState(null);
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
    const [asignar, setAsignar] = useState(false);

    //acciones, pick list
    const [acciones, setAcciones] = useState([]);
    const [listaPickList, setListaPickList] = useState([]);
    const [modulosAccion, setModulosAccion] = useState([]);
    const [modulo_accionDialog, setModulo_accionDialog] = useState(false);
    const [header_, setHeader_] = useState(null);
    const [target, setTarget] = useState([]);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;
    const [allExpanded, setAllExpanded] = useState(false);
    const [expandedRows, setExpandedRows] = useState([]);

    const onChange = (event) => {
        setListaPickList(event.source);
        setTarget(event.target);
    }

    const listarModulos = () => {
        const moduloService = new ModuloService();
        moduloService.getModulos().then(data => setModulos(data));
    };

    const listarAcciones = () => {
        const accionService = new AccionService();
        accionService.getAcciones().then(data => setAcciones(data));
    };

    const listarModuloAcciones = () => {
        const moduloAccionesService = new ModuloAccionService();
        moduloAccionesService.getModulosAccion().then(data => setModulosAccion(data));
    };
    let obtenerRol = () => {
        var info = session.user.email.split('/');
        return info[4]
    }
    const listarPermisos = () => {
        const accionService = new AccionService();
        accionService.getAccionesModuloRol(obtenerRol(), 'Módulos').then(data => { setPermisos(data), setCargando(false) });
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
                case "Asignar":
                    setAsignar(true);
                    break;
                default:
                    break;
            }
        });
    };

    useEffect(() => {
        listarModulos();
        listarAcciones();
        listarModuloAcciones();
        listarPermisos();
        permisosDisponibles();
    }, []);

    useEffect(() => {
        permisosDisponibles();
    }, [cargando]);

    const openNew = () => {
        setModulo(moduloVacio);
        setSubmitted(false);
        setModuloDialog(true);
    }

    const hideDialog = () => {
        setSubmitted(false);
        setModuloDialog(false);
    }

    const hideDeleteModuloDialog = () => {
        setDeleteModuloDialog(false);
    }

    const hideDeleteModulosDialog = () => {
        setDeleteModulosDialog(false);
    }

    const pasoRegistro = () => {
        listarModulos();
        setModuloDialog(false);
        setModulo(moduloVacio);
    }

    const saveModulo = async () => {
        setSubmitted(true);

        if (modulo.idModulo) {
            try {
                const moduloService = new ModuloService();
                await moduloService.updateModulo(modulo);
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Modulo Actualizado', life: 3000 });
                pasoRegistro();
            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });
            }
        }
        else {
            try {
                const moduloService = new ModuloService();
                await moduloService.addModulo(modulo);
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Modulo Creado', life: 3000 });
                pasoRegistro();
            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });

            }
        }

    }

    const editModulo = (modulo) => {
        setModulo({ ...modulo });
        setModuloDialog(true);
    }

    const listarPickList = (modulo) => {
        let picklist = [];
        let target_ = [];
        modulosAccion.map((item) => {
            acciones.map((accion) => {
                if (item.modulo.idModulo === modulo.idModulo) {
                    if (item.accion.idAccion === accion.idAccion) {
                        target_.push(accion);
                    }
                }
            });
        });

        if (target_.length) {
            picklist = acciones.filter((val) => !target_.includes(val));
        } else {
            picklist = [...acciones];
        }

        setListaPickList(picklist);
        setTarget(target_);
    }

    const moduloAccion = (modulo) => {
        setModulo({ ...modulo });
        setHeader_("Agregar Acciones al Módulo: " + modulo.nombre);
        setModulo_accionDialog(true);
        listarPickList(modulo);
    }

    const hideModuloAccionDialog = () => {
        setModulo_accionDialog(false);
    }

    const guardarCambiosModuloAccion = async () => {
        let mensaje = "";
        if (modulo.idModulo) {
            //acciones registradas
            let acciones_ = [];
            modulosAccion.map((item) => {
                acciones.map((accion) => {
                    if (item.modulo.idModulo === modulo.idModulo) {
                        if (item.accion.idAccion === accion.idAccion) {
                            acciones_.push(accion);
                        }
                    }
                });
            });

            //eliminar
            const moduloAccionService = new ModuloAccionService();
            let lista_ = listaPickList.filter((val) => acciones_.includes(val));
            if (lista_.length > 0) {
                modulosAccion.map(async (item) => {
                    lista_.map(async (accion) => {
                        if (item.modulo.idModulo === modulo.idModulo) {
                            if (item.accion.idAccion === accion.idAccion) {
                                try {
                                    await moduloAccionService.removeModuloAccion(item.idModuloAccion);
                                } catch (error) {
                                    mensaje = 'Error: No se realizarán los cambios';
                                    toast.current.show({ severity: 'error', summary: mensaje, detail: error + ` ${item.accion.nombre}`, life: 3000 });
                                }
                            }
                        }
                    });
                });
            }
            if (mensaje === "") {
                try {
                    //acciones registradas
                    let acciones__ = [];
                    modulosAccion.map((item) => {
                        acciones.map((accion) => {
                            if (item.modulo.idModulo === modulo.idModulo) {
                                if (item.accion.idAccion === accion.idAccion) {
                                    acciones__.push(accion);
                                }
                            }
                        });
                    });
                    //guardar
                    let lista_agregar = target.filter((val) => !acciones__.includes(val));
                    if (lista_agregar.length > 0) {
                        let accionesAgregar = [];
                        lista_agregar.map((item) => {
                            let moduloAccion = {
                                idModuloAccion: null,
                                modulo: modulo,
                                accion: item
                            }
                            accionesAgregar.push(moduloAccion);
                        });
                        const moduloAccionService = new ModuloAccionService();
                        await moduloAccionService.addModulosAccion(accionesAgregar);
                    }

                    listarModulos();
                    let cambios = await moduloAccionService.getModulosAccion();
                    setModulosAccion(cambios);
                    setModulo_accionDialog(false);
                    toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Los Cambios Han Sido Guardados', life: 3000 });

                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });
                }
            }
        }
    }

    const confirmDeleteModulo = (modulo) => {
        setModulo(modulo);
        setDeleteModuloDialog(true);
    }

    const deleteModulo = async () => {
        try {
            const moduloService = new ModuloService();
            await moduloService.removeModulo(modulo.idModulo);
            listarModulos();
            setDeleteModuloDialog(false);
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Modulo Eliminado', life: 3000 });

        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        }
    }

    const cols = [
        { field: 'idModulo', header: 'ID' },
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
                const txtWidth = doc.getStringUnitWidth('MODULOS') * fontSize / doc.internal.scaleFactor;
                const x = (docWidth - txtWidth) / 2;
                image.src = '../layout/images/img_facturalogo2.png';
                doc.addImage(image, 'PNG', 10, 0, 50, 30);
                //centrar texto:
                doc.text('MODULOS', x, 15);
                doc.setFontSize(12);
                doc.text(15, 30, 'Usuario: ' + session.user.name);
                doc.text(15, 36, 'Fecha: ' + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString());
                doc.text(docWidth - 15, 30, 'Total Modulos: ' + modulos.length, { align: "right" });
                doc.line(15, 40, docWidth - 15, 40);
                doc.autoTable(exportColumns, modulos, { margin: { top: 45, bottom: 25 } });
                const pageCount = doc.internal.getNumberOfPages();
                for (var i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    doc.line(15, docHeight - 20, docWidth - 15, docHeight - 20);
                    doc.text('Página ' + String(i) + '/' + pageCount, docWidth - 15, docHeight - 10, { align: "right" });
                }
                doc.save('Reporte_Modulos.pdf');
            });
        });
    };

    const exportExcel = () => {
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(modulos);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array'
            });

            saveAsExcelFile(excelBuffer, 'Reporte_Modulos');
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
        setDeleteModulosDialog(true);
    }


    const deleteSelectedModulos = async () => {
        const moduloService = new ModuloService();
        selectedModulos.map(async (modulo) => {
            await moduloService.removeModulo(modulo.idModulo);
        });
        let _modulos = modulos.filter((val) => !selectedModulos.includes(val));
        setModulos(_modulos);
        setDeleteModulosDialog(false);
        setSelectedModulos(null);
        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Moduloes Eliminados', life: 3000 });
    }


    const onInputChange = (e, nombre) => {
        const val = (e.target && e.target.value) || '';
        let _modulo = { ...modulo };
        _modulo[`${nombre}`] = val;

        setModulo(_modulo);
    }

    const toggleAll = () => {
        if (allExpanded) collapseAll();
        else expandAll();
    };

    const expandAll = () => {
        let _expandedRows = {};
        modulos.forEach((p) => (_expandedRows[`${p.idModulo}`] = true));

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
                    {agregar?<Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />:null}
                    {verLista?<Button icon={allExpanded ? 'pi pi-minus' : 'pi pi-plus'} label={allExpanded ? 'Colapsar Todas' : 'Expandir Todas'} onClick={toggleAll} className="w-12rem"
                        disabled={!modulos || !modulos.length} />:null}
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
                <span className="p-column-title">ID Módulo</span>
                {rowData.idModulo}
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
                {actualizar?<Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editModulo(rowData)} />:null}
                {asignar?<Button icon="pi pi-plus" className="p-button-rounded p-button-primary mr-2" onClick={() => moduloAccion(rowData)} />:null}
                {eliminar?<Button icon="pi pi-trash" className="p-button-rounded p-button-warning mt-2" onClick={() => confirmDeleteModulo(rowData)} />:null}
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
            <h5 className="m-0">Listado de Módulos</h5>
            {buscar?<span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => filter(e)} placeholder="Buscar..." />
            </span>:null}
        </div>
    );

    const moduloDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" className="p-button-text" onClick={saveModulo} />
        </>
    );

    const moduloAccionDialogFooter = (
        <>
            <Button label="Guardar cambios" icon="pi pi-check" className="p-button-text" onClick={guardarCambiosModuloAccion} />
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideModuloAccionDialog} />
        </>
    );

    const deleteModuloDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteModuloDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteModulo} />
        </>
    );
    const deleteModulosDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteModulosDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedModulos} />
        </>
    );

    const rowExpansionTemplate = (data) => {
        let table = [];
        modulosAccion.map((item) => {
            if (item.modulo.idModulo == data.idModulo) {
                table.push(item);
            }
        });
        return (
            <div className="orders-subtable">
                <h5>Acciones del Módulo: {data.nombre}</h5>
                <DataTable value={table}
                    editMode="cell"
                    className="editable-cells-table"
                    responsiveLayout="scroll"
                    emptyMessage="No se encontraron acciones del módulo.">
                    <Column field="idModuloAccion" header="ID" sortable headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                    <Column field="accion.idAccion" header="ID Acción" sortable headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                    <Column field="accion.nombre" header="Nombre" sortable headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                </DataTable>
            </div>
        );
    };

    //PickList
    const itemTemplate = (item) => {
        const templateClass = classNames({
            'pi pi-plus': item.nombre === "Registrar",
            'pi pi-pencil': item.nombre === "Actualizar",
            'pi pi-trash': item.nombre === "Eliminar",
            'pi pi-file': item.nombre === "Exportar CSV",
            'pi pi-file-excel': item.nombre === "Exportar Excel",
            'pi pi-file-pdf': item.nombre === "Exportar PDF",
            'pi pi-book': item.nombre === "Ver Lista",
            'pi pi-search': item.nombre === "Buscar",
            'pi pi-check-circle': item.nombre === "Activar/Desactivar",
            'pi pi-key': item.nombre === "Bloquear/Desbloquear",
            'pi pi-clone': item.nombre === "Asignar"
        });
        return (
            <div className="flex flex-wrap p-2 align-items-center gap-3">
                <i className={templateClass} style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }}></i>
                <div className="flex-1 flex flex-column gap-2">
                    <span className="font-bold">{item.nombre}</span>
                    <div className="flex align-items-center gap-2">
                    </div>
                </div>
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
                            value={modulos}
                            dataKey="idModulo"
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25]}
                            className="datatable-responsive"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} módulos"
                            globalFilter={globalFilter}
                            emptyMessage="No se encontraron módulos."
                            header={header}
                            responsiveLayout="scroll"
                            expandedRows={expandedRows}
                            onRowToggle={(e) => setExpandedRows(e.data)}
                            rowExpansionTemplate={rowExpansionTemplate}
                        >
                            <Column expander style={{ width: '3em' }}></Column>
                            <Column field="idModulo" header="ID" sortable body={idBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                            <Column field="nombre" header="Nombre" sortable body={nombreBodyTemplate} headerStyle={{ width: '14%', minWidth: '20rem' }}></Column>
                            <Column header="Acciones" body={actionBodyTemplate}></Column>
                        </DataTable>:null}
                        
                        <Dialog visible={moduloDialog} style={{ width: '450px' }} header="Registro de Modulos" modal className="p-fluid" footer={moduloDialogFooter} onHide={hideDialog}>
    
                            <div className="field">
                                <label htmlFor="nombre">Nombre</label>
                                <InputText id="nombre" value={modulo.nombre} onChange={(e) => onInputChange(e, 'nombre')} required autoFocus className={classNames({ 'p-invalid': submitted && !modulo.nombre })} />
                                {submitted && !modulo.nombre && <small className="p-invalid">Nombre es requerido.</small>}
                            </div>
                        </Dialog>
    
                        <Dialog visible={modulo_accionDialog} style={{ width: '950px' }} header={header_} modal className="p-fluid" footer={moduloAccionDialogFooter} onHide={hideModuloAccionDialog}>
    
                            <PickList source={listaPickList} target={target} onChange={onChange} itemTemplate={itemTemplate} filterBy="idAccion" breakpoint="1400px"
                                sourceHeader="Disponibles" targetHeader="Seleccionados" sourceStyle={{ height: '30rem' }} targetStyle={{ height: '30rem' }}
                                sourceFilterPlaceholder="Buscar por ID" targetFilterPlaceholder="Buscar por ID" />
    
                        </Dialog>
    
                        <Dialog visible={deleteModuloDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteModuloDialogFooter} onHide={hideDeleteModuloDialog}>
                            <div className="flex align-items-center justify-content-center">
                                <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                                {modulo && <span>¿Está seguro de que desea eliminar a <b>{modulo.nombre}</b>?</span>}
                            </div>
                        </Dialog>
    
                        <Dialog visible={deleteModulosDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteModulosDialogFooter} onHide={hideDeleteModulosDialog}>
                            <div className="flex align-items-center justify-content-center">
                                <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                                {modulo && <span>¿Está seguro de que desea eliminar los registros seleccionados?</span>}
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
export default Modulos;
