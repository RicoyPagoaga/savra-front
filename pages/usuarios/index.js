import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { UsuarioService } from '../../demo/service/UsuarioService';
import { EmpleadoService } from '../../demo/service/EmpleadoService';

const Usuarios = () => {
    let usuarioVacio = {
        idUsuario: null,
        activo: 0,
        idEmpleado:null,
        username: '',
        password:''
    };

    const [confirmPassword, setConfirmPassword] = useState('');
    const [usuarios, setUsuarios] = useState();
    const [usuarioDialog, setUsuarioDialog] = useState(false);
    const [deleteUsuarioDialog, setDeleteUsuarioDialog] = useState(false);
    const [deleteUsuariosDialog, setDeleteUsuariosDialog] = useState(false);
    const [empleados, setEmpleados] = useState([]);
    const [empleado, setEmpleado] = useState(null);
    const [usuario, setUsuario] = useState(usuarioVacio);
    const [selectedUsuarios, setSelectedUsuarios] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const toast = useRef(null);
    const dt = useRef(null)


    const listarEmpleados = () => {
        const empleadoservice = new EmpleadoService();
        empleadoservice.getEmpleados().then(data => setEmpleados(data));
    };

    const listarUsuarios = () => {
        const usuarioService = new UsuarioService();
        usuarioService.getUsuarios().then(data => setUsuarios(data));
    };

    useEffect(() => {
        listarUsuarios();
        listarEmpleados();
    }, []);

    const openNew = () => {
        setUsuario(usuarioVacio);
        setSubmitted(false);
        setUsuarioDialog(true);
        setEmpleado(null);
        setConfirmPassword('');
    }

    const hideDialog = () => {
        setSubmitted(false);
        setUsuarioDialog(false);
    }

    const hideDeleteUsuarioDialog = () => {
        setDeleteUsuarioDialog(false);
    }

    const hideDeleteUsuariosDialog = () => {
        setDeleteUsuariosDialog(false);
    }

    const pasoRegistro = () => {
        listarUsuarios();
        setUsuarioDialog(false);
        setUsuario(usuarioVacio);
    }

    const saveUsuario = async () => {
        setSubmitted(true);
            if( confirmPassword != usuario.password ) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'Contraseñas no coinciden', life: 3000 });
                console.log(usuario.password)
                console.log(usuario.confirmPassword)
                
            } else{
                if (usuario.idUsuario) {
                    try {
                        const usuarioService = new UsuarioService();
                        await usuarioService.updateUsuario(usuario);
                        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Usuario Actualizado', life: 3000 });
                        pasoRegistro();
                    } catch (error) {
                        toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails , life: 3000 });
                        console.log(error.errorDetails);
                    }
                }
                else {
                    try {
                        const usuarioService = new UsuarioService();
                        await usuarioService.addUsuario(usuario);
                        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Usuario Creado', life: 3000 });
                        pasoRegistro();
                    } catch (error) {
                        toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails , life: 3000 });
                    }    
                }
            }
    }
    const editUsuario = (usuario) => {
        setUsuario({ ...usuario});
        const empleado = empleados.find((item) => {
            if(item.idEmpleado == usuario.idEmpleado)
            return item
        });
        setEmpleado(empleado);
        setUsuarioDialog(true);
        setConfirmPassword();
    }

    const confirmDeleteUsuario = (usuario) => {
        setUsuario(usuario);
        setDeleteUsuarioDialog(true);

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

    const exportCSV = () => {
        dt.current.exportCSV();
    };

    const confirmDeleteSelected = () => {
        setDeleteUsuariosDialog(true);
    }


    const deleteSelectedUsuarios = async () => {
        const usuarioService = new UsuarioService();
        selectedUsuarios.map(async (usuario) => {
            await usuarioService.removeUsuario(usuario.idUsuario);
        });
        let _usuarios = usuarios.filter((val) => !selectedUsuarios.includes(val));
        setUsuarios(_usuarios);
        setDeleteUsuariosDialog(false);
        setSelectedUsuarios(null);
       
        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Usuarios Eliminados', life: 3000 });
    }


    const onInputChange = (e, nombre) => {
        const val = (e.target && e.target.value) || '';
        let _usuario = { ...usuario };
        if (nombre != 'idEmpleado')
            _usuario[`${nombre}`] = val;
        else {
            _usuario[`${nombre}`] = val.idEmpleado;
            setEmpleado(e.value)
        }
        
        //console.log(marca);
        setUsuario(_usuario);
    }

    const onInputChangeConfirm = (e) => {
        const val = (e.target && e.target.value) || '';
        console.log(e.target.value);
        setConfirmPassword(e.target.value);
    }

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Nuevo" icon="pi pi-plus" className="p-button-success mr-2" onClick={openNew} />
                    <Button label="Eliminar" icon="pi pi-trash" className="p-button-danger" onClick={confirmDeleteSelected} disabled={!selectedUsuarios || !selectedUsuarios.length} />
                </div>
            </React.Fragment>
        )
    }

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                {/* <FileUpload mode="basic" accept="image/*" maxFileSize={1000000} label="Importar" chooseLabel="Import" className="mr-2 inline-block" /> */}
                <Button label="Exportar" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />
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

    const bloqueadoBodyTemplate = (rowData) => {
        return (
            <>
                <span className="p-column-title">Activo</span>
                {rowData.activo}
            </>
        );
    }

    const empleadoBodyTemplate = (rowData) => {
        const empleado = empleados.find((item) => {
            if(item.idEmpleado == rowData.idEmpleado)
                 return item;
            });
        if(empleado != null){
            return (
                <>
                    <span className="p-column-title">Empleado</span>
                    {
                        empleado.nombre
                    }
                    
                </>
            );
        }else{
            return (
                <>
                    <span className="p-column-title">Id Empleado</span>
                    {
                        rowData.idEmpleado
                    }
                    
                </>
            );
        }



    }


    const actionBodyTemplate = (rowData) => {
        return (
            <div className="actions">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => editUsuario(rowData)} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-warning mt-2" onClick={() => confirmDeleteUsuario(rowData)} />
            </div>
        );
    }

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Usuarios</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.target.value)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const usuarioDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" className="p-button-text" onClick={saveUsuario}/>
        </>
    );
    const deleteUsuarioDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteUsuarioDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteUsuario} />
        </>
    );
    const deleteUsuariosDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={hideDeleteUsuariosDialog} />
            <Button label="Sí" icon="pi pi-check" className="p-button-text" onClick={deleteSelectedUsuarios} />
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
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem'}}></Column>
                        <Column field="idUsuario" header="ID" sortable body={idBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="idEmpleado" header="Empleado" sortable body={empleadoBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="usermame" header="Nombre Usuario" sortable body={nombreBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="password" header="Contraseña" sortable body={passwordBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column field="activo" header="Bloqueado" sortable body={bloqueadoBodyTemplate} headerStyle={{ width: '14%', minWidth: '10rem' }}></Column>
                        <Column body={actionBodyTemplate}></Column>
                    </DataTable>

                    <Dialog visible={usuarioDialog} style={{ width: '450px' }} header="Registro Usuarios" modal className="p-fluid" footer={usuarioDialogFooter} onHide={hideDialog}>
                        {/* {product.image && <img src={`assets/demo/images/product/${product.image}`} alt={product.image} width="150" className="mt-0 mx-auto mb-5 block shadow-2" />} */}
                        <div className="field">
                            <label htmlFor="idEmpleado">Empleado</label>
                            <Dropdown id="idEmpleado" options={empleados} value={empleado} onChange={(e) => onInputChange(e, 'idEmpleado')} placeholder="Seleccione un empleado" optionLabel="nombre"></Dropdown>
                        </div>

                        <div className="field">
                            <label htmlFor="username">Nombre Usuario</label>
                            <InputText id="username" value={usuario.username} onChange={(e) => onInputChange(e, 'username')} required autoFocus className={classNames({ 'p-invalid': submitted && !usuario.username })} />
                            { submitted && !usuario.username && <small className="p-invalid">Nombre usuario es requerido.</small> }
                        </div>

                        <div className="field">
                            <label htmlFor="password">Contraseña</label>
                            <InputText id="password" value={usuario.password} onChange={(e) => onInputChange(e, 'password')} required autoFocus className={classNames({ 'p-invalid': submitted && !usuario.password })} />
                            { submitted && !usuario.password && <small className="p-invalid">Contraseña usuario es requerido.</small> }
                        </div>

                        <div className="field">
                            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                            <InputText id="confirmPassword" value={confirmPassword} onChange={(e) => onInputChangeConfirm(e)} required autoFocus className={classNames({ 'p-invalid': submitted && !usuario.confirmPassword })} placeholder="Confirmar contraseña" />
                            { submitted && !confirmPassword && <small className="p-invalid"> Confirmar Contraseña usuario es requerido.</small> }
                        </div>
                    </Dialog> 

                    <Dialog visible={deleteUsuarioDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteUsuarioDialogFooter} onHide={hideDeleteUsuarioDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {usuario && <span>¿Está seguro de que desea eliminar a <b>{usuario.username}</b>?</span>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteUsuariosDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteUsuariosDialogFooter} onHide={hideDeleteUsuariosDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {usuario && <span>¿Está seguro de que desea eliminar los registros seleccionados?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default Usuarios;
