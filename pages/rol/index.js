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
import { autenticacionRequerida } from '../../utils/AutenticacionRequerida';
import { useSession } from 'next-auth/react'

const Rols = () => {
    let rolVacio = {
        idRol: null,
        nombre: '',
        descripcion:''
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
    

    const listarRols = () => {
        const rolService = new RolService();
        rolService.getRols().then(data => setRols(data));
    };

    useEffect(() => {
        listarRols();
    }, []);

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
        setRol({ ...rol});
        setRolDialog(true);
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
                const txtWidth = doc.getStringUnitWidth('ROLES LABORALES') * fontSize / doc.internal.scaleFactor;
                const x = (docWidth - txtWidth) / 2;
                image.src = '../layout/images/img_facturalogo2.png';
                doc.addImage(image, 'PNG', 10, 0, 50, 30);
                //centrar texto:
                doc.text('ROLES LABORALES', x, 15);
                doc.setFontSize(12);
                doc.text(15, 30, 'Usuario: ' + session.user.name);
                doc.text(15, 36, 'Fecha: ' + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString());
                doc.text(docWidth - 15, 30, 'Total Roles: ' + rols.length, { align: "right" });
                doc.line(15, 40, docWidth - 15, 40);
                doc.autoTable(exportColumns, rols, { margin: { top: 45, bottom: 25 } });
                const pageCount = doc.internal.getNumberOfPages();
                for (var i = 1; i <= pageCount; i++) {
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


    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                    <Button label="Eliminar" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedRols || !selectedRols.length} />
                </div>
            </React.Fragment>
        )
    }

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button type="button" icon="pi pi-file" onClick={() => exportCSV(false)} className="mr-2" tooltip="CSV"  tooltipOptions={{ position: 'bottom' }}/>
                <Button type="button" icon="pi pi-file-excel" onClick={exportExcel} className="p-button-success mr-2" tooltip="XLS"  tooltipOptions={{ position: 'bottom' }}/>
                <Button type="button" icon="pi pi-file-pdf" onClick={exportPdf} className="p-button-warning mr-2" tooltip="PDF"  tooltipOptions={{ position: 'bottom' }}/>
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
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editRol(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning mt-2" onClick={() => confirmDeleteRol(rowData)} />
            </div>
        );
    }

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Roles</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const rolDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" className="p-button-text" onClick={saveRol}/>
        </>
    );
    const deleteRolDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteRolDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteRol}   />
        </>
    );
    const deleteRolsDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteRolsDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedRols} />
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
                        value={rols}
                        selection={selectedRols}
                        onSelectionChange={(e) => setSelectedRols(e.value)}
                        dataKey="idRol"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Tipo Documentos" 
                        globalFilter={globalFilter}
                        emptyMessage="No se encontraron roles."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem'}}></Column>
                        <Column field="idRol" header="ID" sortable body={idBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="nombre" header="Nombre" sortable body={nombreBodyTemplate} headerStyle={{ width: '14%', minWidth: '20rem' }}></Column>
                        <Column field="descripcion" header="Descripción" sortable body={descripcionBodyTemplate} headerStyle={{ width: '14%', minWidth: '20rem' }}></Column>
                        <Column header="Acciones" body={actionBodyTemplate}></Column>
                    </DataTable>

                    <Dialog visible={rolDialog} style={{ width: '450px' }} header="Registro de Roles" modal className="p-fluid" footer={rolDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="nombre">Nombre</label>
                            <InputText id="nombre" value={rol.nombre} onChange={(e) => onInputChange(e, 'nombre')} required autoFocus className={classNames({ 'p-invalid': submitted && !rol.nombre })}tooltip="Ingrese un nombre de rol"/>
                            { submitted && !rol.nombre && <small className="p-invalid">Nombre rol es requerido.</small> }
                        </div>
                        <div className="field">
                            <label htmlFor="descripcion">Descripción</label>
                            <InputText id="descripcion" value={rol.descripcion} onChange={(e) => onInputChange(e, 'descripcion')} required autoFocus className={classNames({ 'p-invalid': submitted && !rol.descripcion })}tooltip="Ingrese una descripción relacionada al rol"/>
                            { submitted && !rol.descripcion && <small className="p-invalid">Nombre rol es requerido.</small> }
                        </div>
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
};
export async function getServerSideProps({req}){
    return autenticacionRequerida(req,({session}) =>
    {
        return{
            props:{session}
        }
    })
}
export default Rols;
