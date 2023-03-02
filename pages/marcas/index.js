import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { MarcaService } from '../../demo/service/MarcaService';
import { autenticacionRequerida } from '../../utils/AutenticacionRequerida';
import { useSession } from 'next-auth/react'

const Marcas = () => {
    let marcaVacia = {
        idMarca: null,
        nombre: '',
    };

    const [marcas, setMarcas] = useState([]);
    const [marcaDialog, setMarcaDialog] = useState(false);
    const [deleteMarcaDialog, setDeleteMarcaDialog] = useState(false);
    const [deleteMarcasDialog, setDeleteMarcasDialog] = useState(false);
    const [marca, setMarca] = useState(marcaVacia);
    const [selectedMarcas, setSelectedMarcas] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const { data: session } = useSession()

    const listarMarcas = () => {
        const marcaService = new MarcaService();
        marcaService.getMarcas().then(data => setMarcas(data));
    };

    useEffect(() => {
        listarMarcas();
    }, []);


    const onSearchChange = (event) => {
        const searchFieldString = event.target.value.toLocaleLowerCase();
        //setSearchField(searchFieldString);
    };

    const openNew = () => {
        setMarca(marcaVacia);
        setSubmitted(false);
        setMarcaDialog(true);
    }

    const hideDialog = () => {
        setSubmitted(false);
        setMarcaDialog(false);
    }

    const hideDeleteMarcaDialog = () => {
        setDeleteMarcaDialog(false);
    }

    const hideDeleteMarcasDialog = () => {
        setDeleteMarcasDialog(false);
    }

    const pasoRegistro = () => {
        listarMarcas();
        setMarcaDialog(false);
        setMarca(marcaVacia); 
    }

    const saveMarca = async () => {
        setSubmitted(true);
        if (marca.idMarca) {
            try {
                 const marcaService = new MarcaService();
                 await marcaService.updateMarca(marca);
                 toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Marca Actualizada', life: 3000 });
                 pasoRegistro();
             } catch (error) {
                 toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });
             }
        }
        else {
             try {
                 const marcaService = new MarcaService();
                 await marcaService.addMarca(marca);
                 toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Marca Creada', life: 3000 });
                 pasoRegistro();
             } catch (error) {
                 toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });                    
             }
        }   
        
    }

    const editMarca = (marca) => {
        setMarca({ ...marca});
        setMarcaDialog(true);
        console.log(globalFilter);
        console.log(marcas);
    }

    const confirmDeleteMarca = (marca) => {
        setMarca(marca);
        setDeleteMarcaDialog(true);
    }

    const deleteMarca = async () => {
        try {
            const marcaService = new MarcaService();
            await marcaService.removeMarca(marca.idMarca);
            listarMarcas();
            setDeleteMarcaDialog(false);
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Marca Eliminada', life: 3000 });
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error, life: 3000 });  
        }
    }

    const cols = [
        { field: 'idMarca', header: 'ID' },
        { field: 'nombre', header: 'Nombre' }
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
                const txtWidth = doc.getStringUnitWidth('MARCAS AUTOMOTRICES') * fontSize / doc.internal.scaleFactor;
                const x = (docWidth - txtWidth) / 2;
                image.src = '../layout/images/img_facturalogo2.png';
                doc.addImage(image, 'PNG', 10, 0, 50, 30);
                //centrar texto:
                doc.text('MARCAS AUTOMOTRICES', x, 15);
                doc.setFontSize(12);
                doc.text(15, 30, 'Usuario: ' + session.user.name);
                doc.text(15, 36, 'Fecha: ' + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString());
                doc.text(docWidth - 15, 30, 'Total Marcas: ' + marcas.length, { align: "right" });
                doc.line(15, 40, docWidth - 15, 40);
                doc.autoTable(exportColumns, marcas, { margin: { top: 45, bottom: 25 } });
                const pageCount = doc.internal.getNumberOfPages();
                for (var i = 1; i <= pageCount; i++) {
                    doc.line(15, docHeight - 20, docWidth - 15, docHeight - 20);
                    doc.text('Página ' + String(i) + '/' + pageCount, docWidth - 15, docHeight - 10, { align: "right" });
                }
                doc.save('Reporte_Marcas.pdf');
            });
        });
    };

    const exportExcel = () => {
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(marcas);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array'
            });

            saveAsExcelFile(excelBuffer, 'Reporte_Marcas');
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
        setDeleteMarcasDialog(true);
    }


    const deleteSelectedMarcas = async () => {
        let x = ' ';
        const marcaService = new MarcaService();
        selectedMarcas.map(async (marca) => {
            try {
                await marcaService.removeMarca(marca.idMarca);
            } catch (error) {
                x = x + 'error'; 
                toast.current.show({ severity: 'error', summary: 'Error', detail: error + ` ${marca.nombre}`, life: 3000 }); 
            }
            console.log(x);
        });
        if (x == '') {
            let _marcas = marcas.filter((val) => !selectedMarcas.includes(val));
            setMarcas(_marcas);
            setDeleteMarcasDialog(false);
            setSelectedMarcas(null);
            //listarMarcas();
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Marcas Eliminadas', life: 3000 });
        }
    }


    const onInputChange = (e, nombre) => {
        const val = (e.target && e.target.value) || '';
        let _marca = { ...marca };
        _marca[`${nombre}`] = val;

        setMarca(_marca);
    }


    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                    <Button label="Eliminar" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedMarcas || !selectedMarcas.length} />
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
                <span className="p-column-title">Código</span>
                {rowData.idMarca}
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
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editMarca(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning mt-2" onClick={() => confirmDeleteMarca(rowData)} />
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
            <h5 className="m-0">Listado de Marcas</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => filter(e)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const marcaDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" className="p-button-text" onClick={saveMarca}/>
        </>
    );
    const deleteMarcaDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteMarcaDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteMarca} />
        </>
    );
    const deleteMarcasDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteMarcasDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedMarcas} />
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
                        value={marcas}
                        selection={selectedMarcas}
                        onSelectionChange={(e) => setSelectedMarcas(e.value)}
                        dataKey="idMarca"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} marcas" 
                        globalFilter={globalFilter}
                        emptyMessage="No se encontraron marcas."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem'}}></Column>
                        <Column field="idMarca" header="Código" sortable body={idBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="nombre" header="Nombre" sortable body={nombreBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column header="Acciones" body={actionBodyTemplate}></Column>
                    </DataTable>

                    <Dialog visible={marcaDialog} style={{ width: '450px' }} header="Registro Marcas" modal className="p-fluid" footer={marcaDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="nombre">Nombre</label>
                            <InputText id="nombre" value={marca.nombre} onChange={(e) => onInputChange(e, 'nombre')} tooltip="Debe ingresar más de tres caracteres"
                             className={classNames({ 'p-invalid': submitted && !marca.nombre })} />
                            { submitted && !marca.nombre && <small className="p-invalid">Nombre es requerido.</small> }
                        </div>
                    </Dialog> 

                    <Dialog visible={deleteMarcaDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteMarcaDialogFooter} onHide={hideDeleteMarcaDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {marca && <span>¿Está seguro de que desea eliminar a <b>{marca.nombre}</b>?</span>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteMarcasDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteMarcasDialogFooter} onHide={hideDeleteMarcasDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {marca && <span>¿Está seguro de que desea eliminar los registros seleccionados?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};
export async function getServerSideProps({req}){
    return autenticacionRequerida(req,({session}) =>
    {
        return{
            props:{session}
        }
    })
}
export default Marcas;
