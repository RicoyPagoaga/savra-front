import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { InputTextarea } from 'primereact/inputtextarea';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { TipoEntregaService } from '../../demo/service/TipoEntregaService';
import { autenticacionRequerida } from '../../utils/AutenticacionRequerida';
import { useSession } from 'next-auth/react'
import { AccionService } from '../../demo/service/AccionService';

const tipos_entrega = () => {
    let tipoEntregaVacia = {
        idTipoEntrega: null,
        nombre: '',
        descripcion: '',
    };

    const [tipos, setTipos] = useState([]);
    const [tipoDialog, setTipoDialog] = useState(false);
    const [deleteTipoDialog, setDeleteTipoDialog] = useState(false);
    const [deleteTiposDialog, setDeleteTiposDialog] = useState(false);
    const [tipo, setTipo] = useState(tipoEntregaVacia);
    const [selectedTipos, setSelectedTipos] = useState(null);
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

    const listarTipos = () => {
        const tipoService = new TipoEntregaService();
        tipoService.getTiposEntrega().then(data => setTipos(data));
    };

    let obtenerRol = () => {
        var info = session.user.email.split('/');
        return info[4]
    }
    const listarPermisos = () => {
        const accionService = new AccionService();
        accionService.getAccionesModuloRol(obtenerRol(), 'Tipos de Entrega').then(data => {setPermisos(data) , setCargando(false) });
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
        listarTipos();
        listarPermisos();
        permisosDisponibles();
    }, []);

    useEffect(() => {
        permisosDisponibles();
    }, [cargando]);

    const openNew = () => {
        setTipo(tipoEntregaVacia);
        setSubmitted(false);
        setTipoDialog(true);
    }

    const hideDialog = () => {
        setSubmitted(false);
        setTipoDialog(false);
    }

    const hideDeleteTipoDialog = () => {
        setDeleteTipoDialog(false);
    }

    const hideDeleteTiposDialog = () => {
        setDeleteTiposDialog(false);
    }

    const pasoRegistro = () => {
        listarTipos();
        setTipoDialog(false);
        setTipo(tipoEntregaVacia); 
    }

    const saveTipo = async () => {
        setSubmitted(true);
        if (tipo.idTipoEntrega) {
            try {
                const tipoService = new TipoEntregaService();
                await tipoService.updateTipoEntrega(tipo);
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Tipo de Entrega Actualizada', life: 3000 });
                pasoRegistro();
            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });
            }
        }
        else {
            try {
                const tipoService = new TipoEntregaService();
                await tipoService.addTipoEntrega(tipo);
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Tipo de Entrega Creada', life: 3000 });
                pasoRegistro();
            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });                    
            }
        }   
        
    }

    const editTipo = (tipo) => {
        setTipo({ ...tipo});
        setTipoDialog(true);
    }

    const confirmDeleteTipo = (tipo) => {
        setTipo(tipo);
        setDeleteTipoDialog(true);
    }

    const deleteTipo = async () => {
        try {
            const tipoService = new TipoEntregaService();
            await tipoService.removeTipoEntrega(tipo.idTipoEntrega);
            listarTipos();
            setDeleteTipoDialog(false);
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Tipo de Entrega Eliminada', life: 3000 });
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error, life: 3000 });  
        }
    }

    const cols = [
        { field: 'idTipoEntrega', header: 'ID' },
        { field: 'nombre', header: 'Tipo de Entrega' },
        { field: 'descripcion', header: 'Descripción' }
       
    ];
    

    const exportColumns = cols.map(col => ({ title: col.header, dataKey: col.field }));

    const exportCSV = (selectionOnly) => {
        dt.current.exportCSV({ selectionOnly });
    };
    const exportPdf = () => {
        import('jspdf').then((jsPDF) => {
            import('jspdf-autotable').then(() => {
                const doc = new jsPDF.default(0, 0);
                //const doc = new jsPDF.default('portrait');
                var image = new Image();
                var fontSize = doc.internal.getFontSize();
                const docWidth = doc.internal.pageSize.getWidth();
                const docHeight = doc.internal.pageSize.getHeight();
                const txtWidth = doc.getStringUnitWidth('TIPOS DE ENTREGAS') * fontSize / doc.internal.scaleFactor;
                const x = (docWidth - txtWidth) / 2;
                image.src = '../layout/images/img_facturalogo2.png';
                doc.addImage(image, 'PNG', 10, 0, 50, 30);
                //centrar texto:
                doc.text('TIPOS DE ENTREGAS', x, 15);
                doc.setFontSize(12);
                doc.text(15, 30, 'Usuario: ' + session.user.name);
                doc.text(15, 36, 'Fecha: ' + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString());
                doc.text(docWidth - 15, 30, 'Total Tipos de Entregas: ' + tipos.length, { align: "right" });
                doc.line(15, 40, docWidth - 15, 40);
                doc.autoTable(exportColumns, tipos, { margin: { top: 45, bottom: 25 } });
                const pageCount = doc.internal.getNumberOfPages();
                for (var i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    doc.line(15, docHeight - 20, docWidth - 15, docHeight - 20);
                    doc.text('Página ' + String(i) + '/' + pageCount, docWidth - 15, docHeight - 10, { align: "right" });
                }
                doc.save('Reporte_Tipos de Entrega.pdf');
            });
        });
    };

    const exportExcel = () => {
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(tipos);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array'
            });

            saveAsExcelFile(excelBuffer, 'Reporte_Tipos de Entrega');
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
        setDeleteTiposDialog(true);
    }


    const deleteSelectedTipos = async () => {
        let x = ' ';
        const tipoService = new TipoEntregaService();
        selectedTipos.map(async (tipo) => {
            try {
                await tipoService.removeTipoEntrega(tipo.idTipoEntrega);
            } catch (error) {
                x = x + 'error'; 
                toast.current.show({ severity: 'error', summary: 'Error', detail: error + ` ${tipo.nombre}`, life: 3000 }); 
            }
        });
        if (x == '') {
            let _tipos = tipos.filter((val) => !selectedTipos.includes(val));
            setTipos(_tipos);
            setDeleteTiposDialog(false);
            setSelectedTipos(null);
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Tipos de Entrega Eliminadas', life: 3000 });
        }
    }


    const onInputChange = (e, nombre) => {
        const val = (e.target && e.target.value) || '';
        let _tipo = { ...tipo };
        _tipo[`${nombre}`] = val;

        setTipo(_tipo);
    }


    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    {agregar?<Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />:null}
                    {eliminar?<Button label="Eliminar" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedTipos || !selectedTipos.length} />:null}                    
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
                {rowData.idTipoEntrega}
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

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                {actualizar?<Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editTipo(rowData)} />:null}
                {eliminar?<Button icon="pi pi-trash" className="p-button-rounded p-button-warning mt-2" onClick={() => confirmDeleteTipo(rowData)} />:null}                   
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
            <h5 className="m-0">Listado de Tipos de Entrega</h5>
            {buscar?<span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => filter(e)} placeholder="Buscar..." />
            </span>:null}
        </div>
    );

    const tipoDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" className="p-button-text" onClick={saveTipo}/>
        </>
    );
    const deleteTipoDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteTipoDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteTipo} />
        </>
    );
    const deleteTiposDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteTipoDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedTipos} />
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
                            value={tipos}
                            selection={selectedTipos}
                            onSelectionChange={(e) => setSelectedTipos(e.value)}
                            dataKey="idTipoEntrega"
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25]}
                            className="datatable-responsive"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} tipos de entrega" 
                            globalFilter={globalFilter}
                            emptyMessage="No se encontraron tipos de entrega."
                            header={header}
                            responsiveLayout="scroll"
                        >
                            <Column selectionMode="multiple" headerStyle={{ width: '3rem'}}></Column>
                            <Column field="idTipoEntrega" header="Código" sortable body={idBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                            <Column field="nombre" header="Nombre" sortable body={nombreBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                            <Column field="descripcion" header="Descripción" sortable body={descripcionBodyTemplate} headerStyle={{ width: '40%', minWidth: '10rem' }}></Column>
                            <Column header="Acciones" body={actionBodyTemplate}></Column>
                        </DataTable>:null}
                    
                        <Dialog visible={tipoDialog} style={{ width: '450px' }} header="Registro Tipos de Entrega" modal className="p-fluid" footer={tipoDialogFooter} onHide={hideDialog}>
                            <div className="field">
                                <label htmlFor="nombre">Nombre</label>
                                <InputText id="nombre" value={tipo.nombre} onChange={(e) => onInputChange(e, 'nombre')} tooltip="Debe ingresar más de tres caracteres"
                                className={classNames({ 'p-invalid': submitted && !tipo.nombre })} />
                                { submitted && !tipo.nombre && <small className="p-invalid">Nombre es requerido.</small> }
                            </div>
                            <div className="field">
                                <label htmlFor="descripcion">Descripción</label>
                                <InputTextarea id="descripcion" value={tipo.descripcion} onChange={(e) => onInputChange(e, 'descripcion')} tooltip="Debe ingresar más de cinco caracteres"
                                className={classNames({ 'p-invalid': submitted && !tipo.descripcion })} />
                                { submitted && !tipo.descripcion && <small className="p-invalid">La descripción es requerida.</small> }
                            </div>
                        </Dialog> 
    
                        <Dialog visible={deleteTipoDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteTipoDialogFooter} onHide={hideDeleteTipoDialog}>
                            <div className="flex align-items-center justify-content-center">
                                <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                                {tipo && <span>¿Está seguro de que desea eliminar a <b>{tipo.nombre}</b>?</span>}
                            </div>
                        </Dialog>
    
                        <Dialog visible={deleteTiposDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteTiposDialogFooter} onHide={hideDeleteTiposDialog}>
                            <div className="flex align-items-center justify-content-center">
                                <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                                {tipo && <span>¿Está seguro de que desea eliminar los registros seleccionados?</span>}
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
export async function getServerSideProps({req}){
    return autenticacionRequerida(req,({session}) =>
    {
        return{
            props:{session}
        }
    })
}
export default tipos_entrega;
