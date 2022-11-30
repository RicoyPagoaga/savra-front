import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { ImpuestoService } from '../../demo/service/ImpuestoService';

const Impuestos = () => {
    let impuestoVacio = {
        idImpuesto: null,
        nombre: '',
        fechaInicio: '',
        fechaFinal: '',
        valor: 0,
    };

    const [impuestos, setImpuestos] = useState(null);
    const [impuestoDialog, setImpuestoDialog] = useState(false);
    const [deleteImpuestoDialog, setDeleteImpuestoDialog] = useState(false);
    const [deleteImpuestosDialog, setDeleteImpuestosDialog] = useState(false);
    const [impuesto, setImpuesto] = useState(impuestoVacio);
    const [selectedImpuestos, setSelectedImpuestos] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);

    //fechas
    const [fechaInicio_, setFechaInicio_] = useState(null);
    const [fechaFinal_, setFechaFinal_] = useState(null);

    const listarImpuestos = () => {
        const impuestoService = new ImpuestoService();
        impuestoService.getImpuestos().then(data => setImpuestos(data));
    };

    useEffect(() => {
        listarImpuestos(); 
    }, []); 

    const openNew = () => {
        setImpuesto(impuestoVacio);
        setSubmitted(false);
        setImpuestoDialog(true);
    }

    const hideDialog = () => {
        setSubmitted(false);
        setImpuestoDialog(false);
        //
        setFechaInicio_(null);
        setFechaFinal_(null);
    }

    const hideDeleteImpuestoDialog = () => {
        setDeleteImpuestoDialog(false);
    }

    const hideDeleteImpuestosDialog = () => {
        setDeleteImpuestosDialog(false);
    }

    const pasoRegistro = () => {
        listarImpuestos();
        setImpuestoDialog(false);
        setImpuesto(impuestoVacio);
        //
        setFechaInicio_(null);
        setFechaFinal_(null);
    }

    const saveImpuesto = async () => {
        setSubmitted(true);

        if (impuesto.nombre.trim()) {
            if (impuesto.idImpuesto) {
                try {
                    const impuestoService = new ImpuestoService();
                    await impuestoService.updateImpuesto(impuesto);
                    toast.current.show({ severity: 'success', summary: 'Exitosamente', detail: 'Impuesto Actualizado', life: 3000 });
                    pasoRegistro();
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails , life: 3000 });
                }
            }
            else {
                try {
                    const impuestoService = new ImpuestoService();
                    await impuestoService.addImpuesto(impuesto);
                    toast.current.show({ severity: 'success', summary: 'Exitosamente', detail: 'Impuesto Creado', life: 3000 });
                    pasoRegistro();
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails , life: 3000 });   
                }
            }

        }
    }

    const getFecha = (fecha) => {
        const [y, m, d] = fecha.split('-');
        let _fecha = new Date(+y, m-1, +d);
        return _fecha;
    }

    const editImpuesto = (impuesto) => {
        setImpuesto({ ...impuesto });
        //
        setFechaInicio_(getFecha(impuesto.fechaInicio));
        setFechaFinal_(getFecha(impuesto.fechaFinal));
        //
        setImpuestoDialog(true);
    }

    const confirmDeleteImpuesto = (impuesto) => {
        setImpuesto(impuesto);
        setDeleteImpuestoDialog(true);
    }

    const deleteImpuesto = async () => {
        try {
            const impuestoService = new ImpuestoService();
            await impuestoService.removeImpuesto(impuesto.idImpuesto);
            listarImpuestos();
            setDeleteImpuestoDialog(false);
            toast.current.show({ severity: 'success', summary: 'Exitosamente', detail: 'Impuesto Eliminado', life: 3000 });
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        }
    }

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteImpuestosDialog(true);
    }

    const deleteSelectedImpuestos = () => {
        const impuestoService = new ImpuestoService();
        selectedImpuestos.map(async (impuesto) => {
            await impuestoService.removeImpuesto(impuesto.idImpuesto);
        });
        let _impuestos = impuestos.filter(val => !selectedImpuestos.includes(val));
        setImpuestos(_impuestos);
        setDeleteImpuestosDialog(false);
        setSelectedImpuestos(null);
        toast.current.show({ severity: 'success', summary: 'Exitosamente', detail: 'Impuestos Eliminados', life: 3000 });
    }


    const onInputChange = (e, nombre) => {
        const val = (e.target && e.target.value) || '';
        let _Impuesto = { ...impuesto };
        _Impuesto[`${nombre}`] = val;
        setImpuesto(_Impuesto);
    }


    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                    <Button label="Eliminar" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedImpuestos || !selectedImpuestos.length} />
                </div>
            </React.Fragment>
        )
    }

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="Exportar" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />
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

    const fechaInicioBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Fecha de Inicio</span>
                {rowData.fechaInicio}
            </>
        );
    }

    const fechaFinalBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Fecha Final</span>
                {rowData.fechaFinal}
            </>
        );
    }

    const valorBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Valor de Impuesto</span>
                {rowData.valor}
            </>
        )
    }

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editImpuesto(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning mt-2" onClick={() => confirmDeleteImpuesto(rowData)} />
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
            <h5 className="m-0">Impuestos</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => filter(e)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const impuestoDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" className="p-button-text" onClick={saveImpuesto} />
        </>
    );
    const deleteImpuestoDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteImpuestoDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteImpuesto} />
        </>
    );
    const deleteImpuestosDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteImpuestosDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedImpuestos} />
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
                        value={impuestos}
                        selection={selectedImpuestos}
                        onSelectionChange={(e) => setSelectedImpuestos(e.value)}
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
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem'}}></Column>
                        <Column field="idImpuesto" header="Código" sortable body={idBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="nombre" header="Nombre" sortable body={nombreBodyTemplate} headerStyle={{ width: '25%', minWidth: '10rem' }}></Column>
                        <Column field="fechaInicio" header="Fecha de Inicio" sortable body={fechaInicioBodyTemplate} headerStyle={{ width: '25%', minWidth: '10rem' }}></Column>
                        <Column field="fechaFinal" header="Fecha Final" body={fechaFinalBodyTemplate} sortable headerStyle={{ width: '25%', minWidth: '8rem' }}></Column>
                        <Column field="valor" header="Valor" sortable body={valorBodyTemplate} headerStyle={{ width: '25%', minWidth: '10rem' }}></Column>
                        <Column header="Acciones" body={actionBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={impuestoDialog} style={{ width: '450px' }} header="Detalles de Impuesto" modal className="p-fluid" footer={impuestoDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="nombre">Nombre</label>
                            <InputText id="nombre" value={impuesto.nombre} onChange={(e) => onInputChange(e, 'nombre')} required autoFocus className={classNames({ 'p-invalid': submitted && !impuesto.nombre })} />
                            {submitted && !impuesto.nombre && <small className="p-invalid">El nombre es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="fechaInicio">Fecha Inicial</label>
                            <Calendar inputId="fechaInicio" value={fechaInicio_} showIcon showButtonBar onChange={(e) => onInputChange(e, 'fechaInicio')} dateFormat="yy-mm-dd"
                            placeholder='Seleccione fecha inicial' required autoFocus className={classNames({ 'p-invalid': submitted && !impuesto.fechaInicio })}></Calendar>                
                            {submitted && !impuesto.fechaInicio && <small className="p-invalid">La fecha inicial es requerida.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="fechaFinal">Fecha Final</label>
                            <Calendar inputId="fechaFinal" value={fechaFinal_} showIcon showButtonBar onChange={(e) => onInputChange(e, 'fechaFinal')} dateFormat="yy-mm-dd"
                            placeholder='Seleccione fecha final' required autoFocus className={classNames({ 'p-invalid': submitted && !impuesto.fechaFinal })}></Calendar>
                            {submitted && !impuesto.fechaFinal && <small className="p-invalid">La fecha final es requerida.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="valor">Valor</label>
                            <InputNumber id="valor" value={impuesto.valor} onValueChange={(e) => onInputChange(e, 'valor')} required autoFocus className={classNames({ 'p-invalid': submitted && !impuesto.valor })} />
                            {submitted && !impuesto.valor && <small className="p-invalid">El valor es requerido, no debe ser menor o igual a cero.</small>}
                        </div>
                    </Dialog> 

                    <Dialog visible={deleteImpuestoDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteImpuestoDialogFooter} onHide={hideDeleteImpuestoDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {impuesto && <span>¿Está seguro de que desea eliminar a <b>{impuesto.nombre}</b>?</span>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteImpuestosDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteImpuestosDialogFooter} onHide={hideDeleteImpuestosDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {impuesto && <span>¿Está seguro de que desea eliminar los registros seleccionados?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Impuestos;
