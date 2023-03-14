import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { ModuloService } from '../../demo/service/ModuloService';
import { autenticacionRequerida } from '../../utils/AutenticacionRequerida';
import { useSession } from 'next-auth/react'

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

    const listarModulos = () => {
        const moduloService = new ModuloService();
        moduloService.getModulos().then(data => setModulos(data));
    };

    useEffect(() => {
        listarModulos();
    }, []);

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


    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                    <Button label="Eliminar" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedModulos || !selectedModulos.length} />
                </div>
            </React.Fragment>
        )
    }

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button type="button" icon="pi pi-file" onClick={() => exportCSV(false)} className="mr-2" tooltip="CSV" tooltipOptions={{ position: 'bottom' }} />
                <Button type="button" icon="pi pi-file-excel" onClick={exportExcel} className="p-button-success mr-2" tooltip="XLSX" tooltipOptions={{ position: 'bottom' }} />
                <Button type="button" icon="pi pi-file-pdf" onClick={exportPdf} className="p-button-warning mr-2" tooltip="PDF" tooltipOptions={{ position: 'bottom' }} />
            </React.Fragment>
        )
    }

    const idBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">ID Modulo</span>
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
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editModulo(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning mt-2" onClick={() => confirmDeleteModulo(rowData)} />
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
            <h5 className="m-0">Listado de Modulos</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => filter(e)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const moduloDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" className="p-button-text" onClick={saveModulo} />
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

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={modulos}
                        selection={selectedModulos}
                        onSelectionChange={(e) => setSelectedModulos(e.value)}
                        dataKey="idModulo"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} modulos"
                        globalFilter={globalFilter}
                        emptyMessage="No se encontraron modulos."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                        <Column field="idModulo" header="ID" sortable body={idBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="nombre" header="Nombre" sortable body={nombreBodyTemplate} headerStyle={{ width: '14%', minWidth: '20rem' }}></Column>
                        <Column header="Acciones" body={actionBodyTemplate}></Column>
                    </DataTable>

                    <Dialog visible={moduloDialog} style={{ width: '450px' }} header="Registro de Modulos" modal className="p-fluid" footer={moduloDialogFooter} onHide={hideDialog}>
                       
                        <div className="field">
                            <label htmlFor="nombre">Nombre</label>
                            <InputText id="nombre" value={modulo.nombre} onChange={(e) => onInputChange(e, 'nombre')} required autoFocus className={classNames({ 'p-invalid': submitted && !modulo.nombre })} />
                            {submitted && !modulo.nombre && <small className="p-invalid">Nombre es requerido.</small>}
                        </div>
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
};
export async function getServerSideProps({ req }) {
    return autenticacionRequerida(req, ({ session }) => {
        return {
            props: { session }
        }
    })
}
export default Modulos;
