import getConfig from 'next/config';
import React, { useContext, useEffect, useState } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './contex/layoutcontext';
import { MenuProvider } from './contex/menucontext';
import Link from 'next/link';
import Acciones from '../pages/acciones';
import { useSession } from 'next-auth/react'
import { UsuarioService } from '../demo/service/UsuarioService';

const AppMenu = () => {
    const { data: session } = useSession();
    //lista general de objetos para el menu
    const listadoGeneral = [
        {
            label: 'Tipo de Documentos',
            icon: 'pi pi-fw pi-id-card',
            to: '/TipoDocumento/'
        },
        {
            label: 'Empleados',
            icon: 'pi pi-fw pi-user',
            to: '/Empleados/'
        },
        {
            label: 'Categorías Clientes',
            icon: 'pi pi-th-large" pi-th-large',
            to: '/categoriaClientes/'
        },
        {
            label: 'Clientes',
            icon: 'pi pi-fw pi-users',
            to: '/clientes/'
        },
        {
            label: 'Países',
            icon: 'pi pi-fw pi-globe',
            to: '/paises/'
        },
        {
            label: 'Proveedores',
            icon: 'pi pi-fw pi-users',
            to: '/proveedores/'
        },
        {
            label: 'Marcas',
            icon: 'pi pi-fw pi-tablet',
            to: '/marcas/'
        },
        {
            label: 'Modelos',
            icon: 'pi pi-fw pi-box',
            to: '/modelos/'
        },
        {
            label: 'Transmisiones Automotrices',
            icon: 'pi pi-fw pi-sliders-v',
            to: '/transmisiones/'
        },
        {
            label: 'Categorías Repuestos',
            icon: 'pi pi-th-large" pi-th-large',
            to: '/categoriaRepuestos/'
        },
        {
            label: 'Repuestos',
            icon: 'pi pi-fw pi-wrench',
            to: '/repuestos/'
        },
        {
            label: 'Transportistas',
            icon: 'pi pi-truck',
            to: '/shippers/'
        },
        {
            label: 'Arqueos',
            icon: 'pi pi-users " pi-users',
            to: '/arqueos/'
        },
        {
            label: 'Métodos de Pago',
            icon: 'pi pi-fw pi-wallet',
            to: '/metodoPago/'
        },
        {
            label: 'Tipos de Entrega',
            icon: 'pi pi-fw pi-truck',
            to: '/tipoEntrega/'
        },
        {
            label: 'Impuestos',
            icon: 'pi pi-fw pi-money-bill',
            to: '/impuestos/'
        },
        {
            label: 'Cupones',
            icon: 'pi pi-fw pi-ticket',
            to: '/cupones/'
        },
        {
            label: 'Parámetros Factura',
            icon: 'pi pi-fw pi-verified',
            to: '/parametros/'
        },
        {
            label: 'Facturas',
            icon: 'pi pi-fw pi-shopping-bag',
            to: '/facturas/'
        },
        {
            label: 'Compras',
            icon: 'pi pi-fw pi-cart-plus',
            to: '/compras/'
        },
        {
            label: 'Devolución de Compras',
            icon: 'pi pi-fw pi-undo',
            to: '/devolucionesCompra/'
        },
        {
            label: 'Usuarios',
            icon: 'pi pi-fw pi-user',
            to: '/usuarios/'
        },
        {
            label: 'Cargos',
            icon: 'pi pi-briefcase" pi-briefcase',
            to: '/cargos/'
        },
        {
            label: 'Roles',
            icon: 'pi pi-building ',
            to: '/rol/'
        },
        {
            label: 'Acciones',
            icon: 'pi pi-arrow-right-arrow-left',
            to: '/acciones/'
        },
        {
            label: 'Modulos',
            icon: 'pi pi-bars',
            to: '/modulo/'
        }
    ]
    //lista de modulos a los que el usuario tiene acceso
    const [menuUsuario, setMenuUsuario] = useState([]);
    const [modelo,setModelo] = useState([]);
    const { layoutConfig } = useContext(LayoutContext);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;
    //rol segun usuario para obtener modulos
    let obtenerRol = () => {
        var info = session.user.email.split('/');
        return info[4]
    }
    
    const listarMenuModulos = () => {
        const usuarioService = new UsuarioService();
        usuarioService.getModulos(obtenerRol()).then(data => setMenuUsuario(data));
    };
    
    useEffect( () => {
        listarMenuModulos();
    }, []);
    //dentro del modelo se hace un filtro de la lista general solo los modulos que tiene accesos
    let model = [
        {
            label: 'Inicio',
            items: [{ label: 'Tablero Principal', icon: 'pi pi-fw pi-home', to: '/dashboard/' }]
        },
        {
            label: 'Módulos',
            items: listadoGeneral.filter(m => menuUsuario.includes(m.label))
        }
    ];
    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
