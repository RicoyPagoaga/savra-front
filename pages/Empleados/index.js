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
import React, { experimental_use, useEffect, useRef, useState } from 'react';
import { EmpleadoService } from '../../demo/service/EmpleadoService';
import { CargoService } from '../../demo/service/CargoService';
import { TipoDocumentoService } from '../../demo/service/TipoDocumentoService';
import { EmpleadoCargoService } from '../../demo/service/EmpleadoCargoService';
import Moment from 'moment';


const Empleados = () => {
    let emptyEmpleado = {
        idEmpleado: null,
        nombre: '',
        documento: '',
        idTipoDocumento: null,
        fechaNacimiento: null,
        telefono: '',
        fechaIngreso: null,
        correo: '',
        direccion: ''
    };

    let empleadoCargoVacio = {
        idEmpleado: null,
        idCargo: null,
        fechaInicio: null,
        fechaFinal: null
    };

    let emptyRestApiError = {
        httpStatus: '',
        errorMessage: '',
        errorDetails: ''
    };

    let cargoVacio = {
        idCargo: null,
        nombre: '',
        salarioBase: null,
        descripcion: ''
    };
    //Empleado Cargo
    const [allExpanded, setAllExpanded] = useState(false);
    const [cargo, setCargo] = useState(null);
    const [cargos, setCargos] = useState([]);
    const [empleadoCargo, setEmpleadoCargo] = useState(empleadoCargoVacio);
    const [empleadoCargos, setEmpleadoCargos] = useState([]);
    const [expandedRows, setExpandedRows] = useState([]);
    const [cambioCargo, setCambioCargo] = useState(false);
    const [valorActCargo, setValorActCargo] = useState(cargoVacio);


    const [empleados, setEmpleados] = useState(null);
    const [tipoDocumentos, setTipoDocumentos] = useState([]);
    const [tipoDocumento, setTipoDocumento] = useState(null);
    const [calendarValueNac, setCalendarValueNac] = useState(null);
    const [calendarValueIn, setCalendarValueIn] = useState(null);
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
    const listarTipoDocumentos = async () => {
        const tiposDocumentoService = new TipoDocumentoService();
        await tiposDocumentoService.getTipoDocumentos().then(data => setTipoDocumentos(data));
    };
    const listarCargos = () => {
        const cargoService = new CargoService();
        cargoService.getCargos().then(data => setCargos(data));
    };
    const listarEmpleadoCargos = () => {
        const empleadoCargoService = new EmpleadoCargoService();
        empleadoCargoService.getEmpleadoCargos().then(data => setEmpleadoCargos(data));
    };


    useEffect(async () => {
        listarEmpleados();
        await listarTipoDocumentos();
        listarEmpleados();
        listarCargos();
        listarEmpleadoCargos();
        console.log(listarEmpleadoCargos());

    }, []);


    const openNew = () => {
        setEmpleado(emptyEmpleado);
        setTipoDocumento(null);
        setCalendarValueNac(null);
        setCalendarValueIn(null);
        setCargo(null);
        setCambioCargo(false);
        setValorActCargo(cargoVacio);
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

    const pasoRegistro = () => {
        listarEmpleados();
        setEmpleadoDialog(false);
        setEmpleado(emptyEmpleado);
    }

    const saveEmpleado = async () => {
        setSubmitted(true);
        const empleadoservice = new EmpleadoService();
        const empleadoCargoService = new EmpleadoCargoService();
        //
        var fechaHoy = new Date();
        let fechaActual = `${fechaHoy.getFullYear()}-${fechaHoy.getMonth() + 1}-${fechaHoy.getDate()}`;
        //_empleadoCargo.fechaInicio = new Date();
        empleadoCargo.fechaInicio = new Date();
        if (empleado.idEmpleado) {
            let _empleadoCargo = { ...empleadoCargo };
            let _valorAct = { ...valorActCargo };
            // const miCargo = empleadoCargos.find((item) => {
            //     if (item.idEmpleado == empleado.idEmpleado && item.fechaFinal == null) {
            //         return item;
            //     };

            // });
            //console.log(miCargo.fechaInicio);
            console.log(fechaActual);
            try {
                console.log(cambioCargo);
                console.log(_valorAct.idCargo);
                if (cambioCargo) {
                    if (cargo.idCargo == _valorAct.idCargo) {
                        toast.current.show({ severity: 'info', summary: 'Aviso', detail: "Se detectó un cambio en el cargo pero no se actualizará el mismo", life: 3000 });
                    } else {
                        if (miCargo.fechaInicio == fechaActual) {
                            toast.current.show({ severity: 'error', summary: 'Error', detail: "Se ha actualizado o registrado recientemente un cargo a este empleado, modificar despues de 24hrs", life: 3000 });
                        } else {
                            const getfecha = () => {
                                var fec = miCargo.fechaInicio.toString().split('-');
                                return new Date(fec[0], fec[1] - 1, fec[2])
                            }
                            miCargo.fechaInicio = getfecha();
                            miCargo.fechaFinal = new Date(); //arrgalr cambio de fecha!
                            console.log(miCargo);
                            console.log(empleado);
                            //await empleadoCargoService.updateEmpleadoCargo(miCargo)
                            //await empleadoservice.updateEmpleado(empleado);
                            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Empleado y Cargo Actualizado', life: 3000 });
                            console.log("Ahorita lo asciendo perro");
                        }
                        console.log("Lo cambiaste puto");
                    }
                } else {
                    await empleadoservice.updateEmpleado(empleado);
                    toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Empleado Actualizado', life: 3000 });
                    pasoRegistro();
                }


            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });
            }
        } else {
            try {
                const response = await empleadoservice.addEmpleado(empleado);
                //empleadoCargo.idEmpleado = response.idEmpleado;
                //await empleadoCargoService.addEmpleadoCargo(empleadoCargo);
                //console.log(response.idEmpleado)
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Empleado Registrado', life: 3000 });
                pasoRegistro();
                //listarEmpleadoCargos();
            } catch (error) {
                console.log(error)
                console.log(empleado);
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });
            }
        };
    };

    const editEmpleado = (empleado, empleadoCargo) => {
        setEmpleado({ ...empleado });
        setEmpleadoCargo({ ...empleadoCargo })
        console.log(empleadoCargo);
        const fechaN = () => {
            var nacimiento = empleado.fechaNacimiento.toString().split('-');
            return new Date(nacimiento[0], nacimiento[1] - 1, nacimiento[2])
        }
        const fechaI = () => {
            var ingreso = empleado.fechaIngreso.toString().split('-');
            return new Date(ingreso[0], ingreso[1] - 1, ingreso[2])
        }
        const documento = tipoDocumentos.find((item) => {
            if (item.idTipoDocumento == empleado.idTipoDocumento)
                return item
        });
        setTipoDocumento(documento);
        setCalendarValueNac(fechaN)
        console.log(fechaN.toString());
        setCalendarValueIn(fechaI);
        console.log(fechaI.toString());
        console.log(empleadoCargos);
        // const miCargo = empleadoCargos.find((item) => {
        //     if (item.idEmpleado == empleado.idEmpleado && item.fechaFinal == null) {
        //         return item;
        //     }

        // });
        //console.log(miCargo);
        // cargos.find((item) => {
        //     if (item.idCargo == miCargo.idCargo) {
        //         setCargo(item);
        //         setValorActCargo(item)
        //         //valorActualCargo= item.idCargo;
        //     }
        // });
        //console.log(valorActualCargo);
        setEmpleadoDialog(true);
    };

    const deleteEmpleado = async () => {
        try {
            const empleadoservice = new EmpleadoService();
            await empleadoservice.removeEmpleado(empleado.idEmpleado);
            listarEmpleados();
            setDeleteEmpleadoDialog(false);
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Empleado Eliminado', life: 3000 });
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        }
       
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
        let _empleadoCargo = { ...empleadoCargo };
        switch (nombre) {
            case "idTipoDocumento":
                _empleado[`${nombre}`] = val.idTipoDocumento;
                setTipoDocumento(e.value);
                break;
            case "fechaNacimiento":
                _empleado[`${nombre}`] = val;
                setCalendarValueNac(e.value);
                break;
            case "fechaIngreso":
                _empleado[`${nombre}`] = val;
                setCalendarValueIn(e.value);
                break;
            case "idCargo":
                _empleadoCargo[`${nombre}`] = val.idCargo;
                setCambioCargo(true);
                setCargo(e.value);
                break;
            default:
                _empleado[`${nombre}`] = val;
                break;
        }
        // console.log(val);
        // console.log(val.idTipoDocumento);
        // console.log(val.fechaNacimiento);
        // console.log(val.fechaIngreso);
        // console.log(calendarValueIn);
        // console.log(calendarValueNac);
        // console.log(_empleado)
        setEmpleado(_empleado);
        //setEmpleadoCargo(_empleadoCargo);
    };
    const onCellEditComplete = async (e) => {
        let { rowData, newValue, field, originalEvent: event } = e;
        let min_date = getFecha(minDate);
        let max_date = getFecha(maxDate);
        let precio = { ...precioHistoricoVacio };
        precio = rowData;

        try {

            if (newValue != null && (precio.fechaFinal == min_date || precio.fechaFinal == max_date)) {
                let fecha = new Date(newValue);
                let fechaActualizar = getFecha(fecha);
                precio[field] = fechaActualizar;
                //actualizar BD
                const precioHistoricoService = new PrecioHistoricoRepuestoService();
                precioHistoricoService.updatePrecioHistorico(precio);
            } else {
                event.preventDefault();
            }
            listarPrecios();
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });
        }
    };

    // const toggleAll = () => {
    //     if (allExpanded) collapseAll();
    //     else expandAll();
    // };

    // const expandAll = () => {
    //     let _expandedRows = {};
    //     cargos.forEach((p) => (_expandedRows[`${p.idCargo}`] = true));

    //     setExpandedRows(_expandedRows);
    //     setAllExpanded(true);
    // };

    // const collapseAll = () => {
    //     setExpandedRows(null);
    //     setAllExpanded(false);
    // };
    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                    {/* <Button icon={allExpanded ? 'pi pi-minus' : 'pi pi-plus'} label={allExpanded ? 'Colapsar Todas' : 'Expandir Todas'} onClick={toggleAll} className="w-12rem"
                        disabled={!empleados || !empleados.length} /> */}
                </div>
            </React.Fragment>
        )
    }

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
            if (item.idTipoDocumento == rowData.idTipoDocumento)
                return item;
        });
        console.log(documento)
        if (documento != null) {
            return (
                <>
                    <span className="p-column-title">Id Tipo Documento</span>
                    {
                        documento.nombreDocumento
                    }

                </>
            );
        } else {
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
        var dateDMY = Moment(rowData.fechaNacimiento).format('DD/MM/YYYY');
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
    const cargoBodyTemplate = (rowData) => {
        const cargo = cargos.find((item) => {
            if (item.idCargo == rowData.idCargo)
                return item;

        });
        if (cargo !== null) {
            return (
                <>
                    <span className="p-column-title">Cargo</span>
                    {cargo.nombre}
                </>
            );

        } else {
            return (
                <>
                    <span className="p-column-title">Cargo</span>
                    {rowData.idCargo}
                </>
            );

        }



    };

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editEmpleado(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning" onClick={() => confirmDeleteEmpleado(rowData)} />
            </>
        );
    };
    const rowExpansionTemplate = (data) => {
        let table = [];
        empleadoCargos.map((item) => {
            if (item.idEmpleado == data.idEmpleado) {
                table.push(item);
            }
        });
        return (
            <div className="orders-subtable">
                <h5> Histórico cargos: {data.nombre}</h5>
                <DataTable value={table}
                    editMode="cell"
                    className="editable-cells-table"
                    responsiveLayout="scroll"
                    emptyMessage="No se encontraron cargos asignados.">
                    <Column field="fechaInicio" header="Fecha Inicial" sortable headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                    <Column key="fechaFinal" field="fechaFinal" header="Fecha Final" sortable headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                    <Column field="cargo" header="Cargo" body={cargoBodyTemplate} sortable headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                </DataTable>
            </div>
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
                        expandedRows={expandedRows}
                        onRowToggle={(e) => setExpandedRows(e.data)}
                        rowExpansionTemplate={rowExpansionTemplate}
                    >
                        {/* <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column> */}
                        {/* <Column expander style={{ width: '3em' }} /> */}
                        <Column field="idEmpleado" header="ID" sortable body={idBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="nombre" header="Nombre" sortable body={nombreBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="documento" header="Documento" sortable body={documentoBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="idTipoDocumento" header="Tipo Documento" sortable body={idTipoDocumentoBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="fechaNacimiento" header="Fecha Nacimiento" sortable body={fechaNacimientoBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="telefono" header="Teléfono" sortable body={telefonoBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="fechaIngreso" header="Fecha Ingreso" sortable body={fechaIngresoBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="correo" header="Correo electrónico" sortable body={correoBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="direccion" header="Dirección" sortable body={direccionBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column header="Acciones" body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={empleadoDialog} style={{ width: '450px' }} header="Registro Empleados" modal className="p-fluid" footer={empleadoDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="nombre">Nombre</label>
                            <InputText id="nombre" value={empleado.nombre} onChange={(e) => onInputChange(e, 'nombre')} required autoFocus className={classNames({ 'p-invalid': submitted && !empleado.nombre })} tooltip="Ingrese un nombre 🖊️📋" />
                            {submitted && !empleado.nombre && <small className="p-invalid">Nombre es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="documento">Documento</label>
                            <InputText id="documento" value={empleado.documento} onChange={(e) => onInputChange(e, 'documento')} className={classNames({ 'p-invalid': submitted && !empleado.documento })} tooltip="Ingrese una descripción relacionada al permiso 🖊️📋" />
                            {submitted && !empleado.documento && <small className="p-invalid">Documento es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="idTipoDocumento">Tipo Documento</label>
                            <Dropdown id="idTipoDocumento" options={tipoDocumentos} value={tipoDocumento} onChange={(e) => onInputChange(e, 'idTipoDocumento')} optionLabel="nombreDocumento" placeholder="Seleccione un tipo de Documento" className={classNames({ 'p-invalid': submitted && !empleado.idTipoDocumento })}></Dropdown>
                            {submitted && !empleado.idTipoDocumento && <small className="p-invalid">Tipo Documento es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="fechaNacimiento">Fecha Nacimiento </label>
                            <Calendar dateFormat="dd/mm/yy" showIcon showButtonBar value={calendarValueNac} onChange={(e) => onInputChange(e, 'fechaNacimiento')} placeholder="Seleccione una fecha de nacimiento"></Calendar>
                            {submitted && !empleado.fechaNacimiento && <small className="p-invalid">Fecha de Nacimiento es requerida.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="telefono">Teléfono</label>
                            <InputText id="telefono" value={empleado.telefono} onChange={(e) => onInputChange(e, 'telefono')} className={classNames({ 'p-invalid': submitted && !empleado.telefono })} tooltip="Ingrese un numero de telefono valido 🖊️📋" />
                            {submitted && !empleado.telefono && <small className="p-invalid">Teléfono es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="fechaIngreso">Fecha Ingreso</label>
                            <Calendar dateFormat="dd/mm/yy" showIcon showButtonBar value={calendarValueIn} onChange={(e) => onInputChange(e, 'fechaIngreso')} placeholder="Seleccione una fecha de ingreso"></Calendar>
                            {submitted && !empleado.fechaIngreso && <small className="p-invalid">Fecha de Ingreso es requerida.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="correo">Correo Electrónico</label>
                            <InputText id="correo" value={empleado.correo} onChange={(e) => onInputChange(e, 'correo')} className={classNames({ 'p-invalid': submitted && !empleado.correo })} tooltip="Ingrese un correo electronico valido 🖊️📋" />
                            {submitted && !empleado.correo && <small className="p-invalid">Correo electrónico es requerido.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="direccion">Dirección</label>
                            <InputText id="direccion" value={empleado.direccion} onChange={(e) => onInputChange(e, 'direccion')} className={classNames({ 'p-invalid': submitted && !empleado.direccion })} tooltip="Ingrese una dirección u/o ubicación 🖊️📋" />
                            {submitted && !empleado.direccion && <small className="p-invalid">Dirección es requerido.</small>}
                        </div>
                        {/* <div className="field">
                            <label htmlFor="idCargo">Cargo</label>
                            <Dropdown id="idCargo" options={cargos} value={cargo} onChange={(e) => onInputChange(e, 'idCargo')} optionLabel="nombre" placeholder="Seleccione un cargo" className={classNames({ 'p-invalid': submitted && !empleadoCargo.idCargo })}></Dropdown>
                            {submitted && !empleadoCargo.idCargo && <small className="p-invalid">Cargo es requerido.</small>}
                        </div> */}

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