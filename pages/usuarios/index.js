import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { UsuarioService } from '../../demo/service/UsuarioService';
import { RolService } from '../../demo/service/RolService';
import { autenticacionRequerida } from '../../utils/AutenticacionRequerida';
import { useSession } from 'next-auth/react'

const Usuarios = () => {
    let usuarioVacio = {
        idUsuario: null,
        username: '',
        password: '',
        activo: 1,
        bloqueado: 0,
        rol: null,
        nombre: '',
        apellido: '',
        clientesVista: 0,
        ultimaVisita: null,
        ventasVista: 0,
        repuestosVista: 0
    };

    const [editarPassword, setEditarPassword] = useState(false);
    const [checked, setChecked] = useState(false);
    const [deleteUsuarioDialog, setDeleteUsuarioDialog] = useState(false);
    const [deleteUsuariosDialog, setDeleteUsuariosDialog] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [usuarios, setUsuarios] = useState([]);
    const [usuarioDialog, setUsuarioDialog] = useState(false);
    const [activarDesactivarUsuarioDialog, setActivarDesactivarUsuarioDialog] = useState(false);

    const [roles, setRoles] = useState([]);
    const [rol, setRol] = useState(null);
    const [usuario, setUsuario] = useState(usuarioVacio);
    const [selectedUsuarios, setSelectedUsuarios] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null)
    const { data: session } = useSession();


    const listarUsuarios = () => {
        const usuarioService = new UsuarioService();
        usuarioService.getUsuarios().then(data => setUsuarios(data));
    };

    /*const listarRoles = () => {
        const rolService = new RolService();
        rolService.getRoles().then(data => setRoles(data));
    };*/
    const listarRoles = () => {
        const rolService = new RolService();
        rolService.getRols().then(data => setRoles(data));
    };

    useEffect(() => {
        listarUsuarios();
        listarRoles();
    }, []);

    const openNew = () => {
        setUsuario(usuarioVacio);
        setSubmitted(false);
        setUsuarioDialog(true);
        setRol(null);
        setConfirmPassword('');
        setChecked(false);
        setEditarPassword(false);
    }

    const hideDialog = () => {
        setSubmitted(false);
        setUsuarioDialog(false);
    }

    const hideDeleteUsuarioDialog = () => {
        setActivarDesactivarUsuarioDialog(false);
    }

    const pasoRegistro = () => {
        listarUsuarios();
        setUsuarioDialog(false);
        setUsuario(usuarioVacio);
    }

    const saveUsuario = async () => {
        setSubmitted(true);
        if (usuario.idUsuario) {
            try {
                let x = (confirmPassword === usuario.password) ? true : false;
                usuario.bloqueado = checked ? 1 : 0;
                const usuarioService = new UsuarioService();
                await usuarioService.updateUsuario(usuario, x);
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Usuario Actualizado', life: 3000 });
                pasoRegistro();
            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });
            }
        }
        else {
            try {
                let x = (confirmPassword === usuario.password) ? true : false;
                usuario.bloqueado = checked ? 1 : 0;
                const usuarioService = new UsuarioService();
                await usuarioService.addUsuario(usuario, x);
                toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Usuario Creado', life: 3000 });
                pasoRegistro();
            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });
            }
        }

    }

    const editUsuario = (usuario) => {
        setUsuario({ ...usuario });
        const rol_ = roles.find((item) => {
            if (item.idRol == usuario.idRol)
                return item
        });
        setRol(rol_);
        setUsuarioDialog(true);
        setConfirmPassword(usuario.password);
        let x = usuario.bloqueado === 1 ? true : false;
        setChecked(x);
        setEditarPassword(true);
    }

    const confirmBloquearDesbloquearUsuario = (usuario) => {
        setUsuario(usuario);
        setActivarDesactivarUsuarioDialog(true);
    }

    const activarDesactivarUsuario = async () => {
        try {
            const usuarioService = new UsuarioService();
            usuario.activo = usuario.activo == 1 ? 0 : 1;
            await usuarioService.activarDesactivarUsuario(usuario.activo, usuario.idUsuario);
            listarUsuarios();
            setActivarDesactivarUsuarioDialog(false);
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: `Usuario ${usuario.activo == 1 ? 'activado' : 'desactivado'}`, life: 3000 });
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });
        }
    }


    const deleteUsuario = async () => {
        try {
            const usuarioService = new UsuarioService();
            await usuarioService.removeUsuario(usuario.idUsuario);
            listarUsuarios();
            setDeleteUsuarioDialog(false);
            toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Usuario Eliminado', life: 3000 });
        } catch (error) {
            toast.current.show({ severity: 'failure', summary: 'Error', detail: error });
        }
    }

    const cols = [
        { field: 'idUsuario', header: 'ID' },
        { field: 'nombre', header: 'Nombre' },
        { field: 'apellido', header: 'Apellido' },
        { field: 'username', header: 'Nombre de Usuario' },
        { field: 'rol', header: 'Rol' },
        { field: 'activo', header: 'Estado' },
        { field: 'bloqueado', header: 'Bloqueado' },
    ];

    const exportColumns = cols.map(col => ({ title: col.header, dataKey: col.field }));

    let objModificado = usuarios.map(function (element) {
        return {
            idUsuario: element.idUsuario,
            nombre: element.nombre,
            apellido: element.apellido,
            username: element.username,
            rol: element.rol.nombre,
            activo: element.activo ? "ACTIVO" : "INNACTIVO",
            bloqueado: element.bloqueado ? "BLOQUEADO" : ""
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
                const txtWidth = doc.getStringUnitWidth('USUARIOS DEL SISTEMA') * fontSize / doc.internal.scaleFactor;
                const x = (docWidth - txtWidth) / 2;
                image.src = '../layout/images/img_facturalogo2.png';
                doc.addImage(image, 'PNG', 10, 0, 50, 30);
                //centrar texto:
                doc.text('USUARIOS DEL SISTEMA', x, 15);
                doc.setFontSize(12);
                doc.text(15, 30, 'Usuario: ' + session.user.name);
                doc.text(15, 36, 'Fecha: ' + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString());
                doc.text(docWidth - 15, 30, 'Total Usuarios: ' + usuarios.length, { align: "right" });
                doc.line(15, 40, docWidth - 15, 40);
                doc.autoTable(exportColumns, objModificado, { margin: { top: 45, bottom: 25 } });
                const pageCount = doc.internal.getNumberOfPages();
                for (var i = 1; i <= pageCount; i++) {
                    doc.line(15, docHeight - 20, docWidth - 15, docHeight - 20);
                    doc.text('Página ' + String(i) + '/' + pageCount, docWidth - 15, docHeight - 10, { align: "right" });
                }
                doc.save('Reporte_Usuarios.pdf');
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

            saveAsExcelFile(excelBuffer, 'Reporte_Usuarioss');
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
        setDeleteUsuariosDialog(true);
    }



    const onInputChange = (e, nombre) => {
        const val = (e.target && e.target.value) || '';
        let _usuario = { ...usuario };
        if (nombre != 'rol')
            _usuario[`${nombre}`] = val;
        else {
            _usuario[`${nombre}`] = val;
            setRol(e.value)
        }

        setUsuario(_usuario);
    }

    const onInputChangeConfirm = (e) => {
        const val = (e.target && e.target.value) || '';
        setConfirmPassword(e.target.value);
    }

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                    <Button label="Eliminar" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={true} />
                </div>
            </React.Fragment>
        )
    }

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button type="button" icon="pi pi-file" onClick={() => exportCSV(false)} className="mr-2" tooltip="CSV" tooltipOptions={{ position: 'bottom' }} />
                <Button type="button" icon="pi pi-file-excel" onClick={exportExcel} className="p-button-success mr-2" tooltip="XLS" tooltipOptions={{ position: 'bottom' }} />
                <Button type="button" icon="pi pi-file-pdf" onClick={exportPdf} className="p-button-warning mr-2" tooltip="PDF" tooltipOptions={{ position: 'bottom' }} />
            </React.Fragment>
        )
    }

    const idBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Código</span>
                {rowData.idUsuario}
            </>
        );
    }

    const nombreBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Nombre</span>
                {rowData.nombre + ' ' + rowData.apellido}
            </>
        );
    }

    const usernameBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Nombre de Usuario</span>
                {rowData.username}
            </>
        );
    }

    const passwordBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Password</span>
                {rowData.password}
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

    const rolBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Rol de Usuario</span>
                {rowData.rol.nombre}
            </>
        );

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
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editUsuario(rowData)} />
                <Button icon={iconResult} className="p-button-rounded p-button-secondary mt-2" onClick={() => confirmBloquearDesbloquearUsuario(rowData)} />
            </div>
        );
    }

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Listado de Usuarios</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const usuarioDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" className="p-button-text" onClick={saveUsuario} />
        </>
    );
    const activarDesactivarUsuarioDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteUsuarioDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={activarDesactivarUsuario} />
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
                        value={usuarios}
                        selection={selectedUsuarios}
                        onSelectionChange={(e) => setSelectedUsuarios(e.value)}
                        dataKey="idUsuario"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
                        globalFilter={globalFilter}
                        emptyMessage="No se encontraron usuarios."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                        <Column field="idUsuario" header="Código" sortable body={idBodyTemplate} headerStyle={{ width: '10%', minWidth: '10rem' }}></Column>
                        <Column field="nombre" header="Nombre" sortable body={nombreBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="usermame" header="Nombre de Usuario" sortable body={usernameBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        {/* <Column field="password" header="Contraseña" sortable body={passwordBodyTemplate} headerStyle={{ width: '16%', minWidth: '10rem' }}></Column> */}
                        <Column field="rol.nombre" header="Rol de Usuario" sortable body={rolBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="activo" header="Estado" sortable body={estadoBodyTemplate} headerStyle={{ width: '10%', minWidth: '10rem' }}></Column>
                        <Column header="Acciones" body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={usuarioDialog} style={{ width: '450px' }} header="Registro Usuarios" modal className="p-fluid" footer={usuarioDialogFooter} onHide={hideDialog}>
                        <div className='formgrid grid'>
                            <div className="field col">
                                <label htmlFor="nombre">Nombre</label>
                                <InputText id="nombre" value={usuario.nombre} onChange={(e) => onInputChange(e, 'nombre')}
                                    required autoFocus className={classNames({ 'p-invalid': submitted && !usuario.nombre })} />
                                {submitted && !usuario.nombre && <small className="p-invalid">El nombre es requerido.</small>}
                            </div>
                            <div className="field col">
                                <label htmlFor="apellido">Apellido</label>
                                <InputText id="apellido" value={usuario.apellido} onChange={(e) => onInputChange(e, 'apellido')}
                                    required autoFocus className={classNames({ 'p-invalid': submitted && !usuario.apellido })} />
                                {submitted && !usuario.apellido && <small className="p-invalid">El apellido es requerido.</small>}
                            </div>
                        </div>

                        <div className="field">
                            <label htmlFor="username">Nombre Usuario</label>
                            <InputText id="username" value={usuario.username} onChange={(e) => onInputChange(e, 'username')} required autoFocus className={classNames({ 'p-invalid': submitted && !usuario.username })} />
                            {submitted && !usuario.username && <small className="p-invalid">Nombre de Usuario es requerido.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="password">Contraseña</label>
                            <Password inputid="password" value={usuario.password} onChange={(e) => onInputChange(e, 'password')}
                                toggleMask inputClassName='w-full p-3 md:w-30rem' disabled={editarPassword}
                                promptLabel='Ingrese una contraseña' weakLabel='Débil' mediumLabel='Medio' strongLabel='Fuerte'
                                required autoFocus className={classNames({ 'p-invalid': submitted && !usuario.password })} ></Password>
                            {submitted && !usuario.password && <small className="p-invalid">Contraseña usuario es requerido.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                            <Password inputid="confirmPassword" value={confirmPassword} onChange={(e) => onInputChangeConfirm(e)} disabled={editarPassword}
                                toggleMask feedback={false} inputClassName='w-full p-3 md:w-30rem' placeholder="Confirmar contraseña"
                                required autoFocus className={classNames({ 'p-invalid': submitted && !confirmPassword })} ></Password>
                            {submitted && !confirmPassword && <small className="p-invalid"> Confirmar Contraseña usuario es requerido.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="idRol">Rol</label>
                            <Dropdown id="idRol" options={roles} value={usuario.rol} onChange={(e) => onInputChange(e, 'rol')} optionLabel="nombre" placeholder="Seleccione rol de usuario"
                                emptyMessage="No se encontraron roles."
                                required autoFocus className={classNames({ 'p-invalid': submitted && !usuario.rol })}></Dropdown>
                            {submitted && !usuario.rol && <small className="p-invalid">Rol de usuario es requerido.</small>}
                        </div>

                        <div className="field-checkbox">
                            <Checkbox inputId="bloqueado" checked={checked} onChange={e => setChecked(e.checked)} />
                            <label htmlFor="bloqueado">Usuario Bloqueado</label>
                        </div>
                    </Dialog>

                    <Dialog visible={activarDesactivarUsuarioDialog} style={{ width: '450px' }} header="Confirm" modal footer={activarDesactivarUsuarioDialogFooter} onHide={hideDeleteUsuarioDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {usuario && <span>¿Está seguro de que desea <b>{usuario.activo == 1 ? "desactivar " : "activar "}</b> a <b>{usuario.username}</b>?</span>}
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
export default Usuarios;