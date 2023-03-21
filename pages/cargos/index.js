import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { CargoService } from '../../demo/service/CargoService';
import { InputNumber } from 'primereact/inputnumber';
import { autenticacionRequerida } from '../../utils/AutenticacionRequerida';
import { useSession } from 'next-auth/react'
import { AccionService } from '../../demo/service/AccionService';

const Cargos = () => {
    let cargoVacio = {
        idCargo: null,
        nombre: '',
        salarioBase: null,
        descripcion: ''
    };

    let emptyRestApiError = {
        httpStatus: '',
        errorMessage: '',
        errorDetails: ''
    };

    const [cargos, setCargos] = useState(null);
    const [cargoDialog, setCargoDialog] = useState(false);
    const [deleteCargoDialog, setDeleteCargoDialog] = useState(false);
    const [deleteCargosDialog, setDeleteCargosDialog] = useState(false);
    const [cargo, setCargo] = useState(cargoVacio);
    const [apiError, setApiError] = useState(emptyRestApiError);
    const [selectedCargos, setSelectedCargos] = useState(null);
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

    let obtenerRol = () => {
        var info = session.user.email.split('/');
        return info[4]
    }
    
    const listarPermisos = () => {
        const accionService = new AccionService();
        accionService.getAccionesModuloRol(obtenerRol(),'Arqueos').then(data => {setPermisos(data) , setCargando(false) });
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

    const listarCargos = () => {
        const cargoService = new CargoService();
        cargoService.getCargos().then(data => setCargos(data));
    };

    useEffect(() => {
        listarCargos();
        permisosDisponibles();
        listarPermisos();
    }, []);

    useEffect(() => {
        permisosDisponibles();
    }, [cargando]);

    const openNew = () => {
        setCargo(cargoVacio);
        setSubmitted(false);
        setCargoDialog(true);
    }

    const hideDialog = () => {
        setSubmitted(false);
        setCargoDialog(false);
    }

    const hideDeleteCargoDialog = () => {
        setDeleteCargoDialog(false);
    }

    const hideDeleteCargosDialog = () => {
        setDeleteCargosDialog(false);
    }

    const pasoRegistro = () => {
        listarCargos();
        setCargoDialog(false);
        setCargo(cargoVacio);
    }

    const saveCargo = async () => {
        setSubmitted(true);
        if (cargo.idCargo) {
            try {
                const cargoService = new CargoService();
                await cargoService.updateCargo(cargo);
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Cargo Actualizado (^‿^)', life: 3000 });
                pasoRegistro();
            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });
            }
        }
        else {
            try {
                const cargoService = new CargoService();
                await cargoService.addCargo(cargo);
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Cargo Registrado (^‿^)', life: 3000 });
                pasoRegistro();
            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });

            }
        }
    }

    const editCargo = (cargo) => {
        setCargo({ ...cargo });
        setCargoDialog(true);
    }

    const confirmDeleteCargo = (cargo) => {
        setCargo(cargo);
        setDeleteCargoDialog(true);
    }

    const deleteCargo = async () => {
        try {
            const cargoService = new CargoService();
            await cargoService.removeCargo(cargo.idCargo);
            listarCargos();
            setDeleteCargoDialog(false);
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Cargo Eliminado', life: 3000 });
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        }
    }

    // const exportCSV = () => {
    //     dt.current.exportCSV();
    // };
    const cols = [
        { field: 'idCargo', header: 'ID' },
        { field: 'nombre', header: 'Nombre' },
        { field: 'descripcion', header: 'Descripción' },
        { field: 'salarioBase', header: 'Salario Base' }
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
                const txtWidth = doc.getStringUnitWidth('CARGOS LABORALES') * fontSize / doc.internal.scaleFactor;
                const x = (docWidth - txtWidth) / 2;
                image.src = '../layout/images/img_facturalogo2.png';
                doc.addImage(image, 'PNG', 10, 0, 50, 30);
                //centrar texto:
                doc.text('CARGOS LABORALES', x, 15);
                doc.setFontSize(12);
                doc.text(15, 30, 'Usuario: ' + session.user.name);
                doc.text(15, 36, 'Fecha: ' + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString());
                doc.text(docWidth - 15, 30, 'Total Cargos: ' + cargos.length, { align: "right" });
                doc.line(15, 40, docWidth - 15, 40);
                doc.autoTable(exportColumns, cargos, { margin: { top: 45, bottom: 25 } });
                const pageCount = doc.internal.getNumberOfPages();
                for (var i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    doc.line(15, docHeight - 20, docWidth - 15, docHeight - 20);
                    doc.text('Página ' + String(i) + '/' + pageCount, docWidth - 15, docHeight - 10, { align: "right" });
                }
                doc.save('Reporte_Cargos.pdf');
            });
        });
    };


    const exportExcel = () => {
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(cargos);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array'
            });

            saveAsExcelFile(excelBuffer, 'Reporte_Cargos');
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
        setDeleteCargosDialog(true);
    }


    const deleteSelectedCargos = async () => {
        const cargoService = new CargoService();
        selectedCargos.map(async (cargo) => {
            await cargoService.removeCargo(cargo.idCargo);
        });
        let _cargos = cargos.filter((val) => !selectedCargos.includes(val));
        setCargos(_cargos);
        setDeleteCargosDialog(false);
        setSelectedCargos(null);
        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Cargos Eliminados ', life: 3000 });
    }

    const onInputChange = (e, nombre) => {
        const val = (e.target && e.target.value) || '';
        let _cargo = { ...cargo };
        _cargo[`${nombre}`] = val;

        setCargo(_cargo);
    }


    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    {agregar? <Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />:null}
                    {eliminar?<Button label="Eliminar" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedCargos || !selectedCargos.length} />:null}
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
                <span className="p-column-title">ID Cargo</span>
                {rowData.idCargo}
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
    const salarioBaseBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Salario Base</span>
                L. {rowData.salarioBase}
            </>
        );
    }
    const descripcionBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">descripcion</span>
                {rowData.descripcion}
            </>
        );
    }


    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                {actualizar?
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editCargo(rowData)} />:null}
                {eliminar?
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning mt-2" onClick={() => confirmDeleteCargo(rowData)} />:null}
            </div>
        );
    }

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Listado de Cargos</h5>
            {buscar? 
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
            </span>:null}
           
        </div>
    );

    const cargoDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" className="p-button-text" onClick={saveCargo} />
        </>
    );
    const deleteCargoDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteCargoDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteCargo} />
        </>
    );
    const deleteCargosDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteCargosDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedCargos} />
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
                            value={cargos}
                            selection={selectedCargos}
                            onSelectionChange={(e) => setSelectedCargos(e.value)}
                            dataKey="idCargo"
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25]}
                            className="datatable-responsive"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Cargos"
                            globalFilter={globalFilter}
                            emptyMessage="No se encontraron Cargos."
                            header={header}
                            responsiveLayout="scroll"
                        >
                            <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                            <Column field="idCargo" header="ID" sortable body={idBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                            <Column field="nombre" header="Nombre" sortable body={nombreBodyTemplate} headerStyle={{ width: '14%', minWidth: '20rem' }}></Column>
                            <Column field="descripcion" header="Descripción" sortable body={descripcionBodyTemplate} headerStyle={{ width: '14%', minWidth: '20rem' }}></Column>
                            <Column field="salarioBase" header="Salario Base" sortable body={salarioBaseBodyTemplate} headerStyle={{ width: '14%', minWidth: '20rem' }}></Column>
                            <Column header="Acciones" body={actionBodyTemplate}></Column>
                        </DataTable>:null}
                        
    
                        <Dialog visible={cargoDialog} style={{ width: '450px' }} header="Registro de Cargos" modal className="p-fluid" footer={cargoDialogFooter} onHide={hideDialog}>
                            <div className="field">
                                <label htmlFor="nombre">Nombre</label>
                                <InputText id="nombre" value={cargo.nombre} onChange={(e) => onInputChange(e, 'nombre')} required autoFocus className={classNames({ 'p-invalid': submitted && !cargo.nombre })} tooltip="Ingrese un nombre de cargo 🖊️📋" />
                                {submitted && !cargo.nombre && <small className="p-invalid">Nombre cargo es requerido.</small>}
                            </div>
                            <div className="field">
                                <label htmlFor="salarioBase">Salario Base</label>
                                <InputNumber id="salarioBase" value={cargo.salarioBase} onValueChange={(e) => onInputChange(e, 'salarioBase')} mode='currency' currency='HNL' locale='en-US' max={150000} className={classNames({ 'p-invalid': submitted && !cargo.salarioBase })} tooltip="Ingrese un salario en números, no debe ser mayor de L. 150,000.00 🖊️📋" />
                                {submitted && !cargo.salarioBase && <small className="p-invalid">El salario base es requerido, no debe ser menor o igual a cero.</small>}
                            </div>
    
                            <div className="field">
                                <label htmlFor="descripcion">Descripción</label>
                                <InputText id="descripcion" value={cargo.descripcion} onChange={(e) => onInputChange(e, 'descripcion')} className={classNames({ 'p-invalid': submitted && !cargo.descripcion })} tooltip="Ingrese una descripción relacionada al cargo 🖊️📋" />
                                {submitted && !cargo.descripcion && <small className="p-invalid">Descripcion cargo es requerido.</small>}
                            </div>
                        </Dialog>
    
                        <Dialog visible={deleteCargoDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteCargoDialogFooter} onHide={hideDeleteCargoDialog}>
                            <div className="flex align-items-center justify-content-center">
                                <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                                {cargo && <span>¿Está seguro de que desea eliminar a <b>{cargo.nombre}</b>?</span>}
                            </div>
                        </Dialog>
    
                        <Dialog visible={deleteCargosDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteCargosDialogFooter} onHide={hideDeleteCargosDialog}>
                            <div className="flex align-items-center justify-content-center">
                                <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                                {cargo && <span>¿Está seguro de que desea eliminar los registros seleccionados?</span>}
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
export default Cargos;