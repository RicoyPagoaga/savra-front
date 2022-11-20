import getConfig from 'next/config';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { InputTextarea } from 'primereact/inputtextarea';
import { RadioButton } from 'primereact/radiobutton';
import { Rating } from 'primereact/rating';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { EmpleadoService } from '../../demo/service/EmpleadoService';
import { TipoDocumentoService } from '../../demo/service/TipoDocumentoService';
import Moment from 'moment';

const Empleados = () => {
    let emptyEmpleado = {
        idEmpleado: null,
        nombre: '',
        documento: '',
        idTipoDocumento : null,
        fechaNacimiento:null,
        telefono: '',
        fechaIngreso:null,
        correo:'',
        direccion: ''
    };

    let emptyRestApiError = {
        httpStatus : '',
        errorMessage: '',
        errorDetails: ''
    };

    const [empleados, setEmpleados] = useState(null);
    const [tipoDocumentos,setTipoDocumentos] = useState([]);
    const [tipoDocumento, setTipoDocumento] = useState(null);
    const [calendarValueNac, setCalendarValueNac] = useState(null);
    const [calendarValueIn, setCalendarValueIn] = useState(null);
    //const [categoriaEmpleados,setCategoriaEmpleados] = useState([]);
    const [categoriaEmpleado, setCategoriaEmpleado] = useState(null);
    const [empleadoDialog, setEmpleadoDialog] = useState(false);
    const [deleteEmpleadoDialog, setDeleteEmpleadoDialog] = useState(false);
    const [deleteEmpleadosDialog, setDeleteEmpleadosDialog] = useState(false);
    const [empleado, setEmpleado] = useState(emptyEmpleado);
    const [apiError, setApiError] = useState(emptyRestApiError);
    const [selectedEmpleados, setSelectedEmpleados] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;


    const listarEmpleados = () => {
        const empleadoservice = new EmpleadoService();
        empleadoservice.getEmpleados().then(data => setEmpleados(data));
    };
    const listarTipoDocumentos = async() => {
        const tiposDocumentoService = new TipoDocumentoService();
        await tiposDocumentoService.getTipoDocumentos().then(data => setTipoDocumentos(data));
    };
    //const listarCategoriasEmpleados =async () => {
     //   const categoriaservice = new CategoriaEmpleadoService();
     //   await categoriaservice.getCategoriaEmpleados().then(data => setCategoriaEmpleados(data));
   // };
    
    useEffect(async() => {
        listarEmpleados();
        await listarTipoDocumentos();
        await listarEmpleados();
    }, []);
    

    const openNew = () => {
        setEmpleado(emptyEmpleado);
        setTipoDocumento(null);
        setCalendarValueNac(null);
        setCalendarValueIn(null);
        setSubmitted(false);
        setEmpleadoDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setEmpleadoDialog(false);
    };

    const hideDeleteEmpleadoDialog = () => {
        setDeleteEmpleadoDialog(false);
    };

    const hideDeleteEmpleadosDialog = () => {
        setDeleteEmpleadosDialog(false);
    };

    const pasoRegistro = () =>{
        listarEmpleados();
        setEmpleadoDialog(false);
        setEmpleado(emptyEmpleado);
    }
    
    const saveEmpleado = async () => {
        setSubmitted(true);

        if (empleado.nombre.trim()) {
            if (empleado.idEmpleado) {
                try {
                    const empleadoservice = new EmpleadoService();
                    await empleadoservice.updateempleado(empleado);
                    toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Empleado Actualizado', life: 3000 });
                    pasoRegistro();
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails , life: 3000 });
                    //console.log(apiError.errorDetails);
                }
            } else {
                try {
                    const empleadoservice = new EmpleadoService();
                    await empleadoservice.addEmpleado(empleado);
                    toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Empleado Registrado', life: 3000 });
                    pasoRegistro();
                    console.log(empleado);
                } catch (error) {
                    console.log(empleado);
                    toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails , life: 3000 });
                }
            };
            
        }
    };

    const editEmpleado= (empleado) => {
        setEmpleado({ ...empleado });
        console.log(tipoDocumentos);
        const documento = tipoDocumentos.find((item) => {
            if(item.idTipoDocumento == empleado.idTipoDocumento)
            return item
        });
        setTipoDocumento(documento);
        setCalendarValueNac(empleado.fechaNacimiento);
        setCalendarValueIn(empleado.fechaIngreso);
        console.log(empleado);
        setEmpleadoDialog(true);
    };
    

    const deleteEmpleado = async ()=>{
        const empleadoservice = new EmpleadoService();
        await empleadoservice.removeEmpleado(empleado.idEmpleado);
        listarEmpleados();
        setDeleteEmpleadoDialog(false);
        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Empleado Eliminado', life: 3000 });
    };
    const confirmDeleteEmpleado = (empleado) => {
        setEmpleado(empleado);
        setDeleteEmpleadoDialog(true);
    };
   
    const exportCSV = () => {
        dt.current.exportCSV();
    };
    const confirmDeleteSelected = () => {
        setDeleteEmpleadosDialog(true);
    }
    const deleteSelectedEmpleados = () => {
        const empleadoService = new EmpleadoService();
        selectedEmpleados.map(async (empleado) => {
            await empleadoService.removeEmpleado(empleado.idEmpleado);
        });
        let _empleados = empleados.filter((val) => !selectedEmpleados.includes(val));
        setEmpleados(_empleados);
        setDeleteEmpleadosDialog(false);
        setSelectedEmpleados(null);
        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Empleados Eliminados', life: 3000 });
    };
    
    const onInputChange = (e, nombre) => {
        const val = (e.target && e.target.value) || '';
        let _empleado = { ...empleado };
        if (nombre == 'idTipoDocumento') {
            _empleado[`${nombre}`] = val.idTipoDocumento;
            setTipoDocumento(e.value);
            console.log(e.value);
        } else if (nombre == 'idCategoria') {
            _empleado[`${nombre}`] = val.idCategoria;
            setCategoriaEmpleado(e.value);
        } else {
            _empleado[`${nombre}`] = val;
        }
        console.log(val.idTipoDocumento);
        setEmpleado(_empleado);

    };

    const onInputChangeDate = (e, fecha) => {
        const val = (e.target && e.target.value) || '';
        let _empleado = { ...empleado };

        if (fecha == 'fechaNacimiento') {
            _empleado[`${fecha}`] = val;
            setCalendarValueNac(e.value);
        } else{
            _empleado[`${fecha}`] = val;
            setCalendarValueIn(e.value);
        }
        //console.log(val)
        setEmpleado(_empleado);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                    <Button label="Eliminar" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedEmpleados || !selectedEmpleados.length} />
                </div>
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="Exportar" icon="pi pi-upload" className="p-button-help mr-2 inline-block" onClick={exportCSV} />
            </React.Fragment>
        );
    };

    const idBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">ID Empleado</span>
                {rowData.idEmpleado}
            </>
        );
    };

    const nombreBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Nombre</span>
                {rowData.nombre}
            </>
        );
    };

    const documentoBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Documento</span>
                {rowData.documento}
            </>
        );
    }; 

    const idTipoDocumentoBodyTemplate = (rowData) => {
        const documento = tipoDocumentos.find((item) => {
            if(item.idTipoDocumento == rowData.idTipoDocumento)
                 return item;
            });
            console.log(documento)
        if(documento != null){
            return (
                <>
                    <span className="p-column-title">Id Tipo Documento</span>
                    {
                        documento.nombreDocumento
                    }
                    
                </>
            );
        }else{
            return (
                <>
                    <span className="p-column-title">Id Tipo Documento</span>
                    {
                        rowData.idTipoDocumento
                    }
                    
                </>
            );
        }
        
    };
    const fechaNacimientoBodyTemplate = (rowData) => {
        var dateDMY = Moment(rowData.fechaNacimiento).format('DD/MM/YYYY')
        return (
            <>
                <span className="p-column-title">Fecha Nacimiento</span>
                {dateDMY}
            </>
        );
    };


    const telefonoBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Telefono</span>
                {rowData.telefono}
            </>
        );
    };
    const fechaIngresoBodyTemplate = (rowData) => {
        var dateDMY = Moment(rowData.fechaIngreso).format('DD/MM/YYYY')
        return (
            <>
                <span className="p-column-title">Fecha Ingreso</span>
                {dateDMY}
            </>
        );
    };
    const correoBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Correo</span>
                {rowData.correo}
            </>
        );
    };

    const direccionBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Direccion</span>
                {rowData.direccion}
            </>
        );
    };
    
    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editEmpleado(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning" onClick={() => confirmDeleteEmpleado(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Listado de Empleados</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const empleadoDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Registar" icon="pi pi-check" className="p-button-text" onClick={saveEmpleado} />
        </>
    );
    const deleteEmpleadoDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteEmpleadoDialog} />
            <Button label="Si" icon="pi pi-check" className="p-button-text" onClick={deleteEmpleado} />
        </>
    );
    const deleteEmpleadosDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteEmpleadosDialog} />
            <Button label="Si" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedEmpleados} />
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
                        value={empleados}
                        selection={selectedEmpleados}
                        onSelectionChange={(e) => setSelectedEmpleados(e.value)}
                        dataKey="idEmpleado"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Empleados"
                        globalFilter={globalFilter}
                        emptyMessage="No se encontraron empleados."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem'}}></Column>
                        <Column field="idEmpleado" header="ID" sortable body={idBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="nombre" header="Nombre" sortable body={nombreBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="documento" header="Documento" sortable body={documentoBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="idTipoDocumento" header="Tipo Documento" sortable body={idTipoDocumentoBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="fechaNacimiento" header="Fecha Nacimiento" sortable body={fechaNacimientoBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="telefono" header="Teléfono" sortable body={telefonoBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="fechaIngreso" header="Fecha Ingreso" sortable body={fechaIngresoBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="correo" header="Correo" sortable body={correoBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="direccion" header="Dirección" sortable body={direccionBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column header="Acciones"body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={empleadoDialog} style={{ width: '450px' }} header="Registro Empleados" modal className="p-fluid" footer={empleadoDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="nombre">Nombre</label>
                            <InputText id="nombre" value={empleado.nombre} onChange={(e) => onInputChange(e, 'nombre')} required autoFocus className={classNames({ 'p-invalid': submitted && !empleado.nombre })} />
                            {submitted && !empleado.nombre && <small className="p-invalid">Nombre es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="documento">Documento</label>
                            <InputText id="documento" value={empleado.documento} onChange={(e) => onInputChange(e, 'documento')} required autoFocus className={classNames({ 'p-invalid': submitted && !empleado.documento })} />
                            {submitted && !empleado.documento && <small className="p-invalid">Documento es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="idTipoDocumento">Tipo Documento</label>
                            <Dropdown id="idTipoDocumento" options={tipoDocumentos} value={tipoDocumento} onChange={(e) => onInputChange(e, 'idTipoDocumento')}  optionLabel = "nombreDocumento" placeholder="Seleccione un tipo de Documento" required autoFocus className={classNames({ 'p-invalid': submitted && !empleado.idTipoDocumento })}></Dropdown>
                            {submitted && !empleado.idTipoDocumento && <small className="p-invalid">Tipo Documento es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="fechaNacimiento">Fecha Nacimiento </label>
                            <Calendar showIcon showButtonBar value={calendarValueNac} onChange={(e) => onInputChangeDate(e,'fechaNacimiento')} placeholder="Seleccione una fecha de nacimiento"></Calendar>
                            {submitted && !empleado.fechaNacimiento && <small className="p-invalid">Fecha de Nacimiento es requerida.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="telefono">Teléfono</label>
                            <InputText id="telefono" value={empleado.telefono} onChange={(e) => onInputChange(e, 'telefono')} required autoFocus className={classNames({ 'p-invalid': submitted && !empleado.telefono })} />
                            {submitted && !empleado.telefono && <small className="p-invalid">Teléfono es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="fechaIngreso">Fecha Ingreso</label>
                            <Calendar showIcon showButtonBar value={calendarValueIn} onChange={(e) => onInputChangeDate(e,'fechaIngreso')} placeholder="Seleccione una fecha de ingreso" ></Calendar>
                            {submitted && !empleado.fechaIngreso && <small className="p-invalid">Fecha de Ingreso es requerida.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="correo">Correo</label>
                            <InputText id="correo" value={empleado.correo} onChange={(e) => onInputChange(e, 'correo')} required autoFocus className={classNames({ 'p-invalid': submitted && !empleado.correo })} />
                            {submitted && !empleado.correo && <small className="p-invalid">Correo es requerido.</small>}
                        </div>
                       
                        <div className="field">
                            <label htmlFor="direccion">Dirección</label>
                            <InputText id="direccion" value={empleado.direccion} onChange={(e) => onInputChange(e, 'direccion')} required autoFocus className={classNames({ 'p-invalid': submitted && !empleado.direccion })} />
                            {submitted && !empleado.direccion && <small className="p-invalid">Dirección es requerido.</small>}
                        </div>
                        
                    </Dialog>

                    <Dialog visible={deleteEmpleadoDialog} style={{ width: '450px' }} header="Confirmación" modal footer={deleteEmpleadoDialogFooter} onHide={hideDeleteEmpleadoDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {empleado && (
                                <span>
                                    Esta seguro que desea eliminar a <b>{empleado.nombre}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteEmpleadosDialog} style={{ width: '450px' }} header="Confirmación" modal footer={deleteEmpleadosDialogFooter} onHide={hideDeleteEmpleadosDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {empleado && <span>Esta seguro que desea eliminar los siguientes Empleados?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Empleados;