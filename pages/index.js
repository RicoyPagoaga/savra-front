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
import { signIn} from 'next-auth/react';

const LoginPage = () => {
    const [checked, setChecked] = useState(false);
    const { layoutConfig } = useContext(LayoutContext);
    const contextPath = getConfig().publicRuntimeConfig.contextPath;
    const router = useRouter();
    const toast = useRef(null);
    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden', { 'p-input-filled': layoutConfig.inputStyle === 'filled' });
    

    let usuarioVacio = {
        username: '',
        password: '',
        intentos: 0
    }
    
    const [listaUsuarios, setListaUsuarios] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [usuario, setUsuario] = useState(usuarioVacio);
    const [miUsuario,setMiUsuario] = useState(null);
    const listarUsuarios = () => {
        const usuarioService = new UsuarioService();
        usuarioService.getUsuarios().then(data => setListaUsuarios(data));
    };
    async function IniciarSesion(usuario){
        console.log(usuario.ventasVista);
        const status = await signIn('credentials',{
            redirect:false,
            nombre:   usuario.nombre,
            apellido: usuario.apellido,
            clientesVista:usuario.clientesVista,
            ultimaVisita:  usuario.ultimaVisita,
            ventasVista: usuario.ventasVista,
            repuestosVista: usuario.repuestosVista,
            nombreUsuario:usuario.username,
            callbackUrl:'/dashboard/'
        })
        console.log(status);
        if(status.ok) router.push(status.url); 
    }
    useEffect(() => {
        listarUsuarios();
        setUsuario(usuarioVacio);
    }, []);


    const onInputChange = (e, nombre) => {
        const val = (e.target && e.target.value) || '';
        let _usuario = { ...usuario };
        _usuario[`${nombre}`] = val;

        setUsuario(_usuario);
    }
    

    const validarLogin = async (usuario) => {
        if (usuario.username.trim() == '' || usuario.password.trim() == '') {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'No deje campos vacíos', life: 3000 });
        } else {
            try {
                let y;
                const usuarioService = new UsuarioService();
                await usuarioService.validarUsuarioBloqueado(usuario.username).then(data => y = data);

                if (y == true) {
                    setUsuario(usuarioVacio);
                    toast.current.show({ severity: 'error', summary: 'Error', detail: 'No puede acceder, el Usuario está bloqueado', life: 3000 });
                } else {
                    //validar password y username
                    let x;
                    await usuarioService.validarLogin(usuario.username, usuario.password).then(data => x = data);
                    //console.log(x);
                    switch (x) {
                        case true:
                            setUsuarios([]);
                            const user = listaUsuarios.find((item) => {
                                if (item.username === usuario.username)
                                    return item;
                            });
                            IniciarSesion(user);
                            break;
                        case false:
                            let existe = false;
                            listaUsuarios.map((item) => {
                                if (item.username === usuario.username)
                                    existe = true
                            });

                            if (existe === true && usuario.username !== 'admin') { //si el usuario existe, se cuenta intentos fallidos
                                let _usuario = { ...usuario };
                                let _usuarios = [...usuarios];
                                const index = findByUsername(usuario.username);
                                let intentos = 0;
                                if (index == -1) {
                                    _usuario.intentos++;
                                    _usuarios.push(_usuario);
                                    intentos = _usuario.intentos;
                                } else {
                                    let u = _usuarios[index];
                                    u.intentos++;
                                    _usuarios[index] = u;
                                    intentos = u.intentos;
                                }
                                if (intentos >= 3) {
                                    toast.current.show({ severity: 'error', summary: 'Error', detail: 'Usuario bloqueado', life: 3000 });
                                    await usuarioService.bloquearUsuario(1, usuario.username);
                                } else
                                    toast.current.show({ severity: 'error', summary: 'Error', detail: 'Usuario o contraseña incorrectos', life: 3000 });

                                setUsuarios(_usuarios);
                                setUsuario(usuarioVacio);
                            } else {
                                setUsuario(usuarioVacio);
                                toast.current.show({ severity: 'error', summary: 'Error', detail: 'Usuario o contraseña incorrectos', life: 3000 });
                            }
                    }
                }


            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: error.errorDetails, life: 3000 });
            }

        }

    }

    const findByUsername = (username) => {
        let index = -1;
        for (let i = 0; i < usuarios.length; i++) {
            if (usuarios[i].username === username) {
                index = i;
                break;
            }
        }

        return index;
    }

    return (
        
        <div className={containerClassName}>
            <div className="flex flex-column align-items-center justify-content-center">
                <div style={{ borderRadius: '56px', padding: '0.3rem', background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)' }}>
                    <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
                        <Toast ref={toast} />
                        <div className="text-center mb-5">
                            <img src={`${contextPath}/demo/images/login/img_login_01.png`} alt="hyper" height="100" className="mb-3" />
                            <div className="text-900 text-3xl font-medium mb-3">¡Bienvenido(a)!</div>
                            <span className="text-600 font-medium">Inicia Sesión Para Continuar</span>
                        </div>

                        <div>
                            <label htmlFor="username" className="block text-900 text-xl font-medium mb-2">
                                Usuario
                            </label>
                            <InputText inputid="username" type="text" placeholder="Nombre de Usuario" className="w-full md:w-30rem mb-5" style={{ padding: '1rem' }}
                                value={usuario.username} onChange={(e) => onInputChange(e, 'username')} />

                            <label htmlFor="password" className="block text-900 font-medium text-xl mb-2">
                                Contraseña
                            </label>
                            <Password inputid="password" value={usuario.password} onChange={(e) => onInputChange(e, 'password')} placeholder="Contraseña"
                                toggleMask feedback={false} className="w-full mb-5" inputClassName='w-full p-3 md:w-30rem'></Password>

                            <div className="flex align-items-center justify-content-between mb-5 gap-5">
                                <div className="flex align-items-center">
                                    <Checkbox inputid="rememberme1" checked={checked} onChange={(e) => setChecked(e.checked)} className="mr-2"></Checkbox>
                                    <label htmlFor="rememberme1">
                                        Recuérdame
                                    </label>
                                </div>
                                <a className="font-medium no-underline ml-2 text-right cursor-pointer" style={{ color: 'var(--primary-color)' }}>
                                    ¿Olvidó su contraseña?
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
