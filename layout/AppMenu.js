import getConfig from 'next/config';
import React, { useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './contex/layoutcontext';
import { MenuProvider } from './contex/menucontext';
import Link from 'next/link';

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;
    const model = [
        {
            label: 'Inicio',
            items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/dashboard/' }]
        },
        {
            label: 'Ambitos',
            items: [
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
                    label: 'Trasmisiones Automotrices',
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
                    label: 'Shippers',
                    icon: 'pi pi-truck',
                    to: '/shippers/'
                },
                {
                    label: 'Arqueos',
                    icon:'pi pi-users " pi-users',
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
            ]
        },
        {
            label: 'Utilidades',
            icon: 'pi pi-fw pi-briefcase',
            to: '/pages',
            items: [
                {
                    label: 'Calendario',
                    icon: 'pi pi-fw pi-calendar',
                    to: ''
                }
            ] 
        },
        {
            label: 'Administración',
            icon: 'pi pi-fw pi-briefcase',
            to: '/pages',
            items: [
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
                    label: 'Permisos',
                    icon: 'pi pi-lock" pi-lock',
                    to: '/permisos/'
                }
            ] 
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
