import getConfig from 'next/config';
import { PickList } from 'primereact/picklist';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { RolService } from '../../demo/service/RolService';
import { ModuloAccionService } from '../../demo/service/ModuloAccionService';
import { PermisoRolService } from '../../demo/service/PermisoRolService';
import { autenticacionRequerida } from '../../utils/AutenticacionRequerida';
import { useSession } from 'next-auth/react';
import { AccionService } from '../../demo/service/AccionService';

const Rols = () => {
    let rolVacio = {
        idRol: null,
        nombre: '',
        descripcion: ''
    };

    const [rols, setRols] = useState();
    const [rolDialog, setRolDialog] = useState(false);
    const [deleteRolDialog, setDeleteRolDialog] = useState(false);
    const [deleteRolsDialog, setDeleteRolsDialog] = useState(false);
    const [rol, setRol] = useState(rolVacio);
    const [selectedRols, setSelectedRols] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const { data: session } = useSession();

    //permisos rol, pick list
    const [permisos_rolDialog, setPermisos_rolDialog] = useState(false);
    const [header_, setHeader_] = useState(null);
    const [modulosAccion, setModulosAccion] = useState([]);
    const [permisosRol, setPermisosRol] = useState([]);
    const [listaPickList, setListaPickList] = useState([]);
    const [target, setTarget] = useState([]);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;
    const [allExpanded, setAllExpanded] = useState(false);
    const [expandedRows, setExpandedRows] = useState([]);
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

    const onChange = (event) => {
        setListaPickList(event.source);
        setTarget(event.target);
    }

    const listarRols = () => {
        const rolService = new RolService();
        rolService.getRols().then(data => setRols(data));
    };

    const listarModuloAcciones = () => {
        const moduloAccionesService = new ModuloAccionService();
        moduloAccionesService.getModulosAccion().then(data => setModulosAccion(data));
    };

    const listarPermisosRol = () => {
        const permisoRolService = new PermisoRolService();
        permisoRolService.getPermisosRol().then(data => setPermisosRol(data));
    };
    let obtenerRol = () => {
        var info = session.user.email.split('/');
        return info[4]
    }
    const listarPermisos = () => {
        const accionService = new AccionService();
        accionService.getAccionesModuloRol(obtenerRol(), 'Roles').then(data => { setPermisos(data), setCargando(false) });
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
        listarRols();
        listarModuloAcciones();
        listarPermisosRol();
        listarPermisos();
        permisosDisponibles();
    }, []);

    useEffect(() => {
        permisosDisponibles();
    }, [cargando]);

    const openNew = () => {
        setRol(rolVacio);
        setSubmitted(false);
        setRolDialog(true);
    }

    const hideDialog = () => {
        setSubmitted(false);
        setRolDialog(false);
    }

    const hideDeleteRolDialog = () => {
        setDeleteRolDialog(false);
    }

    const hideDeleteRolsDialog = () => {
        setDeleteRolsDialog(false);
    }

    const pasoRegistro = () => {
        listarRols();
        setRolDialog(false);
        setRol(rolVacio);
    }

    const saveRol = async () => {
        setSubmitted(true);
        if (rol.nombre.trim()) {
            if (rol.idRol) {
                try {
                    const rolService = new RolService();
                    await rolService.updateRol(rol);
                    toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Rol Actualizado (^‿^)', life: 3000 });
                    pasoRegistro();
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });
                }
            }
            else {
                try {
                    const rolService = new RolService();
                    await rolService.addRol(rol);
                    toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Rol Creado (^‿^)', life: 3000 });
                    pasoRegistro();
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });

                }
            }
        }

    }

    const editRol = (rol) => {
        setRol({ ...rol });
        setRolDialog(true);
    }

    const listarPickList = (rol) => {
        let picklist = [];
        let target_ = [];
        permisosRol.map((permiso) => {
            modulosAccion.map((item) => {
                if (permiso.rol.idRol === rol.idRol) {
                    if (item.idModuloAccion === permiso.moduloAccion.idModuloAccion) {
                        target_.push(item);
                    }
                }
            });
        });

        if (target_.length) {
            picklist = modulosAccion.filter((val) => !target_.includes(val));
        } else {
            picklist = [...modulosAccion];
        }

        setListaPickList(picklist);
        setTarget(target_);
    }

    const permisoRol = (rol) => {
        setRol({ ...rol });
        setHeader_("Agregar Permisos al Rol: " + rol.nombre);
        setPermisos_rolDialog(true);
        listarPickList(rol);
    }

    const hidePermisoRolDialog = () => {
        setPermisos_rolDialog(false);
    }

    const guardarCambiosPermisosRol = async () => {
        if (rol.idRol) {
            try {
                //guardar
                let modulos_accion = [];
                permisosRol.map((permiso) => {
                    modulosAccion.map((item) => {
                        if (permiso.rol.idRol === rol.idRol) {
                            if (permiso.moduloAccion.idModuloAccion === item.idModuloAccion) {
                                modulos_accion.push(item);
                            }
                        }
                    });
                });
                let lista_agregar = target.filter((val) => !modulos_accion.includes(val));
                let permisosAgregar = [];
                lista_agregar.map((item) => {
                    let permisoRol = {
                        idModuloAccion: item.idModuloAccion,
                        idRol: rol.idRol,
                        moduloAccion: item,
                        rol: rol
                    }
                    permisosAgregar.push(permisoRol);
                });
                const permisoRolService = new PermisoRolService();
                await permisoRolService.addPermisosRol(permisosAgregar);

                //eliminar
                let lista_ = listaPickList.filter((val) => modulos_accion.includes(val));
                permisosRol.map(async (item) => {
                    lista_.map(async (permiso) => {
                        if (item.rol.idRol === rol.idRol) {
                            if (item.moduloAccion.idModuloAccion === permiso.idModuloAccion) {
                                await permisoRolService.removePermisoRol(permiso.idModuloAccion, rol.idRol);
                            }
                        }
                    });
                });

                //refrescar cambios
                let cambios = await permisoRolService.getPermisosRol();
                setPermisosRol(cambios);
                setPermisos_rolDialog(false);

                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Los Cambios Han Sido Guardados', life: 3000 });
            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });
            }
        }
    }

    const confirmDeleteRol = (rol) => {
        setRol(rol);
        setDeleteRolDialog(true);
    }

    const deleteRol = async () => {
        try {
            const rolService = new RolService();
            await rolService.removeRol(rol.idRol);
            listarRols();
            setDeleteRolDialog(false);
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Tipo Documento Eliminado 🚨', life: 3000 });

        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        }

    }

    const cols = [
        { field: 'idRol', header: 'ID' },
        { field: 'nombre', header: 'Nombre' },
        { field: 'descripcion', header: 'Descripción' }
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
                const txtWidth = doc.getStringUnitWidth('ROLES') * fontSize / doc.internal.scaleFactor;
                const x = (docWidth - txtWidth) / 2;
                image.src = '../layout/images/img_facturalogo2.png';
                doc.addImage(image, 'PNG', 10, 0, 50, 30);
                //centrar texto:
                doc.text('ROLES', x, 15);
                doc.setFontSize(12);
                doc.text(15, 30, 'Usuario: ' + session.user.name);
                doc.text(15, 36, 'Fecha: ' + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString());
                doc.text(docWidth - 15, 30, 'Total Roles: ' + rols.length, { align: "right" });
                doc.line(15, 40, docWidth - 15, 40);
                doc.autoTable(exportColumns, rols, { margin: { top: 45, bottom: 25 } });
                const pageCount = doc.internal.getNumberOfPages();
                for (var i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    doc.line(15, docHeight - 20, docWidth - 15, docHeight - 20);
                    doc.text('Página ' + String(i) + '/' + pageCount, docWidth - 15, docHeight - 10, { align: "right" });
                }
                doc.save('Reporte_Roles.pdf');
            });
        });
    };


    const exportExcel = () => {
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(rols);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array'
            });

            saveAsExcelFile(excelBuffer, 'Reporte_Roles');
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
        setDeleteRolsDialog(true);
    }


    const deleteSelectedRols = async () => {
        const rolService = new RolService();
        selectedRols.map(async (rol) => {
            await rolService.removeRol(rol.idRol);
        });
        let _rols = rols.filter((val) => !selectedRols.includes(val));
        setRols(_rols);
        setDeleteRolsDialog(false);
        setSelectedRols(null);
        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Roles Eliminados 🚨', life: 3000 });
    }


    const onInputChange = (e, nombre) => {
        const val = (e.target && e.target.value) || '';
        let _rol = { ...rol };
        _rol[`${nombre}`] = val;

        setRol(_rol);
    }

    const toggleAll = () => {
        if (allExpanded) collapseAll();
        else expandAll();
    };

    const expandAll = () => {
        let _expandedRows = {};
        rols.forEach((p) => (_expandedRows[`${p.idRol}`] = true));

        setExpandedRows(_expandedRows);
        setAllExpanded(true);
        console.log(permisosRol);
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
                        disabled={!rols || !rols.length} /> : null}
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
                <span className="p-column-title">ID Rol</span>
                {rowData.idRol}
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
                <span className="p-column-title">Descripcion</span>
                {rowData.descripcion}
            </>
        );
    }

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                {actualizar ? <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editRol(rowData)} /> : null}
                {asignar ? <Button icon="pi pi-plus" className="p-button-rounded p-button-primary mr-2" onClick={() => permisoRol(rowData)} /> : null}
                {eliminar ? <Button icon="pi pi-trash" className="p-button-rounded p-button-warning mt-2" onClick={() => confirmDeleteRol(rowData)} /> : null}
            </div>
        );
    }

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Roles</h5>
            {buscar?<span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
            </span>:null}
        </div>
    );

    const rolDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" className="p-button-text" onClick={saveRol} />
        </>
    );
    const permisoRolDialogFooter = (
        <>
            <Button label="Guardar cambios" icon="pi pi-check" className="p-button-text" onClick={guardarCambiosPermisosRol} />
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hidePermisoRolDialog} />
        </>
    );
    const deleteRolDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteRolDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteRol} />
        </>
    );
    const deleteRolsDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteRolsDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedRols} />
        </>
    );

    const rowExpansionTemplate = (data) => {
        let table = [];
        permisosRol.map((item) => {
            if (item.rol.idRol === data.idRol) {
                table.push(item);
            }
        });
        return (
            <div className="orders-subtable">
                <h5>Permisos del Rol: {data.nombre}</h5>
                <DataTable value={table}
                    editMode="cell"
                    className="editable-cells-table"
                    responsiveLayout="scroll"
                    emptyMessage="No se encontraron permisos del rol.">
                    <Column field="moduloAccion.idModuloAccion" header="ID Permiso" sortable headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                    <Column field="moduloAccion.modulo.nombre" header="Módulo" sortable headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                    <Column field="moduloAccion.accion.idAccion" header="ID Acción" sortable headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                    <Column field="moduloAccion.accion.nombre" header="Acción" sortable headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                </DataTable>
            </div>
        );
    };

    //PickList
    const itemTemplate = (item) => {
        const templateClass = classNames({
            'pi pi-plus text-sm': item.accion.nombre === "Registrar",
            'pi pi-pencil text-sm': item.accion.nombre === "Actualizar",
            'pi pi-trash text-sm': item.accion.nombre === "Eliminar",
            'pi pi-file text-sm': item.accion.nombre === "Exportar CSV",
            'pi pi-file-excel text-sm': item.accion.nombre === "Exportar Excel",
            'pi pi-file-pdf text-sm': item.accion.nombre === "Exportar PDF"
        });
        return (
            <div className="flex flex-wrap p-2 align-items-center gap-3">
                <img src={`${contextPath}/demo/images/picklist/configurar_icono.png`} className="w-4rem shadow-2 flex-shrink-0 border-round" />
                <div className="flex-1 flex flex-column gap-2">
                    <span className="font-bold">{item.modulo.nombre}</span>
                    <div className="flex align-items-center gap-2">
                        <i className={templateClass}></i>
                        <span>{item.accion.nombre}</span>
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
                            value={rols}
                            paginator
                            rows={10}
                            dataKey="idRol"
                            rowsPerPageOptions={[5, 10, 25]}
                            className="datatable-responsive"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Tipo Documentos"
                            globalFilter={globalFilter}
                            emptyMessage="No se encontraron roles."
                            header={header}
                            responsiveLayout="scroll"
                            expandedRows={expandedRows}
                            onRowToggle={(e) => setExpandedRows(e.data)}
                            rowExpansionTemplate={rowExpansionTemplate}
                        >
                            <Column expander style={{ width: '3em' }}></Column>
                            <Column field="idRol" header="ID" sortable body={idBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                            <Column field="nombre" header="Nombre" sortable body={nombreBodyTemplate} headerStyle={{ width: '14%', minWidth: '20rem' }}></Column>
                            <Column field="descripcion" header="Descripción" sortable body={descripcionBodyTemplate} headerStyle={{ width: '14%', minWidth: '20rem' }}></Column>
                            <Column header="Acciones" body={actionBodyTemplate}></Column>
                        </DataTable>:null}
                        
                        <Dialog visible={rolDialog} style={{ width: '450px' }} header="Registro de Roles" modal className="p-fluid" footer={rolDialogFooter} onHide={hideDialog}>
                            <div className="field">
                                <label htmlFor="nombre">Nombre</label>
                                <InputText id="nombre" value={rol.nombre} onChange={(e) => onInputChange(e, 'nombre')} required autoFocus className={classNames({ 'p-invalid': submitted && !rol.nombre })} tooltip="Ingrese un nombre de rol" />
                                {submitted && !rol.nombre && <small className="p-invalid">Nombre rol es requerido.</small>}
                            </div>
                            <div className="field">
                                <label htmlFor="descripcion">Descripción</label>
                                <InputText id="descripcion" value={rol.descripcion} onChange={(e) => onInputChange(e, 'descripcion')} required autoFocus className={classNames({ 'p-invalid': submitted && !rol.descripcion })} tooltip="Ingrese una descripción relacionada al rol" />
                                {submitted && !rol.descripcion && <small className="p-invalid">Nombre rol es requerido.</small>}
                            </div>
                        </Dialog>
    
                        <Dialog visible={permisos_rolDialog} style={{ width: '950px' }} header={header_} modal className="p-fluid" footer={permisoRolDialogFooter} onHide={hidePermisoRolDialog}>
    
                            <PickList source={listaPickList} target={target} onChange={onChange} itemTemplate={itemTemplate} filterBy="idModuloAccion" breakpoint="1400px"
                                sourceHeader="Disponibles" targetHeader="Seleccionados" sourceStyle={{ height: '30rem' }} targetStyle={{ height: '30rem' }}
                                sourceFilterPlaceholder="Buscar por ID" targetFilterPlaceholder="Buscar por ID" />
    
                        </Dialog>
    
                        <Dialog visible={deleteRolDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteRolDialogFooter} onHide={hideDeleteRolDialog}>
                            <div className="flex align-items-center justify-content-center">
                                <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                                {rol && <span>¿Está seguro de que desea eliminar a <b>{rol.nombre}</b>?</span>}
                            </div>
                        </Dialog>
    
                        <Dialog visible={deleteRolsDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteRolsDialogFooter} onHide={hideDeleteRolsDialog}>
                            <div className="flex align-items-center justify-content-center">
                                <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                                {rol && <span>¿Está seguro de que desea eliminar los registros seleccionados?</span>}
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
export default Rols;
