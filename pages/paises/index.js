import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { PaisService } from '../../demo/service/PaisService';
import { autenticacionRequerida } from '../../utils/AutenticacionRequerida';
import { useSession } from 'next-auth/react'

const Paises = () => {
    let paisVacio = {
        idPais: null,
        cod_iso: '',
        nombre: '',
        cod_area: ''
    };

    const [paiss, setPaiss] = useState();
    const [paisDialog, setPaisDialog] = useState(false);
    const [deletePaisDialog, setDeletePaisDialog] = useState(false);
    const [deletePaissDialog, setDeletePaissDialog] = useState(false);
    const [pais, setPais] = useState(paisVacio);
    const [selectedPaiss, setSelectedPaiss] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const { data: session } = useSession();

    const listarPaiss = () => {
        const paisService = new PaisService();
        paisService.getPaises().then(data => setPaiss(data));
    };

    useEffect(() => {
        listarPaiss();
    }, []);

    const openNew = () => {
        setPais(paisVacio);
        setSubmitted(false);
        setPaisDialog(true);
    }

    const hideDialog = () => {
        setSubmitted(false);
        setPaisDialog(false);
    }

    const hideDeletePaisDialog = () => {
        setDeletePaisDialog(false);
    }

    const hideDeletePaissDialog = () => {
        setDeletePaissDialog(false);
    }

    const pasoRegistro = () => {
        listarPaiss();
        setPaisDialog(false);
        setPais(paisVacio);
    }

    const savePais = async () => {
        setSubmitted(true);

        if (pais.idPais) {
            try {
                const paisService = new PaisService();
                await paisService.updatePais(pais);
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'País Actualizado', life: 3000 });
                pasoRegistro();
            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });
            }
        }
        else {
            try {
                const paisService = new PaisService();
                await paisService.addPais(pais);
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'País Creado', life: 3000 });
                pasoRegistro();
            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });

            }
        }


    }

    const editPais = (pais) => {
        setPais({ ...pais });
        setPaisDialog(true);
    }

    const confirmDeletePais = (pais) => {
        setPais(pais);
        setDeletePaisDialog(true);
    }

    const deletePais = async () => {
        try {
            const paisService = new PaisService();
            await paisService.removePais(pais.idPais);
            listarPaiss();
            setDeletePaisDialog(false);
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'País Eliminado', life: 3000 });

        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        }
    }

    const cols = [
        { field: 'idPais', header: 'ID' },
        { field: 'cod_iso', header: 'Código ISO' },
        { field: 'nombre', header: 'Nombre' },
        { field: 'cod_area', header: 'Código de Área' }
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
                const txtWidth = doc.getStringUnitWidth('PAISES') * fontSize / doc.internal.scaleFactor;
                const x = (docWidth - txtWidth) / 2;
                image.src = '../layout/images/img_facturalogo2.png';
                doc.addImage(image, 'PNG', 10, 0, 50, 30);
                //centrar texto:
                doc.text('PAISES', x, 15);
                doc.setFontSize(12);
                doc.text(15, 30, 'Usuario: ' + session.user.name);
                doc.text(15, 36, 'Fecha: ' + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString());
                doc.text(docWidth - 15, 30, 'Total Paises: ' + paiss.length, { align: "right" });
                doc.line(15, 40, docWidth - 15, 40);
                doc.autoTable(exportColumns, paiss, { margin: { top: 45, bottom: 25 } });
                const pageCount = doc.internal.getNumberOfPages();
                for (var i = 1; i <= pageCount; i++) {
                    doc.line(15, docHeight - 20, docWidth - 15, docHeight - 20);
                    doc.text('Página ' + String(i) + '/' + pageCount, docWidth - 15, docHeight - 10, { align: "right" });
                }
                doc.save('Reporte_Países.pdf');
            });
        });
    };

    const exportExcel = () => {
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(paiss);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array'
            });

            saveAsExcelFile(excelBuffer, 'Reporte_Países');
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
        setDeletePaissDialog(true);
    }


    const deleteSelectedPaiss = async () => {
        const paisService = new PaisService();
        selectedPaiss.map(async (pais) => {
            await paisService.removePais(pais.idPais);
        });
        let _paiss = paiss.filter((val) => !selectedPaiss.includes(val));
        setPaiss(_paiss);
        setDeletePaissDialog(false);
        setSelectedPaiss(null);
        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Paises Eliminados', life: 3000 });
    }


    const onInputChange = (e, nombre) => {
        const val = (e.target && e.target.value) || '';
        let _pais = { ...pais };
        _pais[`${nombre}`] = val;

        setPais(_pais);
    }


    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                    <Button label="Eliminar" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedPaiss || !selectedPaiss.length} />
                </div>
            </React.Fragment>
        )
    }

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button type="button" icon="pi pi-file" onClick={() => exportCSV(false)} className="mr-2" tooltip="CSV" tooltipOptions={{ position: 'bottom' }} />
                <Button type="button" icon="pi pi-file-excel" onClick={exportExcel} className="p-button-success mr-2" tooltip="XLS" tooltipOptions={{ position: 'bottom' }} />
                <Button type="button" icon="pi pi-file-pdf" onClick={exportPdf} className="p-button-warning mr-2" tooltip="PDF" tooltipOptions={{ position: 'bottom' }} />
            </React.Fragment>
        )
    }

    const idBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">ID Pais</span>
                {rowData.idPais}
            </>
        );
    }

    const cod_isoBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Codigo ISO</span>
                {rowData.cod_iso}
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
    const cod_areaBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Codigo area</span>
                {rowData.cod_area}
            </>
        );
    }

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editPais(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning mt-2" onClick={() => confirmDeletePais(rowData)} />
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
            <h5 className="m-0">Listado de Países</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => filter(e)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const paisDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" className="p-button-text" onClick={savePais} />
        </>
    );
    const deletePaisDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeletePaisDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deletePais} />
        </>
    );
    const deletePaissDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeletePaissDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedPaiss} />
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
                        value={paiss}
                        selection={selectedPaiss}
                        onSelectionChange={(e) => setSelectedPaiss(e.value)}
                        dataKey="idPais"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} paises"
                        globalFilter={globalFilter}
                        emptyMessage="No se encontraron paises."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                        <Column field="idPais" header="ID" sortable body={idBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="cod_iso" header="Código ISO" sortable body={cod_isoBodyTemplate} headerStyle={{ width: '14%', minWidth: '20rem' }}></Column>
                        <Column field="nombre" header="Nombre" sortable body={nombreBodyTemplate} headerStyle={{ width: '14%', minWidth: '20rem' }}></Column>
                        <Column field="cod_area" header="Código Área" sortable body={cod_areaBodyTemplate} headerStyle={{ width: '14%', minWidth: '20rem' }}></Column>
                        <Column header="Acciones" body={actionBodyTemplate}></Column>
                    </DataTable>

                    <Dialog visible={paisDialog} style={{ width: '450px' }} header="Registro Paises" modal className="p-fluid" footer={paisDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="nombre">Código ISO</label>
                            <InputText id="nombre" value={pais.cod_iso} onChange={(e) => onInputChange(e, 'cod_iso')} required autoFocus className={classNames({ 'p-invalid': submitted && !pais.cod_iso })} />
                            {submitted && !pais.cod_iso && <small className="p-invalid">Código ISO es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="nombre">Nombre</label>
                            <InputText id="nombre" value={pais.nombre} onChange={(e) => onInputChange(e, 'nombre')} required autoFocus className={classNames({ 'p-invalid': submitted && !pais.nombre })} />
                            {submitted && !pais.nombre && <small className="p-invalid">Nombre es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="nombre">Código de Area</label>
                            <InputText id="nombre" value={pais.cod_area} onChange={(e) => onInputChange(e, 'cod_area')} required autoFocus className={classNames({ 'p-invalid': submitted && !pais.cod_area })} />
                            {submitted && !pais.cod_area && <small className="p-invalid">Código de área requerido.</small>}
                        </div>
                    </Dialog>

                    <Dialog visible={deletePaisDialog} style={{ width: '450px' }} header="Confirm" modal footer={deletePaisDialogFooter} onHide={hideDeletePaisDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {pais && <span>¿Está seguro de que desea eliminar a <b>{pais.nombre}</b>?</span>}
                        </div>
                    </Dialog>

                    <Dialog visible={deletePaissDialog} style={{ width: '450px' }} header="Confirm" modal footer={deletePaissDialogFooter} onHide={hideDeletePaissDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {pais && <span>¿Está seguro de que desea eliminar los registros seleccionados?</span>}
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
export default Paises;
