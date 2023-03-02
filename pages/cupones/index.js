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
import { autenticacionRequerida } from '../../utils/AutenticacionRequerida';
import { useSession } from 'next-auth/react'

import Moment from 'moment';

const Cupones = () => {
    let cuponVacio = {
        idCupon: null,
        codigo: '',
        fechaEmision: null,
        fechaCaducidad: null,
        cantidadMaxima: 1,
        cantidadDisponible: 1,
        activo: 1,
        porcentajeDescuento: null,
    };

    const [cupons, setCupons] = useState([]);
    const [cuponDialog, setCuponDialog] = useState(false);
    const [activarDesactivarCuponDialog, setActivarDesactivarCuponDialog] = useState(false);
    const [activarDesactivarCuponsDialog, setActivarDesactivarCuponsDialog] = useState(false);
    const [cupon, setCupon] = useState(cuponVacio);
    const [selectedCupons, setSelectedCupons] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    //const [filter,setFilter] = useState(null);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [fechaE, setFechaE] = useState(null);
    const [fechaC, setFechaC] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const [cantidadDefault, setCantidadDefault] = useState(true);
    const { data: session } = useSession();

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
        setCantidadDefault(true);
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
            return new Date(emision[0], emision[1] - 1, emision[2])
        }
        const fechaC = () => {
            var caducidad = cupon.fechaCaducidad.toString().split('-');
            return new Date(caducidad[0], caducidad[1] - 1, caducidad[2])
        }
        setFechaE(fechaE);
        setFechaC(fechaC);
        setCupon({ ...cupon });
        setCantidadDefault(false)
        setCuponDialog(true);
    }

    const confirmBloquearDesbloquearCupon = (cupon) => {
        setCupon(cupon);
        setActivarDesactivarCuponDialog(true);
    }

    const activarDesactivarCupon = async () => {
        try {
            const cuponService = new CuponService();
            cupon.activo = cupon.activo == 1 ? 0 : 1;
            console.log(cupon.idCupon)
            await cuponService.activarDesactivarCupon(cupon.activo, cupon.idCupon);
            listarCupons();
            setActivarDesactivarCuponDialog(false);
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: `Cupon ${cupon.activo == 1 ? 'activado' : 'desactivado'}`, life: 3000 });
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: "error.errorMessage", life: 3000 });
        }
    }

    const cols = [
        { field: 'idCupon', header: 'ID' },
        { field: 'codigo', header: 'Códigp' },
        { field: 'fechaEmision', header: 'Feha Emisión' },
        { field: 'fechaCaducidad', header: 'Fecha Caducidad' },
        { field: 'cantidadMaxima', header: 'Cant. Máxima' },
        { field: 'cantidadDisponible', header: 'Cant. Disponible' },
        { field: 'activo', header: 'Estado' },
        { field: 'porcentajeDescuento', header: 'Descuento(%)' }
    ];
    const exportColumns = cols.map(col => ({ title: col.header, dataKey: col.field }));

    let objModificado = cupons.map(function (element) {
        return {
            idCupon: element.idCupon,
            codigo: element.codigo,
            fechaEmision: element.fechaEmision,
            fechaCaducidad: element.fechaCaducidad,
            cantidadMaxima: element.cantidadMaxima,
            cantidadDisponible: element.cantidadDisponible,
            activo: element.activo?'Activo':'Inactivo',
            porcentajeDescuento: element.porcentajeDescuento,
        };
    })

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
                const txtWidth = doc.getStringUnitWidth('CUPONES') * fontSize / doc.internal.scaleFactor;
                const x = (docWidth - txtWidth) / 2;
                image.src = '../layout/images/img_facturalogo2.png';
                doc.addImage(image, 'PNG', 10, 0, 50, 30);
                //centrar texto:
                doc.text('CUPONES', x, 15);
                doc.setFontSize(12);
                doc.text(15, 30, 'Usuario: ' + session.user.name);
                doc.text(15, 36, 'Fecha: ' + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString());
                doc.text(docWidth - 15, 30, 'Total Cupones: ' + cupons.length, { align: "right" });
                doc.line(15, 40, docWidth - 15, 40);
                doc.autoTable(exportColumns, objModificado, { margin: { top: 45, bottom: 25 } });
                const pageCount = doc.internal.getNumberOfPages();
                for (var i = 1; i <= pageCount; i++) {
                    doc.line(15, docHeight - 20, docWidth - 15, docHeight - 20);
                    doc.text('Página ' + String(i) + '/' + pageCount, docWidth - 15, docHeight - 10, { align: "right" });
                }
                doc.save('Reporte_Cupones.pdf');
            });
        });
    };

    const exportExcel = () => {
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(objModificado);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array'
            });

            saveAsExcelFile(excelBuffer, 'Reporte_Cupones');
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
        switch (nombre) {
            case 'fechaEmision':
                _cupon[`${nombre}`] = val;
                setFechaE(e.value);
                break;
            case 'fechaCaducidad':
                _cupon[`${nombre}`] = val;
                setFechaC(e.value);
                break;
            case 'cantidadMaxima':
                _cupon[`${nombre}`] = val;
                if (cantidadDefault) _cupon.cantidadDisponible = val;
                break;
            default:
                _cupon[`${nombre}`] = val;
                break;
        }
        setCupon(_cupon);
        console.log(cupon);
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
                <Button type="button" icon="pi pi-file" onClick={() => exportCSV(false)} className="mr-2" tooltip="CSV" tooltipOptions={{ position: 'bottom' }} />
                <Button type="button" icon="pi pi-file-excel" onClick={exportExcel} className="p-button-success mr-2" tooltip="XLSX" tooltipOptions={{ position: 'bottom' }} />
                <Button type="button" icon="pi pi-file-pdf" onClick={exportPdf} className="p-button-warning mr-2" tooltip="PDF" tooltipOptions={{ position: 'bottom' }} />
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
    const cantidadMaximaBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Cantidad Máxima</span>
                {rowData.cantidadMaxima}
            </>
        );
    }
    const cantidadDisponibleDescBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Cantidad Disponible</span>
                {rowData.cantidadDisponible}
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
        if (rowData.activo == 1) {
            return (
                <>
                    <span className={`customer-badge status-qualified`}>Activo</span>
                </>
            );
        } else {
            return (
                <>
                    <span className={`customer-badge status-unqualified`}>Inactivo</span>
                </>
            );
        }

    }
    const actionBodyTemplate = (rowData) => {
        let iconResult = ''
        if (rowData.activo == 1) {
            iconResult = 'pi pi-lock-open'
        } else {
            iconResult = 'pi pi-lock'
        }
        return (
            <div className="actions">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editCupon(rowData)} />
                <Button icon={iconResult} className="p-button-rounded p-button-secondary mt-2" onClick={() => confirmBloquearDesbloquearCupon(rowData)} />
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
            <Button label="Guardar" icon="pi pi-check" className="p-button-text" onClick={saveCupon} />
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
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                        <Column field="idCupon" header="ID" sortable body={idBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="codigo" header="Código" sortable body={codigoBodyTemplate} headerStyle={{ width: '14%', minWidth: '15rem' }}></Column>
                        <Column field="fechaEmision" header="Fecha Emisión" sortable body={fechaEmisionBodyTemplate} headerStyle={{ width: '14%', minWidth: '12rem' }}></Column>
                        <Column field="fechaCaducidad" header="Fecha Caducidad" sortable body={fechaCaducidadBodyTemplate} headerStyle={{ width: '14%', minWidth: '12rem' }}></Column>
                        {/* <Column field="cantidadMaxima" header="Cantidad Máxima" sortable body={cantidadMaximaBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="cantidadDisponible" header="Cantidad Disponible" sortable body={cantidadDisponibleDescBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column> */}
                        <Column field="porcentaDescuento" header="Porcentaje Descuento" sortable body={porcentaDescBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="activo" header="Estado" sortable body={estadoBodyTemplate} headerStyle={{ width: '14%', minWidth: '12rem' }}></Column>
                        <Column header="Acciones" body={actionBodyTemplate}></Column>
                    </DataTable>

                    <Dialog visible={cuponDialog} style={{ width: '450px' }} header="Registro Cupones" modal className="p-fluid" footer={cuponDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="codigo">Código</label>
                            <InputText id="codigo" value={cupon.codigo} onChange={(e) => onInputChange(e, 'codigo')} required autoFocus tooltip="Escribe el nombre como se identificará el cupón" className={classNames({ 'p-invalid': submitted && !cupon.codigo })} />
                            {submitted && !cupon.codigo && <small className="p-invalid">Código es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="fechaEmision">Fecha Emisión </label>
                            <Calendar dateFormat="dd/mm/yy" showIcon showButtonBar value={fechaE} onChange={(e) => onInputChange(e, 'fechaEmision')} placeholder="Seleccione una fecha de emisión"></Calendar>
                            {submitted && !cupon.fechaEmision && <small className="p-invalid">Fecha de Emisión es requerida.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="fechaCaducidad">Fecha Caducidad</label>
                            <Calendar dateFormat="dd/mm/yy" showIcon showButtonBar value={fechaC} onChange={(e) => onInputChange(e, 'fechaCaducidad')} placeholder="Seleccione una fecha de caducidad"></Calendar>
                            {submitted && !cupon.fechaCaducidad && <small className="p-invalid">Fecha de Caducidad es requerida.</small>}
                        </div>
                        {/* <div className="field">
                            <label htmlFor="cantidadMaxima">Cantidad Máxima</label>
                            <InputNumber id="cantidadMaxima" value={cupon.cantidadMaxima} onValueChange={(e) => onInputChange(e, 'cantidadMaxima')} max={150} tooltip="Digita la cantidad máxima apropiada que tendras de este cupón " className={classNames({ 'p-invalid': submitted && !cupon.cantidadMaxima })} />
                            {submitted && !cupon.cantidadMaxima && <small className="p-invalid">Cantidad Máxima es requerida.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="cantidadDisponible">Cantidad Disponible</label>
                            <InputNumber id="cantidadDisponible" disabled={cantidadDefault} value={cupon.cantidadDisponible} max={150} onValueChange={(e) => onInputChange(e, 'cantidadDisponible')} tooltip="Al crear este cupon por defecto tendrá su cantidad máxima, si quieres cambiar el valor editalo una vez creado" className={classNames({ 'p-invalid': submitted && !cupon.cantidadDisponible })} />
                            {submitted && !cupon.cantidadDisponible && <small className="p-invalid">Cantidad Disponible es requerida.</small>}
                        </div> */}
                        <div className="field">
                            <label htmlFor="porcentaDescuento">Porcentaje Descuento</label>
                            <InputNumber id="porcentajeDescuento" value={cupon.porcentajeDescuento} onValueChange={(e) => onInputChange(e, 'porcentajeDescuento')} suffix="%" tooltip="Escribe solamente el número (sin su tanto porciento) del porcentaje que deseas aplicar" className={classNames({ 'p-invalid': submitted && !cupon.porcentajeDescuento })} />
                            {submitted && !cupon.porcentajeDescuento && <small className="p-invalid">Porcentaje descuento es requerido.</small>}
                        </div>
                    </Dialog>

                    <Dialog visible={activarDesactivarCuponDialog} style={{ width: '450px' }} header="Confirmar" modal footer={activarDesactivarCuponDialogFooter} onHide={hideDeleteCuponDialog}>

                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {cupon && <span>¿Está seguro de que desea <b>{cupon.activo == 1 ? "desactivar a" : "activar a"} {cupon.codigo}</b>?</span>}
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
export default Cupones;
