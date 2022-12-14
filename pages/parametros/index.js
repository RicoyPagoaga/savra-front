import getConfig from 'next/config';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputMask } from 'primereact/inputmask';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { ParametroFacturaService } from '../../demo/service/ParametroFacturaService';
import Moment from 'moment';


const ParametrosFactura = () => {
    let emptyParametroFactura = {
        idParametro: null,
        cai: '',
        rangoInicial: '',
        rangoFinal: '',
        fechaLimiteEmision: null,
        fechaInicio: null,
        ultimaFactura: null
    };

    let emptyRestApiError = {
        httpStatus: '',
        errorMessage: '',
        errorDetails: ''
    };

    const [valueCai, setValueCai] = useState(null);
    const [parametrosFactura, setParametrosFactura] = useState();
    const [fechaLE, setFechaLE] = useState(null);
    const [fechaI, setFechaI] = useState(null);
    const [parametrofacturaDialog, setParametroFacturaDialog] = useState(false);
    const [deleteParametroFacturaDialog, setDeleteParametroFacturaDialog] = useState(false);
    const [deleteParametrosFacturaDialog, setDeleteParametrosFacturaDialog] = useState(false);
    const [parametrofactura, setParametroFactura] = useState(emptyParametroFactura);
    const [apiError, setApiError] = useState(emptyRestApiError);
    const [selectedParametrosFactura, setSelectedParametrosFactura] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [valueRangoI, setValueRangoI] = useState(null);
    const [valueRangoF, setValueRangoF] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;


    const listarParametrosFactura = () => {
        const parametrofacturaservice = new ParametroFacturaService();
        parametrofacturaservice.getParametrosFactura().then(data => setParametrosFactura(data));
    };

    useEffect(async () => {
        listarParametrosFactura();
    }, []);


    const openNew = () => {
        setParametroFactura(emptyParametroFactura);
        setValueCai(null);
        setValueRangoI(null);
        setValueRangoF(null);
        setFechaLE(null);
        setFechaI(null);
        setSubmitted(false);
        setParametroFacturaDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setParametroFacturaDialog(false);
    };

    const hideDeleteParametroFacturaDialog = () => {
        setDeleteParametroFacturaDialog(false);
    };

    const hideDeleteParametrosFacturaDialog = () => {
        setDeleteParametrosFacturaDialog(false);
    };

    const pasoRegistro = () => {
        listarParametrosFactura();
        setParametroFacturaDialog(false);
        setParametroFactura(emptyParametroFactura);
    }

    const saveParametroFactura = async () => {
        setSubmitted(true);
        const parametrofacturaservice = new ParametroFacturaService();
        let valor = parametrofactura.rangoInicial.toString().split('-');
        let valorU = new Number(valor[3]);
        if (parametrofactura.idParametro) {
            try {
                await parametrofacturaservice.updateParametroFactura(parametrofactura);
                toast.current.show({ severity: 'success', summary: '??xito', detail: 'Par??metro Factura Actualizado', life: 3000 });
                pasoRegistro();
            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });
            }
        } else {
            try {
                
                parametrofactura.ultimaFactura = valorU-1;
                await parametrofacturaservice.addParametroFactura(parametrofactura);
                toast.current.show({ severity: 'success', summary: '??xito', detail: 'Par??metro Factura Registrado', life: 3000 });
                pasoRegistro();
            } catch (error) {
                console.log(parametrofactura);
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });
            }
        };
    };

    const editParametroFactura = (parametrofactura) => {
        setParametroFactura({ ...parametrofactura });
        setValueCai(parametrofactura.cai);
        setValueRangoI(parametrofactura.rangoInicial);
        setValueRangoF(parametrofactura.rangoFinal);
        const fechaLimite = () => {
            var limite = parametrofactura.fechaLimiteEmision.toString().split('-');
            return new Date(limite[0], limite[1] - 1, limite[2])
        }
        const fechaIn = () => {
            var inicio = parametrofactura.fechaInicio.toString().split('-');
            return new Date(inicio[0], inicio[1] - 1, inicio[2])
        }
        setFechaLE(fechaLimite);
        setFechaI(fechaIn)
        setParametroFacturaDialog(true);
    };

    const deleteParametroFactura = async () => {
        const parametrofacturaservice = new ParametroFacturaService();
        await parametrofacturaservice.removeParametroFactura(parametrofactura.idParametro);
        listarParametrosFactura();
        setDeleteParametroFacturaDialog(false);
        toast.current.show({ severity: 'success', summary: '??xito', detail: 'Par??metro Factura Eliminado', life: 3000 });
    };
    const confirmDeleteParametroFactura = (parametrofactura) => {
        setParametroFactura(parametrofactura);
        setDeleteParametroFacturaDialog(true);
    };

    const exportCSV = () => {
        dt.current.exportCSV();
    };
    const confirmDeleteSelected = () => {
        setDeleteParametrosFacturaDialog(true);
    }
    const deleteSelectedParametrosFactura = () => {
        const parametrofacturaService = new ParametroFacturaService();
        selectedParametrosFactura.map(async (parametrofactura) => {
            await parametrofacturaService.removeParametroFactura(parametrofactura.idParametro);
        });
        let _parametrosfactura = parametrosFactura.filter((val) => !selectedParametrosFactura.includes(val));
        setParametrosFactura(_parametrosfactura);
        setDeleteParametrosFacturaDialog(false);
        setSelectedParametrosFactura(null);
        toast.current.show({ severity: 'success', summary: '??xito', detail: 'Par??metros Factura Eliminados', life: 3000 });
    };

    const onInputChange = (e, nombre) => {
        const val = (e.target && e.target.value) || '';
        let _parametrofactura = { ...parametrofactura };
        switch (nombre) {
            case "cai":
                _parametrofactura[`${nombre}`] = val;
                setValueCai(e.value);
                break;
            case "rangoInicial":
                _parametrofactura[`${nombre}`] = val;
                setValueRangoI(e.value);
                break;
            case "rangoFinal":
                _parametrofactura[`${nombre}`] = val;
                setValueRangoF(e.value);
                break;
            case "fechaLimiteEmision":
                _parametrofactura[`${nombre}`] = val;
                setFechaLE(e.value);
                break;
            case "fechaInicio":
                _parametrofactura[`${nombre}`] = val;
                setFechaI(e.value);
                break;
            default:
                _parametrofactura[`${nombre}`] = val;
                break;
        }
        console.log(_parametrofactura);
        setParametroFactura(_parametrofactura);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                    <Button label="Eliminar" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedParametrosFactura || !selectedParametrosFactura.length} />
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
                <span className="p-column-title">ID Parametro Factura</span>
                {rowData.idParametro}
            </>
        );
    };

    const caiBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">CAI</span>
                {rowData.cai}
            </>
        );
    };

    const rangoInicialBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Rango Inicial</span>
                {rowData.rangoInicial}
            </>
        );
    };
    const rangoFinalBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Rango Final</span>
                {rowData.rangoFinal}
            </>
        );
    };
    const fechaLimiteEmisionBodyTemplate = (rowData) => {
        var dateDMY = Moment(rowData.fechaLimiteEmision).format('DD/MM/YYYY');
        return (
            <>
                <span className="p-column-title">Fecha Limite Emisi??n</span>
                {dateDMY}
            </>
        );
    };
    const fechaLimiteInicioBodyTemplate = (rowData) => {
        var dateDMY = Moment(rowData.fechaInicio).format('DD/MM/YYYY');
        return (
            <>
                <span className="p-column-title">Fecha Inicio</span>
                {dateDMY}
            </>
        );
    };
    const ultimaFacturaBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Ultima Factura</span>
                {rowData.ultimaFactura}
            </>
        );
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <>
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editParametroFactura(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning" onClick={() => confirmDeleteParametroFactura(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Listado de Par??metros Factura</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const parametrofacturaDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Registar" icon="pi pi-check" className="p-button-text" onClick={saveParametroFactura} />
        </>
    );
    const deleteParametroFacturaDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteParametroFacturaDialog} />
            <Button label="Si" icon="pi pi-check" className="p-button-text" onClick={deleteParametroFactura} />
        </>
    );
    const deleteParametrosFacturaDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteParametrosFacturaDialog} />
            <Button label="Si" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedParametrosFactura} />
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
                        value={parametrosFactura}
                        selection={selectedParametrosFactura}
                        onSelectionChange={(e) => setSelectedParametrosFactura(e.value)}
                        dataKey="idParametro"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Par??metros de Factura"
                        globalFilter={globalFilter}
                        emptyMessage="No se encontrar??n par??metros de factura."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                        <Column field="idParametroFactura" header="ID" sortable body={idBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="cai" header="CAI" sortable body={caiBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="rangoInicial" header="Rango Inicial" sortable body={rangoInicialBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="rangoFinal" header="Rango Final" sortable body={rangoFinalBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="fechaLimiteEmision" header="Fecha L??mite Emisi??n" sortable body={fechaLimiteEmisionBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="fechaInicio" header="Fecha Inicio" sortable body={fechaLimiteInicioBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="ultimaFactura" header="??ltima Factura" sortable body={ultimaFacturaBodyTemplate} headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column header="Acciones" body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={parametrofacturaDialog} style={{ width: '450px' }} header="Registro Par??metros Factura" modal className="p-fluid" footer={parametrofacturaDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="cai">CAI</label>
                            <InputMask id="cai" value={valueCai} onChange={(e) => onInputChange(e, 'cai')} mask="******-******-******-******-******-**" slotChar="######-######-######-######-######-##" className={classNames({ 'p-invalid': submitted && !parametrofactura.cai })} />
                            {submitted && !parametrofactura.cai && <small className="p-invalid">CAI es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="rangoInicial">Rango Inicial</label>
                            <InputMask id="rangoInicial" value={valueRangoI} onChange={(e) => onInputChange(e, 'rangoInicial')} mask="999-999-99-99999999" slotChar="xxx-xxx-xx-xxxxxxxx" tooltip="Ejemplo d??gitos rango  aurorizado desde: 000-001-01-00000000" className={classNames({ 'p-invalid': submitted && !parametrofactura.rangoInicial })} />
                            {submitted && !parametrofactura.rangoInicial && <small className="p-invalid">Rango Inicial es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="rangoFinal">Rango Final</label>
                            <InputMask id="rangoFinal" value={valueRangoF} onChange={(e) => onInputChange(e, 'rangoFinal')} mask="999-999-99-99999999" slotChar="xxx-xxx-xx-xxxxxxxx" tooltip="Ejemplo d??gitos rango  aurorizado hasta: 000-001-01-00010000 " className={classNames({ 'p-invalid': submitted && !parametrofactura.rangoFinal })} />
                            {submitted && !parametrofactura.rangoFinal && <small className="p-invalid">Rango Final es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="fechaLimiteEmision">Fecha L??mite de Emisi??n</label>
                            <Calendar dateFormat="dd/mm/yy" showIcon showButtonBar value={fechaLE} onChange={(e) => onInputChange(e, 'fechaLimiteEmision')} tooltip="La fecha l??mite de emisi??n de este par??metro deber ser posterior a una fecha actual." placeholder="Seleccione una fecha limite de Emisi??n"></Calendar>
                            {submitted && !parametrofactura.fechaLimiteEmision && <small className="p-invalid">Fecha L??mite de Emisi??n es requerida.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="fechaInicio">Fecha Inicio</label>
                            <Calendar dateFormat="dd/mm/yy" showIcon showButtonBar value={fechaI} onChange={(e) => onInputChange(e, 'fechaInicio')} tooltip="Selecciona la fecha en que empezar?? a operar este par??metro, que debera ser la fecha de su registro." placeholder="Seleccione una fecha de Inicio"></Calendar>
                            {submitted && !parametrofactura.fechaInicio && <small className="p-invalid">Fecha Inicio es requerida.</small>}
                        </div>
                        {/* <div className="field">
                            <label htmlFor="direccion">??ltima Factura</label>
                            <InputText id="direccion" type="number" value={parametrofactura.ultimaFactura} onChange={(e) => onInputChange(e, 'ultimaFactura')} className={classNames({ 'p-invalid': submitted && !parametrofactura.ultimaFactura })} />
                            {submitted && !parametrofactura.ultimaFactura && <small className="p-invalid">Direcci??n es requerido.</small>}
                        </div> */}

                    </Dialog>

                    <Dialog visible={deleteParametroFacturaDialog} style={{ width: '450px' }} header="Confirmaci??n" modal footer={deleteParametroFacturaDialogFooter} onHide={hideDeleteParametroFacturaDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {parametrofactura && (
                                <span>
                                    Esta seguro que desea eliminar a <b>{parametrofactura.cai}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteParametrosFacturaDialog} style={{ width: '450px' }} header="Confirmaci??n" modal footer={deleteParametrosFacturaDialogFooter} onHide={hideDeleteParametrosFacturaDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {parametrofactura && <span>Esta seguro que desea eliminar los siguientes Par??metros Factura?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};
export default ParametrosFactura;