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
import { autenticacionRequerida } from '../../utils/AutenticacionRequerida';
import { useSession } from 'next-auth/react'

const Repuestos = () => {
    
    let repuestoVacio = {
        idRepuesto: null,
        nombre: '',
        anio_referenciaInicio: null,
        anio_referenciaFinal: null,
        categoria: null,
        stockActual: '',
        stockMinimo: '',
        stockMaximo: '',
        proveedor: null,
        modelo: null,
        transmision: null,
        impuesto: null,
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
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null);
    const { data: session } = useSession();

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

    const listarCategorias = async () => {
        const categoriaService = new CategoriaRepuestoService();
        await categoriaService.getCategoriasRepuestos().then(data => setCategorias(data));
    };

    const listarProveedores = async () => {
        const proveedorService = new ProveedorService();
        await proveedorService.getProveedores().then(data => setProveedores(data));
    };

    const listarModelos = async () => {
        const modeloService = new ModeloService();
        await modeloService.getModelos().then(data => setModelos(data));
    };

    const listarTransmisiones = async () => {
        const transmisionService = new TransmisionService();
        await transmisionService.getTransmisiones().then(data => setTransmisiones(data));
    };

    const listarPrecios = async () => {
        const precioHistoricoService = new PrecioHistoricoRepuestoService();
        await precioHistoricoService.getPreciosHistorico().then(data => setPrecioHistoricos(data));
    };

    const listarImpuestos = async () => {
        const impuestoService = new ImpuestoService();
        await impuestoService.getImpuestos().then(data => setImpuestos(data));
    };

    const listarImpuestosHistoricos = async () => {
        const impuestoHistoricoService = new ImpuestoHistoricoService();
        await impuestoHistoricoService.getImpuestosHistorico().then(data => setImpuestoHistoricos(data));
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

    useEffect(async () => {
        listarRepuestos(); 
        await listarPrecios();
        await listarCategorias();
        await listarProveedores();
        await listarModelos();
        await listarTransmisiones(); 
        await listarImpuestos();
        await listarImpuestosHistoricos();
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
        console.log(repuestos);
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

    const confirmDeleteRepuesto = (repuesto) => {
        setRepuesto(repuesto);
        setDeleteRepuestoDialog(true);
    };

    const cols = [
        { field: 'idRepuesto', header: 'ID' },
        { field: 'nombre', header: 'Nombre' },
        { field: 'anio_referenciaInicio', header: 'Año de Referencia Inicial' },
        { field: 'anio_referenciaFinal', header: 'Año de Referencia Final' },
        { field: 'categoria', header: 'Categoría' },
        { field: 'stockActual', header: 'Stock Actual' },
        { field: 'stockMinimo', header: 'Stock Mínimo' },
        { field: 'stockMaximo', header: 'Stock Máximo' },
        { field: 'proveedor', header: 'Proveedor' },
        { field: 'modelo', header: 'Modelo' },
        { field: 'transmision', header: 'Transmisión' },
        { field: 'impuesto', header: 'Impuesto' }
    ]

    const exportColumns = cols.map(col => ({ title: col.header, dataKey: col.field }));

    let objModificado = repuestos.map(function (element) {
        return {
            idRepuesto: element.idRepuesto,
            nombre: element.nombre,
            anio_referenciaInicio: element.anio_referenciaInicio,
            anio_referenciaFinal: element.anio_referenciaFinal,
            categoria: element.categoria.nombre,
            stockActual: element.stockActual,
            stockMinimo: element.stockMinimo,
            stockMaximo: element.stockMaximo,
            proveedor: element.proveedor.nombre,
            modelo: element.modelo.nombre,
            transmision: element.transmision.nombre,
            impuesto: element.impuesto.nombre
        }
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
                const txtWidth = doc.getStringUnitWidth('REPUESTOS REGISTRADOS') * fontSize / doc.internal.scaleFactor;
                const x = (docWidth - txtWidth) / 2;
                image.src = '../layout/images/img_facturalogo2.png';
                doc.addImage(image, 'PNG', 10, 0, 50, 30);
                //centrar texto:
                doc.text('REPUESTOS REGISTRADOS', x, 15);
                doc.setFontSize(12);
                doc.text(15, 30, 'Usuario: ' + session.user.name);
                doc.text(15, 36, 'Fecha: ' + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString());
                doc.text(docWidth - 15, 30, 'Total Repuestos: ' + repuestos.length, { align: "right" });
                doc.line(15, 40, docWidth - 15, 40);
                doc.autoTable(exportColumns, objModificado, { margin: { top: 45, bottom: 25 } });
                const pageCount = doc.internal.getNumberOfPages();
                for (var i = 1; i <= pageCount; i++) {
                    doc.line(15, docHeight - 20, docWidth - 15, docHeight - 20);
                    doc.text('Página ' + String(i) + '/' + pageCount, docWidth - 15, docHeight - 10, { align: "right" });
                }
                doc.save('Reporte_Repuestos.pdf');
            });
        });
    }

    const exportExcel = () => {
        var tbl = document.getElementById('TablaRepuesto');
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet(objModificado);
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
            const excelBuffer = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array'
            });

            saveAsExcelFile(excelBuffer, 'Reporte_Repuestos');
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


    const onInputChange = (e, nombre) => {
        //categoria, proveedor, modelo, transmision, impuesto
        const val = (e.target && e.target.value) || '';
        let _Repuesto = { ...repuesto };

        switch(nombre) {
            case 'categoria':
                _Repuesto[`${nombre}`]=val;
                setCategoria(e.value);
                break;
            case 'proveedor':
                _Repuesto[`${nombre}`]=val;
                setProveedor(e.value);
                break;
            case 'modelo':
                _Repuesto[`${nombre}`]=val;
                setModelo(e.value);
                break;
            case 'transmision':
                _Repuesto[`${nombre}`]=val;
                setTransmision(e.value);
                break;
            case 'impuesto':
                _Repuesto[`${nombre}`]=val;
                setImpuesto(e.value);
                break;
            default:
                _Repuesto[`${nombre}`] = val;
                break;
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
                <Button type="button" icon="pi pi-file" onClick={() => exportCSV(false)} className="mr-2" tooltip="CSV" tooltipOptions={{ position: 'bottom' }} />
                <Button type="button" icon="pi pi-file-excel" onClick={exportExcel} className="p-button-success mr-2" tooltip="XLSX" tooltipOptions={{ position: 'bottom' }} />
                <Button type="button" icon="pi pi-file-pdf" onClick={exportPdf} className="p-button-warning mr-2" tooltip="PDF" tooltipOptions={{ position: 'bottom' }} />
            </React.Fragment>
        )
    }

    const idBodyTemplate = (rowData) => {
        return (
            <>
                {rowData.idRepuesto}
            </>
        );
    }

    const nombreBodyTemplate = (rowData) => {
        return (
            <>
                {rowData.nombre}
            </>
        );
    }

    const fechaInicioBodyTemplate = (rowData) => {
        return (
            <>
                {rowData.anio_referenciaInicio}
            </>
        );
    }

    const fechaFinalBodyTemplate = (rowData) => {
        return (
            <>
                {rowData.anio_referenciaFinal}
            </>
        );
    }

    const categoriaBodyTemplate = (rowData) => {
        return (
            <>
                {rowData.categoria.nombre}
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
                <div className={templateClass}>
                    {rowData.stockActual}
                </div>
            </>
        );
    }

    const stockMinimoBodyTemplate = (rowData) => {
        return (
            <>
                {rowData.stockMinimo}
            </>
        );
    }

    const stockMaximoBodyTemplate = (rowData) => {
        return (
            <>
                {rowData.stockMaximo}
            </>
        );
    }

    const proveedorBodyTemplate = (rowData) => {
        return (
            <>
                {rowData.proveedor.nombre}
            </>
        );
    }

    const modeloBodyTemplate = (rowData) => {
        return (
            <>
                {rowData.modelo.nombre}
            </>
        );
    }

    const transmisionBodyTemplate = (rowData) => {
        return (
            <>
                {rowData.transmision.nombre}
            </>
        )
    }

    const impuestoBodyTemplate = (rowData) => {
        let impuestoValor = ''; let activo;
        impuestoHistoricos.map((impuestoHistorico) => {
            if (rowData.impuesto.idImpuesto == impuestoHistorico.idImpuesto && impuestoHistorico.fechaFinal == null) {
                impuestoValor = impuestoHistorico.valor;
            }
        });
        impuestos.map((item) => {
            if(rowData.impuesto.idImpuesto===item.idImpuesto)
                activo=item.estado;
        })
        const templateClass = classNames({
            'outofstock': activo === 0,
            '': activo === 1
        });
        return (
            <>
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
                        <Column field="categoria.nombre" header="Categoría" sortable body={categoriaBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="stockActual" header="Stock Actual" body={stockActualBodyTemplate} sortable headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="stockMinimo" header="Stock Mínimo" body={stockMinimoBodyTemplate} sortable headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="stockMaximo" header="Stock Máximo" body={stockMaximoBodyTemplate} sortable headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="proveedor.nombre" header="Proveedor" sortable body={proveedorBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="modelo.nombre" header="Modelo" sortable body={modeloBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="transmision.nombre" header="Transmisión" sortable body={transmisionBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="impuesto.nombre" header="Impuesto" sortable body={impuestoBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
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
                            <Dropdown id="idCategoria" options={categorias} value={repuesto.categoria} onChange={(e) => onInputChange(e, 'categoria')} emptyMessage="No se encontraron categorías"
                            optionLabel={"nombre"} className={classNames({ 'p-invalid': submitted && !repuesto.categoria })} />
                            {submitted && !repuesto.categoria && <small className="p-invalid">La categoría es requerida.</small>}
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
                            <Dropdown id="idProveedor" options={proveedores} value={repuesto.proveedor} onChange={(e) => onInputChange(e, 'proveedor')} optionLabel={"nombre"} 
                            emptyMessage="No se encontraron proveedores" className={classNames({ 'p-invalid': submitted && !repuesto.proveedor })} />
                            {submitted && !repuesto.proveedor && <small className="p-invalid">El proveedor es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="idModelo">Modelo</label>
                            <Dropdown id="idModelo" options={modelos} value={repuesto.modelo} onChange={(e) => onInputChange(e, 'modelo')} optionLabel={"nombre"} 
                            emptyMessage="No se encontraron modelos" className={classNames({ 'p-invalid': submitted && !repuesto.modelo })}/>
                            {submitted && !repuesto.modelo && <small className="p-invalid">El modelo es requerido.</small>}
                        </div>
                        <div className="field">
                            <label htmlFor="idTransmision">Transmisión</label>
                            <Dropdown id="idTransmision" options={transmisiones} value={repuesto.transmision} onChange={(e) => onInputChange(e, 'transmision')} optionLabel={"nombre"} 
                            emptyMessage="No se encontraron transmisiones" className={classNames({ 'p-invalid': submitted && !repuesto.transmision })} />
                            {submitted && !repuesto.transmision && <small className="p-invalid">La transmisión es requerida.</small>}
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
                                <Dropdown id="idImpuesto" options={dropdownImpuestos} value={repuesto.impuesto} onChange={(e) => onInputChange(e, 'impuesto')} optionLabel={"nombre"} tooltip="Impuestos con estado activo"
                                emptyMessage="No se encontraron impuestos" className={classNames({ 'p-invalid': submitted && !repuesto.impuesto })} />
                                {submitted && !repuesto.impuesto && <small className="p-invalid">El impuesto es requerido.</small>}
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
export async function getServerSideProps({req}){
    return autenticacionRequerida(req,({session}) =>
    {
        return{
            props:{session}
        }
    })
}
export default Repuestos;
