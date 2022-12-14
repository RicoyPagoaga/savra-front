import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { RepuestoService } from '../../demo/service/RepuestoService';
import { CategoriaRepuestoService } from '../../demo/service/CategoriaRepuestoService';
import { ModeloService } from '../../demo/service/ModeloService';
import { ProveedorService } from '../../demo/service/ProveedorService';
import { TransmisionService } from '../../demo/service/TransmisionService';
import { ImpuestoService } from '../../demo/service/ImpuestoService';
import { ImpuestoHistoricoService } from '../../demo/service/ImpuestoHistoricoService';
import { PrecioHistoricoRepuestoService } from '../../demo/service/PrecioHistoricoRepuestoService';

const Repuestos = () => {
    
    let repuestoVacio = {
        idRepuesto: null,
        nombre: '',
        anio_referenciaInicio: null,
        anio_referenciaFinal: null,
        idCategoria: null,
        stockActual: '',
        stockMinimo: '',
        stockMaximo: '',
        idProveedor: null,
        idModelo: null,
        idTransmision: null,
        idImpuesto: null,
    };

    let precioHistoricoVacio = {
        idRepuesto: null,
        fechaInicio: null,
        fechaFinal: null,
        precio: null,
    };

    const [repuestos, setRepuestos] = useState([]);
    const [repuestoDialog, setRepuestoDialog] = useState(false);
    const [deleteRepuestoDialog, setDeleteRepuestoDialog] = useState(false);
    const [deleteRepuestosDialog, setDeleteRepuestosDialog] = useState(false);
    const [repuesto, setRepuesto] = useState(repuestoVacio);
    const [selectedRepuestos, setSelectedRepuestos] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);

    //año referencia inicio - final
    const [refInicio, setRefInicio] = useState(null);
    const [refFinal, setRefFinal] = useState(null);

    //precio historico
    const [allExpanded, setAllExpanded] = useState(false);
    const [precioHistorico, setPrecioHistorico] = useState(precioHistoricoVacio);
    const [precioHistoricos, setPrecioHistoricos] = useState([]);
    const [expandedRows, setExpandedRows] = useState([]);
    const [minDate, setMinDate] = useState(null);
    const [minYear, setMinYear] = useState(null);
    const [maxDate, setMaxDate] = useState(null);

    //foraneas categoria, proveedor, modelo, transmision, impuesto
    const [categoria, setCategoria] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [proveedor, setProveedor] = useState(null);
    const [proveedores, setProveedores] = useState([]);
    const [modelo, setModelo] = useState(null);
    const [modelos, setModelos] = useState([]);
    const [transmision, setTransmision] = useState(null);
    const [transmisiones, setTransmisiones] = useState([]);
    const [impuesto, setImpuesto] = useState(null);
    const [impuestos, setImpuestos] = useState([]);
    const [impuestoHistoricos, setImpuestoHistoricos] = useState([]);
    const [dropdownImpuestos, setDropdownImpuestos] = useState([]);

    const listarRepuestos = () => {
        const repuestoService = new RepuestoService();
        repuestoService.getRepuestos().then(data => setRepuestos(data));
    };

    const listarCategorias = () => {
        const categoriaService = new CategoriaRepuestoService();
        categoriaService.getCategoriasRepuestos().then(data => setCategorias(data));
    };

    const listarProveedores = () => {
        const proveedorService = new ProveedorService();
        proveedorService.getProveedores().then(data => setProveedores(data));
    };

    const listarModelos = () => {
        const modeloService = new ModeloService();
        modeloService.getModelos().then(data => setModelos(data));
    };

    const listarTransmisiones = () => {
        const transmisionService = new TransmisionService();
        transmisionService.getTransmisiones().then(data => setTransmisiones(data));
    };

    const listarPrecios = () => {
        const precioHistoricoService = new PrecioHistoricoRepuestoService();
        precioHistoricoService.getPreciosHistorico().then(data => setPrecioHistoricos(data));
    };

    const listarImpuestos = () => {
        const impuestoService = new ImpuestoService();
        impuestoService.getImpuestos().then(data => setImpuestos(data));
    };

    const listarImpuestosHistoricos = () => {
        const impuestoHistoricoService = new ImpuestoHistoricoService();
        impuestoHistoricoService.getImpuestosHistorico().then(data => setImpuestoHistoricos(data));
    };

    const setearRangoFechas = () => {
        const fechaActual = Date.now(); //fecha actual
        let fecha = new Date(fechaActual);
        let min_year = new Date("1970-01-01");

        let fechaAyer = fecha.getFullYear() + "-" + (fecha.getMonth() + 1) + "-" + (fecha.getDate() - 1);
        const [y, m, d] = fechaAyer.split('-');
        let fechaMin = new Date(+y, m-1, +d);
    
        setMinDate(fechaMin);
        setMaxDate(fecha);
        setMinYear(min_year);
    };

    useEffect(() => {
        listarRepuestos(); 
        listarPrecios();
        listarCategorias();
        listarProveedores();
        listarModelos();
        listarTransmisiones(); 
        listarImpuestos();
        listarImpuestosHistoricos();
        setearRangoFechas();
    }, []); 

    const setearDropdownImpuestos = () => {
        let dropdown = []
        impuestos.map((item) => {
            if(item.estado === 1) {
                dropdown.push(item);
            }
        });
        setDropdownImpuestos(dropdown);
    };

    const openNew = () => {
        setRepuesto(repuestoVacio);
        setPrecioHistorico(precioHistoricoVacio);
        //dropdown impuesto
        setearDropdownImpuestos();
        //
        setSubmitted(false);
        setRepuestoDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setRepuestoDialog(false);
        //
        setRefInicio(null);
        setRefFinal(null);
        setCategoria(null);
        setProveedor(null);
        setModelo(null);
        setTransmision(null);
        setImpuesto(null);
        setPrecioHistorico(precioHistoricoVacio);
    };

    const hideDeleteRepuestoDialog = () => {
        setDeleteRepuestoDialog(false);
    };

    const hideDeleteRepuestosDialog = () => {
        setDeleteRepuestosDialog(false);
    };

    const pasoRegistro = () => {
        listarRepuestos();
        listarPrecios();
        setRepuestoDialog(false);
        setRepuesto(repuestoVacio);
        //
        setPrecioHistorico(precioHistoricoVacio);
        setRefInicio(null);
        setRefFinal(null);
        setCategoria(null);
        setProveedor(null);
        setModelo(null);
        setTransmision(null); 
        setImpuesto(null);  
    };

    const saveRepuesto = async () => {
        setSubmitted(true);
        if (repuesto.idRepuesto) {
            try {
                const repuestoService = new RepuestoService();
                let stockA = (!repuesto.stockActual) ? true : false;
                let stockM = (!repuesto.stockMinimo) ? true : false;
                let stockMa = (!repuesto.stockMaximo) ? true : false;
                let precio = (!precioHistorico.precio) ? 0 : precioHistorico.precio;
                await repuestoService.updateRepuesto(repuesto, stockA, stockM, stockMa, precio);
                const precioHistoricoService = new PrecioHistoricoRepuestoService(); 
                if (precioHistorico.idRepuesto == null) {
                    //si es primera vez 
                    precioHistorico.idRepuesto = repuesto.idRepuesto;
                    precioHistorico.fechaInicio = '1822-01-01';
                    precioHistorico.fechaFinal = '1822-03-03'
                    await precioHistoricoService.addPrecioHistorico(precioHistorico);
                } else {
                    precioHistorico.fechaFinal = '1822-03-03'
                    await precioHistoricoService.addPrecioHistorico(precioHistorico);
                }               
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Repuesto Actualizado', life: 3000 });
                pasoRegistro();   
            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails , life: 3000 });
            }
        }
        else {
            try { 
                //agregar repuesto
                const repuestoService = new RepuestoService();
                let stockA = (!repuesto.stockActual) ? true : false;
                let stockM = (!repuesto.stockMinimo) ? true : false;
                let stockMa = (!repuesto.stockMaximo) ? true : false;
                let precio = (!precioHistorico.precio) ? 0 : precioHistorico.precio;
                await repuestoService.addRepuesto(repuesto, stockA, stockM, stockMa, precio);
                //agregar precio historico
                const precioHistoricoService = new PrecioHistoricoRepuestoService();   
                precioHistorico.fechaInicio = '1822-01-01';
                precioHistorico.fechaFinal = '1822-03-03'
                await precioHistoricoService.addPrecioHistorico(precioHistorico);
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Repuesto Creado', life: 3000 });
                pasoRegistro();
            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails , life: 3000 });   
            }
        }
    };

    const getCategoria = (id) => {
        let categoria = {};
        categorias.map((item) => {
            if (item.idCategoria == id) {
                categoria = item;
            }
        });
        return categoria;
    };

    const getProveedor = (id) => {
        let proveedor = {};
        proveedores.map((item) => {
            if (item.idProveedor == id) {
                proveedor = item;
            }
        });
        return proveedor;
    };

    const getModelo = (id) => {
        let modelo = {};
        modelos.map((item) => {
            if (item.idModelo == id) {
                modelo = item;
            }
        });
        return modelo;
    };

    const getTransmision = (id) => {
        let transmision = {};
        transmisiones.map((item) => {
            if (item.idTransmision == id) {
                transmision = item;
            }
        });
        return transmision;
    };

    const getImpuesto = (id) => {
        let impuesto = {};
        impuestos.map((item) => {
            if (item.idImpuesto == id) {
                impuesto = item;
            } 
        });
        return impuesto;
    };

    const setearFecha = (year) => {
        let fecha = new Date(year, 0, 1);
        return fecha;
    };

    const editRepuesto = (repuesto) => {
        if (repuesto.stockActual == 0) {
            repuesto.stockActual = "0"
        }
        if (repuesto.stockMinimo == 0) {
            repuesto.stockMinimo = "0"
        }
        setRepuesto({ ...repuesto });
        setearDropdownImpuestos();
        //
        setRefInicio(setearFecha(repuesto.anio_referenciaInicio));
        setRefFinal(setearFecha(repuesto.anio_referenciaFinal));
        setCategoria(getCategoria(repuesto.idCategoria));
        setProveedor(getProveedor(repuesto.idProveedor));
        setModelo(getModelo(repuesto.idModelo));
        setTransmision(getTransmision(repuesto.idTransmision));
        setImpuesto(getImpuesto(repuesto.idImpuesto));
        //

        precioHistoricos.map((item) => {
            if (item.idRepuesto == repuesto.idRepuesto && item.fechaFinal == null) {
                setPrecioHistorico(item);
            } 
        });

        setRepuestoDialog(true);        
    };

    const confirmDeleteRepuesto = (repuesto) => {
        setRepuesto(repuesto);
        setDeleteRepuestoDialog(true);
    };

    const deleteRepuesto = async () => {
        try {
            const repuestoService = new RepuestoService();
            await repuestoService.removeRepuesto(repuesto.idRepuesto);
            listarRepuestos();
            setDeleteRepuestoDialog(false);
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Repuesto Eliminado', life: 3000 });
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error, life: 3000 });
        }
    };


    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const onInputChange = (e, nombre) => {
        //categoria, proveedor, modelo, transmision, impuesto
        const val = (e.target && e.target.value) || '';
        let _Repuesto = { ...repuesto };

        if (nombre == 'idCategoria') {
            _Repuesto[`${nombre}`]=val.idCategoria;
            setCategoria(e.value);
        } 
        else if (nombre == 'idProveedor') {
            _Repuesto[`${nombre}`]=val.idProveedor;
            setProveedor(e.value);
        } 
        else if (nombre == 'idModelo') {
            _Repuesto[`${nombre}`]=val.idModelo;
            setModelo(e.value);
        } 
        else if (nombre == 'idTransmision') {
            _Repuesto[`${nombre}`]=val.idTransmision;
            setTransmision(e.value);
        } 
        else if (nombre == 'idImpuesto') {    
            _Repuesto[`${nombre}`]=val.idImpuesto;
            setImpuesto(e.value);
        }
        else {
            _Repuesto[`${nombre}`] = val;
        }
        setRepuesto(_Repuesto);
    }

    const onYearChange = (e, nombre) => {
        const val = (e.target && e.target.value) || '';
        let _Repuesto = { ...repuesto };

        if (nombre == 'anio_referenciaInicio') {
            _Repuesto[`${nombre}`]=val.getFullYear();
            setRefInicio(val);
        }
        else { //ref Final
            _Repuesto[`${nombre}`]=val.getFullYear();
            setRefFinal(val);
        }
        setRepuesto(_Repuesto);
    }

    const onStockChange = (e, nombre) => {
        const val = (e.target && e.target.value) || '';
        let _Repuesto = { ...repuesto };
        let valor = 0;
        //
        valor = (val > 1000000 || val=='00') ? '0' : val;
        _Repuesto[`${nombre}`] = valor;
        console.log(_Repuesto);
        setRepuesto(_Repuesto);
    }

    const onPriceChange = (e, nombre) => {
        const val = e.value || 0 || null;
        let _PrecioHistorico = { ...precioHistorico };
        _PrecioHistorico[`${nombre}`] = val;

        setPrecioHistorico(_PrecioHistorico);
    };

    const toggleAll = () => {
        if (allExpanded) collapseAll();
        else expandAll();
    };

    const expandAll = () => {
        let _expandedRows = {};
        repuestos.forEach((p) => (_expandedRows[`${p.idRepuesto}`] = true));

        setExpandedRows(_expandedRows);
        setAllExpanded(true);
    };

    const collapseAll = () => {
        setExpandedRows(null);
        setAllExpanded(false);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                    <Button icon={allExpanded ? 'pi pi-minus' : 'pi pi-plus'} label={allExpanded ? 'Colapsar Todas' : 'Expandir Todas'} onClick={toggleAll} className="w-12rem" 
                    disabled={!repuestos || !repuestos.length} />
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
                {rowData.idRepuesto}
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
                <span className="p-column-title">Año de Referencia Inicial</span>
                {rowData.anio_referenciaInicio}
            </>
        );
    }

    const fechaFinalBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Año de Referencia Final</span>
                {rowData.anio_referenciaFinal}
            </>
        );
    }

    const categoriaBodyTemplate = (rowData) => {
        let categoriaNombre = '';
        categorias.map((categoria) => {
            if (rowData.idCategoria == categoria.idCategoria) {
                categoriaNombre = categoria.nombre;
            }
        });
        return (
            <>
                <span className="p-column-title">Categoría</span>
                {categoriaNombre}
            </>
        )
    }

    const stockActualBodyTemplate = (rowData) => {
        const templateClass = classNames({
            'outofstock': rowData.stockActual === 0 || rowData.stockActual === "0",
            '': rowData.stockActual > 0
        });
        return (
            <>
                <span className="p-column-title">Stock Actual</span>
                <div className={templateClass}>
                    {rowData.stockActual}
                </div>
            </>
        );
    }

    const stockMinimoBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Stock Mínimo</span>
                {rowData.stockMinimo}
            </>
        );
    }

    const stockMaximoBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Stock Máximo</span>
                {rowData.stockMaximo}
            </>
        );
    }

    const proveedorBodyTemplate = (rowData) => {
        let proveedorNombre = '';
        proveedores.map((proveedor) => {
            if (rowData.idProveedor == proveedor.idProveedor) {
                proveedorNombre = proveedor.nombre;
            }
        });
        return (
            <>
                <span className="p-column-title">Proveedor</span>
                {proveedorNombre}
            </>
        );
    }

    const modeloBodyTemplate = (rowData) => {
        let modeloNombre = '';
        modelos.map((modelo) => {
            if (rowData.idModelo == modelo.idModelo) {
                modeloNombre = modelo.nombre;
            }
        });
        return (
            <>
                <span className="p-column-title">Modelo</span>
                {modeloNombre}
            </>
        );
    }

    const transmisionBodyTemplate = (rowData) => {
        let transmisionNombre = '';
        transmisiones.map((transmision) => {
            if (rowData.idTransmision == transmision.idTransmision) {
                transmisionNombre = transmision.nombre;
            }
        });
        return (
            <>
                <span className="p-column-title">Transmisión</span>
                {transmisionNombre}
            </>
        )
    }

    const impuestoBodyTemplate = (rowData) => {
        let impuestoValor = ''; let activo;
        impuestoHistoricos.map((impuestoHistorico) => {
            if (rowData.idImpuesto == impuestoHistorico.idImpuesto && impuestoHistorico.fechaFinal == null) {
                impuestoValor = impuestoHistorico.valor;
            }
        });
        impuestos.map((item) => {
            if(rowData.idImpuesto===item.idImpuesto)
                activo=item.estado;
        })
        const templateClass = classNames({
            'outofstock': activo === 0,
            '': activo === 1
        });
        return (
            <>
                <span className="p-column-title">Impuesto</span>
                <div className={templateClass}>
                    {impuestoValor}%
                </div>
            </>
        )
    }

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editRepuesto(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning mt-2" onClick={() => confirmDeleteRepuesto(rowData)} />
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
            <h5 className="m-0">Listado de Repuestos</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => filter(e)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const repuestoDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" className="p-button-text" onClick={saveRepuesto} />
        </>
    );
    const deleteRepuestoDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteRepuestoDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteRepuesto} />
        </>
    );

    const precioBodyTemplate = (rowData) => {
        const format = (value) => {
            return value.toLocaleString('en-US');
        };
        return "L." + format(rowData.precio);
    };

    const cellEditor = (options) => {
        //disabled={!options.value || (options.value != minDate && options.value != maxDate)}
        if (options.value) {
            return calendarEditor(options); 
        }
        else
            return options.value; 
    };

    const calendarEditor = (options) => {
        return <Calendar minDate={minDate} maxDate={maxDate} dateFormat="yy-mm-dd" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} 
         ></Calendar>;
    };

    const getFecha = (fecha) => {
        const getDay = (day) => {
            return (day < 10) ? '0'+day : day;
        };
        const getMonth = (month) => {
            return ((month + 1) < 10) ? "0"+(month+1) : (month+1)
        };
        let _fecha = fecha.getFullYear() + "-" + getMonth(fecha.getMonth()) + "-" + getDay(fecha.getDate());
        return _fecha;
    };

    const onCellEditComplete = async (e) => {
        let { rowData, newValue, field, originalEvent: event } = e;
        let min_date = getFecha(minDate);
        let max_date = getFecha(maxDate);
        let precio = {...precioHistoricoVacio};
        precio = rowData;
        let fecha; let fechaActualizar; let valor;
        if (newValue == precio.fechaFinal) {
            valor = '' + newValue;
            const [y, m ,d] = valor.split('-');
            fecha = new Date(+y,m-1,+d);
            fechaActualizar = getFecha(fecha);
        } else {
            valor = '' + newValue;
            fecha = new Date(valor);
            fechaActualizar = getFecha(fecha);
        }

        try {
            
            if (fechaActualizar != precio.fechaFinal &&
                (fechaActualizar == min_date || fechaActualizar == max_date) && 
                (precio.fechaFinal == min_date || precio.fechaFinal == max_date)) {
                     
                precio[field] = fechaActualizar;
                //actualizar BD
                const precioHistoricoService = new PrecioHistoricoRepuestoService();   
                precioHistoricoService.updatePrecioHistorico(precio);
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Fechas Actualizadas', life: 3000 });
                listarPrecios();
            } else {
                event.preventDefault();
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails , life: 3000 });   
        }
    };

    const rowExpansionTemplate = (data) => {
        let table = [];
        precioHistoricos.map((item) => {
            if (item.idRepuesto == data.idRepuesto) {
                table.push(item);
            }
        });
        return (
            <div className="orders-subtable">
                <h5>Precio Histórico del Repuesto: {data.nombre}</h5>
                <DataTable value={table} 
                editMode="cell" 
                className="editable-cells-table"
                responsiveLayout="scroll"
                emptyMessage="No se encontraron precios del repuesto.">
                    <Column field="fechaInicio" header="Fecha Inicial" sortable  headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                    <Column key="fechaFinal" field="fechaFinal" header="Fecha Final" sortable  headerStyle={{ width: '14%', minWidth: '10rem' }} 
                                editor={(options) => cellEditor(options)} onCellEditComplete={onCellEditComplete} ></Column>
                    <Column field="precio" header="Precio" body={precioBodyTemplate} sortable headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                </DataTable>
            </div>
        );
    };

    return (
        <div className="grid crud-demo datatable-style-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={repuestos}
                        dataKey="idRepuesto"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} repuestos" 
                        globalFilter={globalFilter}
                        emptyMessage="No se encontraron repuestos."
                        header={header}
                        responsiveLayout="scroll"
                        expandedRows={expandedRows}
                        onRowToggle={(e) => setExpandedRows(e.data)}
                        rowExpansionTemplate={rowExpansionTemplate}
                    >
                        <Column expander style={{ width: '3em' }} />
                        <Column field="idRepuesto" header="Código" sortable body={idBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="nombre" header="Nombre" sortable body={nombreBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="anio_referenciaInicio" header="Año de Referencia Inicial" sortable body={fechaInicioBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="anio_referenciaFinal" header="Año de Referencia Final" body={fechaFinalBodyTemplate} sortable headerStyle={{ width: '14%', minWidth: '8rem' }}></Column>
                        <Column field="idCategoria" header="Categoría" sortable body={categoriaBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="stockActual" header="Stock Actual" body={stockActualBodyTemplate} sortable headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="stockMinimo" header="Stock Mínimo" body={stockMinimoBodyTemplate} sortable headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="stockMaximo" header="Stock Máximo" body={stockMaximoBodyTemplate} sortable headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="idProveedor" header="Proveedor" sortable body={proveedorBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="idModelo" header="Modelo" sortable body={modeloBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="idTransmision" header="Transmisión" sortable body={transmisionBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="idImpuesto" header="Impuesto" sortable body={impuestoBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column header="Acciones" body={actionBodyTemplate}  headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={repuestoDialog} style={{ width: '550px' }} header="Detalles de Repuesto" modal className="p-fluid" footer={repuestoDialogFooter} onHide={hideDialog}>
                        <div className="field">
                            <label htmlFor="nombre">Nombre</label>
                            <InputText id="nombre" value={repuesto.nombre} onChange={(e) => onInputChange(e, 'nombre')} tooltip="Debe ingresar más de cinco caracteres"
                            className={classNames({ 'p-invalid': submitted && !repuesto.nombre })} />
                            {submitted && !repuesto.nombre && <small className="p-invalid">El nombre es requerido.</small>}
                        </div>
                        <div className='formgrid grid'>
                            <div className="field col">
                                <label htmlFor="anio_referenciaInicio">Año de Referencia Inicial</label>
                                <Calendar id="anio_referenciaInicio" value={refInicio} onChange={(e) => onYearChange(e, 'anio_referenciaInicio')} view="year" dateFormat='yy' minDate={minYear} maxDate={maxDate} 
                                placeholder="Seleccione año" tooltip="No podrá seleccionar un año anterior a 1970"
                                readOnlyInput showIcon className={classNames({ 'p-invalid': submitted && !repuesto.anio_referenciaInicio })} />
                                {submitted && !repuesto.anio_referenciaInicio && <small className="p-invalid">El año de referencia inicial es requerida.</small>}
                            </div>
                            <div className="field col">
                                <label htmlFor="anio_referenciaFinal">Año de Referencia Final</label>
                                <Calendar id="anio_referenciaFinal" value={refFinal} onChange={(e) => onYearChange(e, 'anio_referenciaFinal')} view="year" dateFormat='yy' minDate={minYear} maxDate={maxDate} 
                                placeholder="Seleccione año" tooltip="No podrá seleccionar un año posterior al actual"
                                readOnlyInput showIcon className={classNames({ 'p-invalid': submitted && !repuesto.anio_referenciaFinal })} />
                                {submitted && !repuesto.anio_referenciaFinal && <small className="p-invalid">El año de referencia final es requerida.</small>}
                            </div>    
                        </div>
                        <div className="field">
                            <label htmlFor="idCategoria">Categoría</label>
                            <Dropdown id="idCategoria" options={categorias} value={categoria} onChange={(e) => onInputChange(e, 'idCategoria')} emptyMessage="No se encontraron categorías"
                            optionLabel={"nombre"} className={classNames({ 'p-invalid': submitted && !repuesto.idCategoria })} />
                            {submitted && !repuesto.idCategoria && <small className="p-invalid">La categoría es requerida.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="stockActual">Stock Actual</label>
                            <InputText id="stockActual" type="number" min={0} max={1000000} value={repuesto.stockActual} onChange={(e) => onStockChange(e, 'stockActual')} 
                            tooltip="No se permiten valores mayores a 1,000,000" keyfilter={/[0-9]+/}
                            className={classNames({ 'p-invalid': submitted && !repuesto.stockActual })} />
                            {submitted && !repuesto.stockActual && <small className="p-invalid">El stock actual es requerido.</small>}
                        </div>
                        <div className='formgrid grid'>
                            <div className="field col">
                                <label htmlFor="stockMinimo">Stock Mínimo</label>
                                <InputText id="stockMinimo" type="number" min={0} max={1000000} value={repuesto.stockMinimo} onChange={(e) => onStockChange(e, 'stockMinimo')} 
                                tooltip="No se permiten valores mayores a 1,000,000" keyfilter={/[0-9]+/}
                                className={classNames({ 'p-invalid': submitted && !repuesto.stockMinimo })} />
                                {submitted && !repuesto.stockMinimo && <small className="p-invalid">El stock mínimo es requerido.</small>}
                            </div>
                            <div className="field col">
                                <label htmlFor="stockMaximo">Stock Máximo</label>
                                <InputText id="stockMaximo" type="number" value={repuesto.stockMaximo} min={0} max={1000000} onChange={(e) => onStockChange(e, 'stockMaximo')} 
                                tooltip="No se permiten valores mayores a 1,000,000" keyfilter={/[0-9]+/}
                                className={classNames({ 'p-invalid': submitted && !repuesto.stockMaximo })} />
                                {submitted && !repuesto.stockMaximo && <small className="p-invalid">El stock máximo es requerido.</small>}
                            </div>
                        </div>
                        <div className="field">
                            <label htmlFor="idProveedor">Proveedor</label>
                            <Dropdown id="idProveedor" options={proveedores} value={proveedor} onChange={(e) => onInputChange(e, 'idProveedor')} optionLabel={"nombre"} 
                            emptyMessage="No se encontraron proveedores" className={classNames({ 'p-invalid': submitted && !repuesto.idProveedor })} />
                            {submitted && !repuesto.idProveedor && <small className="p-invalid">El proveedor es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="idModelo">Modelo</label>
                            <Dropdown id="idModelo" options={modelos} value={modelo} onChange={(e) => onInputChange(e, 'idModelo')} optionLabel={"nombre"} 
                            emptyMessage="No se encontraron modelos" className={classNames({ 'p-invalid': submitted && !repuesto.idModelo })}/>
                            {submitted && !repuesto.idModelo && <small className="p-invalid">El modelo es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="idTransmision">Transmisión</label>
                            <Dropdown id="idTransmision" options={transmisiones} value={transmision} onChange={(e) => onInputChange(e, 'idTransmision')} optionLabel={"nombre"} 
                            emptyMessage="No se encontraron transmisiones" className={classNames({ 'p-invalid': submitted && !repuesto.idTransmision })} />
                            {submitted && !repuesto.idTransmision && <small className="p-invalid">La transmisión es requerida.</small>}
                        </div>
                        <div className='formgrid grid'>
                            <div className="field col">
                                <label htmlFor="precio">Precio</label>
                                <InputNumber id="precio" value={precioHistorico.precio} onValueChange={(e) => onPriceChange(e, 'precio')} min={0} max={200000} mode='currency' currency='HNL' locale='en-US' 
                                tooltip="No se permiten valores mayores a 200,000"
                                className={classNames({ 'p-invalid': submitted && !precioHistorico.precio })}/>
                                {submitted && !precioHistorico.precio && <small className="p-invalid">El precio es requerido, no debe ser menor o igual a cero.</small>}
                            </div>
                            <div className="field col">
                                <label htmlFor="idImpuesto">Impuesto</label>
                                <Dropdown id="idImpuesto" options={dropdownImpuestos} value={impuesto} onChange={(e) => onInputChange(e, 'idImpuesto')} optionLabel={"nombre"} tooltip="Impuestos con estado activo"
                                emptyMessage="No se encontraron impuestos" className={classNames({ 'p-invalid': submitted && !repuesto.idImpuesto })} />
                                {submitted && !repuesto.idImpuesto && <small className="p-invalid">El impuesto es requerido.</small>}
                            </div>
                        </div>
                    </Dialog> 

                    <Dialog visible={deleteRepuestoDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteRepuestoDialogFooter} onHide={hideDeleteRepuestoDialog}>

                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {repuesto && <span>¿Está seguro de que desea eliminar a <b>{repuesto.nombre}</b>?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Repuestos;
