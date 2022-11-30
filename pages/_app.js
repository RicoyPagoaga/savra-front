import React from 'react';
import { LayoutProvider } from '../layout/contex/layoutcontext';
import Layout from '../layout/layout';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../styles/layout/layout.scss';
import '../styles/demo/Demos.scss';
import '../pages/repuestos/DataTableDemo.css';
import { locale, addLocale, updateLocaleOption, updateLocaleOptions, localeOption, localeOptions } from 'primereact/api';

 export default function  MyApp({ Component, pageProps }) {
    addLocale('es', {
        firstDayOfWeek: 1,
        dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
        dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
        dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
        monthNames: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
        monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
        today: 'Hoy',
        clear: 'Limpiar'
    });
    
    locale('es');
    if (Component.getLayout) {
        return (
            <LayoutProvider>
                {Component.getLayout(<Component {...pageProps} />)}
            </LayoutProvider>
        )
    } else {
        return (
            <LayoutProvider>
                <Layout>
                    <Component {...pageProps} />
                </Layout>
            </LayoutProvider>
        );
    }


    
}

