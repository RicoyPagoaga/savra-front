import getConfig from 'next/config';
import Link from 'next/link';
import Router, { useRouter } from 'next/router';
import { classNames, ConnectedOverlayScrollHandler } from 'primereact/utils';
import React, { forwardRef, useContext, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { LayoutContext } from './contex/layoutcontext';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Menu } from 'primereact/menu';
import { UsuarioService } from '../demo/service/UsuarioService';
import { ClienteService } from '../demo/service/clienteservice';
import { Toast } from 'primereact/toast';
import { signOut, useSession } from 'next-auth/react'

const AppTopbar = forwardRef((props, ref) => {
    let usuarioVacio = {
        idUsuario: null,
        username: '',
        password: '',
        activo: 1,
        bloqueado: 0,
        idRol: null,
        nombre: '',
        apellido: '',
        clientesVista: 0,
        ultimaVisita: null
    };
    const { layoutConfig, layoutState, onMenuToggle, showProfileSidebar, setLayoutConfig } = useContext(LayoutContext);
    const menubuttonRef = useRef(null);
    const topbarmenuRef = useRef(null);
    const topbarmenubuttonRef = useRef(null);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;
    const menuPerfil = useRef(null);
    const menuConfig = useRef(null);
    const [usuario, setUsuario] = useState(usuarioVacio);
    const [saludoHora, setSaludoHora] = useState("");
    const [cerrarSesionDialog, setCerrarSesionDialog] = useState(false);
    const [usuarios, setUsuarios] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [cantidadClientes, setCantidadClientes] = useState(0);
    const toast = useRef(null);
    const { data: session } = useSession();

    const confirmarCerrarSesion = () => {
        setCerrarSesionDialog(true);
    }
    const listarClientes = () => {
        const clienteservice = new ClienteService();
        clienteservice.getClientes().then(data => setClientes(data));
        setCantidadClientes(clientes.length);
    };
    const listarUsuarios = () => {
        const usuarioService = new UsuarioService();
        usuarioService.getUsuarios().then(data => setUsuarios(data));
    };
    const encontrarUsuario = async () => {
        listarUsuarios();
        const user = usuarios.find((item) => {
            if (item.username === session.user.email) {
                return item;
            }
        });
        setUsuario(user);
    }
    const saludarHora = () => {
        var hora = new Date().getHours()
        var saludo = '';
        if (hora < 12) {
            saludo = 'Buenos Días';
        } else if (hora > 12 && hora < 18) {
            saludo = 'Buenas Tardes';
        } else {
            saludo = 'Buenas Noches';
        }
        setSaludoHora(saludo);
    }

    useEffect(() => {
        listarClientes();
        saludarHora()
        encontrarUsuario();
    }, [])
    const actualizarUsuario = async () => {
        try {
            let date = Date.now()
            const usuarioService = new UsuarioService();
            await usuarioService.cerrarSesion(clientes.length,date,session.user.email);
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: error.details, life: 3000 });
        }
    }
    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current
    }));
    //metodos de cambio de Aspecto
    const changeTheme = (theme, colorScheme) => {
        const themeLink = document.getElementById('theme-css');
        const themeHref = themeLink ? themeLink.getAttribute('href') : null;
        const newHref = themeHref ? themeHref.replace(layoutConfig.theme, theme) : null;

        replaceLink(themeLink, newHref, () => {
            setLayoutConfig((prevState) => ({ ...prevState, theme, colorScheme }));
        });
    };
    const replaceLink = (linkElement, href, onComplete) => {
        if (!linkElement || !href) {
            return;
        }

        const id = linkElement.getAttribute('id');
        const cloneLinkElement = linkElement.cloneNode(true);

        cloneLinkElement.setAttribute('href', href);
        cloneLinkElement.setAttribute('id', id + '-clone');

        linkElement.parentNode.insertBefore(cloneLinkElement, linkElement.nextSibling);

        cloneLinkElement.addEventListener('load', () => {
            linkElement.remove();

            const element = document.getElementById(id); // re-check
            element && element.remove();

            cloneLinkElement.setAttribute('id', id);
            onComplete && onComplete();
        });
    };
    //
    const ocultarCerrarSesionDialog = () => {
        setCerrarSesionDialog(false);
    };
    function cerrarSesion() {
        actualizarUsuario()
        signOut({ redirect: '/' })
        toast.current.show({ severity: 'success', summary: 'Éxito', detail: 'Sesión Finalizada', life: 3000 });
    }
    let itemsPerfil = [
        {
            label: 'Sesión',
            items: [{ label: 'Cerrar Sesión', icon: 'pi pi-fw pi-power-off', command: (e) => { confirmarCerrarSesion() } }]
        }
    ]
    let itemsConfig = [
        {
            label: 'Tema',
            items: [{ label: 'Oscuro', icon: 'pi pi-fw pi-moon', command: () => { changeTheme('lara-dark-indigo', 'dark') } },
            { label: 'Claro', icon: 'pi pi-fw pi-sun', command: () => { changeTheme('lara-light-indigo', 'light') } }]
        }
    ]

    const cerrarSesionDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" className="p-button-text" onClick={ocultarCerrarSesionDialog} />
            <Button label="Si" icon="pi pi-check" className="p-button-text" onClick={cerrarSesion} />
        </>
    );

    return (
        <div className="layout-topbar">
            <Toast ref={toast} />
            <Link href="/dashboard/">
                <a className="layout-topbar-logo">
                    <>
                        <img src={`${contextPath}/layout/images/logo-${layoutConfig.colorScheme !== 'light' ? 'white' : 'dark'}.svg`} width="47.22px" height={'35px'} widt={'true'} alt="logo" />
                        <span>SAVRA</span>
                    </>
                </a>
            </Link>

            <button ref={menubuttonRef} type="button" className="p-link layout-menu-button layout-topbar-button" onClick={onMenuToggle}>
                <i className="pi pi-bars" />
            </button>

            <button ref={topbarmenubuttonRef} type="button" className="p-link layout-topbar-menu-button layout-topbar-button" onClick={showProfileSidebar}>
                <i className="pi pi-ellipsis-v" />
            </button>
            <span className="font-medium ml-2">{saludoHora} , {session.user.name ? session.user.name : usuario}</span>
            <div ref={topbarmenuRef} className={classNames('layout-topbar-menu', { 'layout-topbar-menu-mobile-active': layoutState.profileSidebarVisible })}>

                <Menu model={itemsPerfil} popup ref={menuPerfil} id="popup_menu" />
                <button type="button" className="p-link layout-topbar-button" onClick={(event) => menuPerfil.current.toggle(event)}>
                    <i className="pi pi-user"></i>
                    <span>Perfil</span>
                </button>
                <Menu model={itemsConfig} popup ref={menuConfig} id="popup_menu" />
                <button type="button" className="p-link layout-topbar-button" onClick={(event) => menuConfig.current.toggle(event)}>
                    <i className="pi pi-cog"></i>
                    <span>Configuración</span>
                </button>
            </div>
            <Dialog visible={cerrarSesionDialog} style={{ width: '450px' }} header="Confirmación" modal footer={cerrarSesionDialogFooter} onHide={ocultarCerrarSesionDialog}>
                <div className="flex align-items-center justify-content-center">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {(
                        <span>
                            Esta seguro que desea salir?
                        </span>
                    )}
                </div>
            </Dialog>
        </div>
    );
});

export default AppTopbar;
