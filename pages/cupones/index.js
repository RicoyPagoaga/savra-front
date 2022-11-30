import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { CuponService } from '../../demo/service/CuponService';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
 
import Moment from 'moment';

const Cupones = () => {
    let cuponVacio = {
        idCupon: null,
        codigo: '',
        fechaEmision: null,
        fechaCaducidad: null,
        activo: 1,
        porcentajeDescuento: null,
    };

    const [cupons, setCupons] = useState();
    const [cuponDialog, setCuponDialog] = useState(false);
    const [activarDesactivarCuponDialog, setActivarDesactivarCuponDialog] = useState(false);
    const [activarDesactivarCuponsDialog, setActivarDesactivarCuponsDialog] = useState(false);
    const [cupon, setCupon] = useState(cuponVacio);
    const [selectedCupons, setSelectedCupons] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    //const [filter,setFilter] = useState(null);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [fechaE,setFechaE] = useState(null);
    const [fechaC,setFechaC] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);

    const listarCupons = () => {
        const cuponService = new CuponService();
        cuponService.getCupones().then(data => setCupons(data));
    };

    useEffect(() => {
        listarCupons();
    }, []);

    const openNew = () => {
        setCupon(cuponVacio);
        setFechaE(null);
        setFechaC(null);
        setSubmitted(false);
        setCuponDialog(true);
    }

    const hideDialog = () => {
        setSubmitted(false);
        setCuponDialog(false);
    }

    const hideDeleteCuponDialog = () => {
        setActivarDesactivarCuponDialog(false);
    }

    const pasoRegistro = () => {
        listarCupons();
        setCuponDialog(false);
        setCupon(cuponVacio); 
    }

    const saveCupon = async () => {
        setSubmitted(true);
            if (cupon.idCupon) {
               try {
                    const cuponService = new CuponService();
                    await cuponService.updateCupon(cupon);
                    toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Cupón Actualizado', life: 3000 });
                    pasoRegistro();
                } catch (error) {
                    console.log(cupon);
                    toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });
                }
            }
            else {
                try {
                    const cuponService = new CuponService();
                    await cuponService.addCupon(cupon);
                    toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Cupón Creado', life: 3000 });
                    pasoRegistro();
                } catch (error) {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });                    
    
                }
            }
        
    }

    const editCupon = (cupon) => {
        const fechaE = () => {
            var emision = cupon.fechaEmision.toString().split('-');
            return new Date(emision[0],emision[1]-1,emision[2])
        }
        const fechaC = () => {
            var caducidad = cupon.fechaCaducidad.toString().split('-');
            return new Date(caducidad[0],caducidad[1]-1,caducidad[2])
        }
        setFechaE(fechaE);
        setFechaC(fechaC);
        setCupon({ ...cupon});
        setCuponDialog(true);
    }

    const confirmBloquearDesbloquearCupon = (cupon) => {
        setCupon(cupon);
        setActivarDesactivarCuponDialog(true);
    }

    const activarDesactivarCupon = async () => {
        try{
        const cuponService = new CuponService();
        cupon.activo = cupon.activo==1?0:1;
        console.log(cupon.idCupon)
        await cuponService.activarDesactivarCupon(cupon.activo,cupon.idCupon);
        listarCupons();
        setActivarDesactivarCuponDialog(false);
        toast.current.show({ severity: 'success', summary: 'Éxito', detail: `Cupon ${cupon.activo==1?'activado':'desactivado'}`, life: 3000 });
        }catch(error){
            toast.current.show({ severity: 'error', summary: 'Error', detail: "error.errorMessage", life: 3000 });                    
        }
    }

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const deleteSelectedCupons = async () => {
        const cuponService = new CuponService();
        selectedCupons.map(async (cupon) => {
            await cuponService.removeCupon(cupon.idCupon);
        });
        let _cupons = cupons.filter((val) => !selectedCupons.includes(val));
        setCupons(_cupons);
        setDeleteCuponsDialog(false);
        setSelectedCupons(null);
        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Cupones Eliminados', life: 3000 });
    }


    const onInputChange = (e, nombre) => {
        const val = (e.target && e.target.value) || '';
        let _cupon = { ...cupon };
        if(nombre == 'fechaEmision'){
            _cupon[`${nombre}`] = val;
            setFechaE(e.value);
        }else if (nombre == 'fechaCaducidad'){
            _cupon[`${nombre}`] = val;
            setFechaC(e.value);
        }else{
            _cupon[`${nombre}`] = val;
        }
        //console.log(cupon.porcentajeDescuento);
        setCupon(_cupon);
    }


    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                    
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
                <span className="p-column-title">ID Cupon</span>
                {rowData.idCupon}
            </>
        );
    }
    const codigoBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Codigo</span>
                {rowData.codigo}
            </>
        );
    }
    const fechaEmisionBodyTemplate = (rowData) => {
        var dateDMY = Moment(rowData.fechaEmision).format('DD/MM/YYYY');
        return (
            <>
                <span className="p-column-title">Fecha Emision</span>
                {dateDMY}
            </>
        );
    }
    const fechaCaducidadBodyTemplate = (rowData) => {
        var dateDMY = Moment(rowData.fechaCaducidad).format('DD/MM/YYYY');
        return (
            <>
                <span className="p-column-title">Fecha Caducidad</span>
                {dateDMY}
            </>
        );
    }
    const porcentaDescBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Porcenta Descuento</span>
                {rowData.porcentajeDescuento}
            </>
        );
    }
    const estadoBodyTemplate = (rowData) => {
        if(rowData.activo == 1 ){
            return (
                <>
                    <span className={`customer-badge status-qualified`}>Activo</span>
                </>
            );
        }else{
            return (
                <>
                    <span className={`customer-badge status-unqualified`}>Inactivo</span>
                </>
            );
        }
        
    }
    const actionBodyTemplate = (rowData) => {
        let iconResult = ''
        if(rowData.activo == 1){
            iconResult = 'pi pi-lock-open'
        }else{
            iconResult = 'pi pi-lock'
        }
        return (
            <div className="actions">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editCupon(rowData)} />
                <Button icon= {iconResult} className="p-button-rounded p-button-secondary mt-2" onClick={() => confirmBloquearDesbloquearCupon(rowData)} />
            </div>
        );
    }
    //const onGlobalFilterChange = (e) => {
      //  const value = e.target.value;
        //let _filters = {...filter};
        //_filters['global'].value = value;
        //setFilter(_filters)
        //setGlobalFilter(value)
    //} 

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Listado de Cupones</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const cuponDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" className="p-button-text" onClick={saveCupon}/>
        </>
    );
    const activarDesactivarCuponDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteCuponDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={activarDesactivarCupon} />
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
                        value={cupons}
                        selection={selectedCupons}
                        onSelectionChange={(e) => setSelectedCupons(e.value)}
                        dataKey="idCupon"
                        //filters = {filter}
                        globalFilter={globalFilter}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} Cupones" 
                        //globalFilter={globalFilter}
                        emptyMessage="No se encontraron cupones."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem'}}></Column>
                        <Column field="idCupon" header="ID" sortable body={idBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="codigo" header="Código" sortable body={codigoBodyTemplate} headerStyle={{ width: '14%', minWidth: '15rem' }}></Column>
                        <Column field="fechaEmision" header="Fecha Emisión" sortable body={fechaEmisionBodyTemplate} headerStyle={{ width: '14%', minWidth: '12rem' }}></Column>
                        <Column field="fechaCaducidad" header="Fecha Caducidad" sortable body={fechaCaducidadBodyTemplate} headerStyle={{ width: '14%', minWidth: '12rem' }}></Column>
                        <Column field="porcentaDescuento" header="Porcentaje Descuento" sortable body={porcentaDescBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="activo" header="Estado" sortable body={estadoBodyTemplate} headerStyle={{ width: '14%', minWidth: '12rem' }}></Column>
                        <Column header="Acciones" body={actionBodyTemplate}></Column>
                    </DataTable>

                    <Dialog visible={cuponDialog} style={{ width: '450px' }} header="Registro Cupones" modal className="p-fluid" footer={cuponDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="codigo">Código</label>
                            <InputText id="codigo" value={cupon.codigo} onChange={(e) => onInputChange(e, 'codigo')} required autoFocus tooltip="Escribe el nombre como se identificará el cupón" className={classNames({ 'p-invalid': submitted && !cupon.codigo })} />
                            { submitted && !cupon.codigo && <small className="p-invalid">Código es requerido.</small> }
                        </div>
                        <div className="field">
                            <label htmlFor="fechaEmision">Fecha Emisión </label>
                            <Calendar dateFormat= "dd/mm/yy" showIcon showButtonBar value={fechaE} onChange={(e) => onInputChange(e,'fechaEmision')} placeholder="Seleccione una fecha de emisión"></Calendar>
                            {submitted && !cupon.fechaEmision && <small className="p-invalid">Fecha de Emisión es requerida.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="fechaCaducidad">Fecha Caducidad</label>
                            <Calendar dateFormat= "dd/mm/yy" showIcon showButtonBar value={fechaC} onChange={(e) => onInputChange(e,'fechaCaducidad')} placeholder="Seleccione una fecha de caducidad"></Calendar>
                            {submitted && !cupon.fechaCaducidad && <small className="p-invalid">Fecha de Caducidad es requerida.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="porcentaDescuento">Porcentaje Descuento</label>
                            <InputNumber id="porcentajeDescuento" value={cupon.porcentajeDescuento} onValueChange={(e) => onInputChange(e, 'porcentajeDescuento')} suffix="%" tooltip="Escribe solamente el número (sin su tanto porciento) del porcentaje que deseas aplicar" className={classNames({ 'p-invalid': submitted && !cupon.porcentajeDescuento })} />
                            { submitted && !cupon.porcentajeDescuento && <small className="p-invalid">Porcentaje descuento es requerido.</small> }
                        </div>
                    </Dialog> 

                    <Dialog visible={activarDesactivarCuponDialog} style={{ width: '450px' }} header="Confirmar" modal footer={activarDesactivarCuponDialogFooter} onHide={hideDeleteCuponDialog}>
                    
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {cupon && <span>¿Está seguro de que desea <b>{cupon.activo==1?"desactivar a":"activar a"} {cupon.codigo}</b>?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Cupones;
