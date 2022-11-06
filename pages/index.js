import getConfig from 'next/config';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState, useRef } from 'react';
import AppConfig from '../layout/AppConfig';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { LayoutContext } from '../layout/contex/layoutcontext';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { Toast } from 'primereact/toast';
import { UsuarioService } from '../demo/service/UsuarioService';

const LoginPage = () => {
    const [click, setClick] = useState(false);
    const [checked, setChecked] = useState(false);
    const { layoutConfig } = useContext(LayoutContext);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;
    const router = useRouter();
    const toast = useRef(null);
    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden', {'p-input-filled': layoutConfig.inputStyle === 'filled'});

    let usuarioVacio = {
        username: '',
        password: ''
    }

    const [usuarios, setUsuarios] = useState([]);
    const [usuario, setUsuario] = useState(usuarioVacio);

    const listarUsuarios = () => {
        const usuarioService = new UsuarioService();
        usuarioService.getUsuarios().then(data => setUsuarios(data));
    };

    useEffect(() => {
        listarUsuarios();  
        setUsuario(usuarioVacio);
    }, []); 


    const onInputChange = (e, nombre) => {
        const val = (e.target && e.target.value) || '';
        let _usuario = { ...usuario };
        _usuario[`${nombre}`] = val;

        console.log(_usuario);
        setUsuario(_usuario);
    }

    const validarLogin = (usuario) => {
        console.log('click');
        console.log(usuario);
        if ( usuario.username.trim()=='' || usuario.password.trim()=='' ) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'No deje campos vacíos', life: 3000 }); 
        } else {
            usuarios.map((item) => {    
                if (usuario.username == item.username && usuario.password == item.password) {
                    router.push('/dashboard/')
                } else {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: 'Usuario o contraseña incorrectos', life: 3000 });   
                }
            });
        }
             
    }

    return (
        <div className={containerClassName}>
            <div className="flex flex-column align-items-center justify-content-center">
                <div style={{ borderRadius: '56px', padding: '0.3rem', background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)' }}>
                    <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
                        <Toast ref={toast} />
                        <div className="text-center mb-5">
                            <img src={`${contextPath}/demo/images/login/img_login_01.png`} alt="hyper" height="100" className="mb-3" />
                            <div className="text-900 text-3xl font-medium mb-3">Bienvenido(a)!</div>
                            <span className="text-600 font-medium">Inicia Sesión Para Continuar</span>
                        </div>

                        <div>
                            <label htmlFor="username" className="block text-900 text-xl font-medium mb-2">
                                Usuario
                            </label>
                            <InputText inputid="username" type="text" placeholder="Username" className="w-full md:w-30rem mb-5" style={{ padding: '1rem' }} 
                            value={usuario.username} onChange={(e) => onInputChange(e, 'username')}  />
                            
                            <label htmlFor="password" className="block text-900 font-medium text-xl mb-2">
                                Password
                            </label>
                            <Password inputid="password" value={usuario.password} onChange={(e) => onInputChange(e, 'password')} placeholder="Password" 
                            toggleMask className="w-full mb-5" inputClassName='w-full p-3 md:w-30rem'></Password>

                            <div className="flex align-items-center justify-content-between mb-5 gap-5">
                                <div className="flex align-items-center">
                                    <Checkbox inputid="rememberme1" checked={checked} onChange={(e) => setChecked(e.checked)} className="mr-2"></Checkbox>
                                    <label htmlFor="rememberme1">
                                        Recuérdame
                                    </label>
                                </div>
                                <a className="font-medium no-underline ml-2 text-right cursor-pointer" style={{ color: 'var(--primary-color)' }}>
                                    Olvidó su contraseña?
                                </a>
                            </div>
                            <Button label="Acceder" className="w-full p-3 text-xl" onClick={() => validarLogin(usuario)}></Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

LoginPage.getLayout = function getLayout(page) {
    return (
        <React.Fragment>
            {page}
            <AppConfig simple />
        </React.Fragment>
    );
};
export default LoginPage;
