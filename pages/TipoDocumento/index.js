import { Canvas } from '@react-pdf/renderer';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { TipoDocumentoService } from '../../demo/service/TipoDocumentoService';
import { autenticacionRequerida } from '../../utils/AutenticacionRequerida';
import { useSession } from 'next-auth/react'

const TipoDocumentos = () => {
    let tipoDocumentoVacio = {
        idTipoDocumento: null,
        nombreDocumento: ''
    };

    const [tipoDocumentos, setTipoDocumentos] = useState([]);
    const [tipoDocumentoDialog, setTipoDocumentoDialog] = useState(false);
    const [deleteTipoDocumentoDialog, setDeleteTipoDocumentoDialog] = useState(false);
    const [deleteTipoDocumentosDialog, setDeleteTipoDocumentosDialog] = useState(false);
    const [tipoDocumento, setTipoDocumento] = useState(tipoDocumentoVacio);
    const [selectedTipoDocumentos, setSelectedTipoDocumentos] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const { data: session } = useSession();


    const listarTipoDocumentos = () => {
        const tipoDocumentoService = new TipoDocumentoService();
        tipoDocumentoService.getTipoDocumentos().then(data => setTipoDocumentos(data));
    };

    useEffect(() => {
        listarTipoDocumentos();
    }, []);

    const openNew = () => {
        setTipoDocumento(tipoDocumentoVacio);
        setSubmitted(false);
        setTipoDocumentoDialog(true);
    }

    const hideDialog = () => {
        setSubmitted(false);
        setTipoDocumentoDialog(false);
    }

    const hideDeleteTipoDocumentoDialog = () => {
        setDeleteTipoDocumentoDialog(false);
    }

    const hideDeleteTipoDocumentosDialog = () => {
        setDeleteTipoDocumentosDialog(false);
    }

    const pasoRegistro = () => {
        listarTipoDocumentos();
        setTipoDocumentoDialog(false);
        setTipoDocumento(tipoDocumentoVacio);
    }

    const saveTipoDocumento = async () => {
        setSubmitted(true);
        if (tipoDocumento.nombreDocumento.trim()) {
            if (tipoDocumento.idTipoDocumento) {
                try {
                    const tipoDocumentoService = new TipoDocumentoService();
                    await tipoDocumentoService.updateTipoDocumento(tipoDocumento);
                    toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Tipo Documento Actualizado (^‿^)', life: 3000 });
                    pasoRegistro();
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });
                }
            }
            else {
                try {
                    const tipoDocumentoService = new TipoDocumentoService();
                    await tipoDocumentoService.addTipoDocumento(tipoDocumento);
                    toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Tipo Documento Creado (^‿^)', life: 3000 });
                    pasoRegistro();
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });

                }
            }
        }

    }

    const editTipoDocumento = (tipoDocumento) => {
        setTipoDocumento({ ...tipoDocumento });
        setTipoDocumentoDialog(true);
    }

    const confirmDeleteTipoDocumento = (tipoDocumento) => {
        setTipoDocumento(tipoDocumento);
        setDeleteTipoDocumentoDialog(true);
    }

    const deleteTipoDocumento = async () => {
        try {
            const tipoDocumentoService = new TipoDocumentoService();
            await tipoDocumentoService.removeTipoDocumento(tipoDocumento.idTipoDocumento);
            listarTipoDocumentos();
            setDeleteTipoDocumentoDialog(false);
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Tipo Documento Eliminado 🚨', life: 3000 });

        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        }

    }

    const cols = [
        { field: 'idTipoDocumento', header: 'ID' },
        { field: 'nombreDocumento', header: 'Nombre del Documento' },
    ];


    const exportColumns = cols.map(col => ({ title: col.header, dataKey: col.field }));

    const exportCSV = (selectionOnly) => {
        dt.current.exportCSV({ selectionOnly });
    };

    const exportPdf = () => {
        import('jspdf').then((jsPDF) => {
            import('jspdf-autotable').then(() => {
                const doc = new jsPDF.default(0, 0);
                var image = new Image();
                var fontSize = doc.internal.getFontSize();
                const docWidth = doc.internal.pageSize.getWidth();
                const docHeight = doc.internal.pageSize.getHeight();
                const txtWidth = doc.getStringUnitWidth('TIPOS DE DOCUMENTOS')*fontSize/doc.internal.scaleFactor;
                const x = ( docWidth - txtWidth ) / 2;
                image.src = '../layout/images/img_facturalogo2.png';
                doc.addImage(image, 'PNG', 10, 0, 50, 30);
                doc.text('TIPOS DE DOCUMENTOS',x, 15);
                doc.setFontSize(12);
                doc.text(15, 30, 'Usuario: ' + session.user.name);
                doc.text(15, 36, 'Fecha: ' + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString());
                doc.text(docWidth-15, 30, 'Total Tipos: ' + tipoDocumentos.length,{align:"right"});
                doc.line(15, 40, docWidth - 15, 40);
                doc.autoTable(exportColumns, tipoDocumentos, { margin: { top: 45 ,bottom: 25} });
                const pageCount = doc.internal.getNumberOfPages();
                for (var i = 1; i <= pageCount; i++) {
                    doc.line(15, docHeight-20, docWidth - 15, docHeight-20);
                    doc.text('Página ' + String(i) + '/' + pageCount, docWidth-15, docHeight-10,{align:"right"});
                }
                doc.save('Reporte_Tipos de Documentos.pdf');
            });
        });
    };

    const exportExcel = () => {
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(tipoDocumentos);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array'
            });

            saveAsExcelFile(excelBuffer, 'Reporte_Tipos de Documentos');
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
        setDeleteTipoDocumentosDialog(true);
    }


    const deleteSelectedTipoDocumentos = async () => {
        const tipoDocumentoService = new TipoDocumentoService();
        selectedTipoDocumentos.map(async (tipoDocumento) => {
            await tipoDocumentoService.removeTipoDocumento(tipoDocumento.idTipoDocumento);
        });
        let _tipoDocumentos = tipoDocumentos.filter((val) => !selectedTipoDocumentos.includes(val));
        setTipoDocumentos(_tipoDocumentos);
        setDeleteTipoDocumentosDialog(false);
        setSelectedTipoDocumentos(null);
        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Tipo de Documentos Eliminados', life: 3000 });
    }


    const onInputChange = (e, nombre) => {
        const val = (e.target && e.target.value) || '';
        let _tipoDocumento = { ...tipoDocumento };
        _tipoDocumento[`${nombre}`] = val;

        setTipoDocumento(_tipoDocumento);
    }


    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                    <Button label="Eliminar" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedTipoDocumentos || !selectedTipoDocumentos.length} />
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
                <span className="p-column-title">ID TipoDocumento</span>
                {rowData.idTipoDocumento}
            </>
        );
    }

    const nombreBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Nombre</span>
                {rowData.nombreDocumento}
            </>
        );
    }


    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editTipoDocumento(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning mt-2" onClick={() => confirmDeleteTipoDocumento(rowData)} />
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
            <h5 className="m-0">Tipos de Documentos</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => filter(e)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const tipoDocumentoDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" className="p-button-text" onClick={saveTipoDocumento} />
        </>
    );
    const deleteTipoDocumentoDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteTipoDocumentoDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteTipoDocumento} />
        </>
    );
    const deleteTipoDocumentosDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteTipoDocumentosDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedTipoDocumentos} />
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
                        value={tipoDocumentos}
                        selection={selectedTipoDocumentos}
                        onSelectionChange={(e) => setSelectedTipoDocumentos(e.value)}
                        dataKey="idTipoDocumento"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Tipo Documentos"
                        globalFilter={globalFilter}
                        emptyMessage="No se encontraron Tipo Documentos."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                        <Column field="idTipoDocumento" header="ID" sortable body={idBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="nombreDocumento" header="Nombre" sortable body={nombreBodyTemplate} headerStyle={{ width: '14%', minWidth: '20rem' }}></Column>
                        <Column header="Acciones" body={actionBodyTemplate}></Column>
                    </DataTable>

                    <Dialog visible={tipoDocumentoDialog} style={{ width: '450px' }} header="Registro Tipo Documentos" modal className="p-fluid" footer={tipoDocumentoDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="nombreDocumento">Nombre</label>
                            <InputText id="nombreDocumento" value={tipoDocumento.nombreDocumento} onChange={(e) => onInputChange(e, 'nombreDocumento')} required autoFocus className={classNames({ 'p-invalid': submitted && !tipoDocumento.nombreDocumento })} />
                            {submitted && !tipoDocumento.nombreDocumento && <small className="p-invalid">Nombre Documento es requerido.</small>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteTipoDocumentoDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteTipoDocumentoDialogFooter} onHide={hideDeleteTipoDocumentoDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {tipoDocumento && <span>¿Está seguro de que desea eliminar a <b>{tipoDocumento.nombreDocumento}</b>?</span>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteTipoDocumentosDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteTipoDocumentosDialogFooter} onHide={hideDeleteTipoDocumentosDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {tipoDocumento && <span>¿Está seguro de que desea eliminar los registros seleccionados?</span>}
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
export default TipoDocumentos;
