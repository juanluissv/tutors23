import  {useState, useEffect} from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from "react-toastify";
import { useLoginMutation } from '../slices/student/studentApiSlice';
import { setStudentCredentials } from '../slices/student/authStudentSlice';
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import '../App.css'
import Loader from '../components/Loader';

function LoginScreen () {
	const isSidebarOpen = false

	const handleToggleSidebar = () => {}

	
	const navigate = useNavigate();
  	const dispatch = useDispatch();

	const [username, setUsername] = useState('alex.rivera.2832');
	const [password, setPassword] = useState('alex');

	const [login, { isLoading }] = useLoginMutation();
	const { studentInfo } = useSelector((state) => state.authStudent);

	const { search } = useLocation();
	const sp = new URLSearchParams(search);
	const redirect = sp.get('redirect') || '/';

  	const handleSubmit = async (e) => {
		e.preventDefault()
		const un = username.trim().toLowerCase()
		if (un === '') {
			toast.error('Por favor ingresa tu nombre de usuario')
			return
		}
		if (password === '') {
			toast.error('Por favor ingresa tu contraseña')
			return
		}
		try {
			const res = await login({ username: un, password }).unwrap();
			console.log(res)
			dispatch(setStudentCredentials({ ...res }));
			navigate(redirect);
		} catch (err) {  
			toast.error(err?.data?.message || err.error.message);
		}
	}


	return (
		<div className='chat-app chat-app--login ask-screen'>
			<div className='main-container'>
				<Sidebar isOpen={isSidebarOpen} toggleSidebar={handleToggleSidebar} />
				<div className='main-content'>
					<Header
						isSidebarOpen={isSidebarOpen}
						toggleSidebar={handleToggleSidebar}
					/>
					<div className='content-area content-area--login'>
						<div className='center-content2 login-screen'>
							<div className='login-card'>
								<div className='login-card__accent' aria-hidden />
								<div className='login-card__header'>
									<h1 className='login-card__title'>Bienvenido de nuevo</h1>
									<p className='login-card__subtitle'>
										Inicia sesión en tu cuenta para seguir aprendiendo
									</p>
								</div>
								<form
									className='login-form'
									id='login-form'
									name='login-form'
									onSubmit={handleSubmit}
								>
									<div className='login-field'>
										<label className='login-label' htmlFor='username'>
											Nombre de usuario
										</label>
										<input
											type='text'
											id='username'
											name='username'
											className='login-input'
											placeholder='ej. alex.rivera.4821'
											autoComplete='username'
											onChange={(e) => setUsername(e.target.value)}
											value={username}
										/>
									</div>
									<div className='login-field'>
										<label className='login-label' htmlFor='password'>
											Contraseña
										</label>
										<input
											type='password'
											id='password'
											name='password'
											className='login-input'
											placeholder='••••••••'
											autoComplete='current-password'
											onChange={(e) => setPassword(e.target.value)}
											value={password}
										/>
									</div>
									<div className='login-field login-field--row'>
										<label
											className='login-remember'
											htmlFor='remember'
										>
											{/* <input
												type='checkbox'
												id='remember'
												name='remember'
												className='login-checkbox'
											/> */}
											<span className='login-remember__text'>
												Haz clic en Iniciar sesión para entrar a la demo 
											</span>
										</label>
									</div>
									<button
										type='submit'
										id='login-button'
										name='login-button'
										className='login-submit'
									>
										Iniciar sesión
									</button>
								</form>
								<p className='login-card__footer'>
									¿No tienes una cuenta?{' '}
									<Link to='/register' className='login-card__link'>
										Regístrate
									</Link>
								</p>
								<div
									className='login-card__teacher-gateway'
									role='navigation'
									aria-label='Inicio de sesión de profesores'
								>
									<div className='login-card__teacher-gateway-accent' aria-hidden /> <br />
									{/* <p className='login-card__teacher-gateway-kicker'>
										Educators
									</p> */}
									<p className='login-card__teacher-gateway-lead'>
										¿Eres profesor?
									</p>
									{/* <p className='login-card__teacher-gateway-hint'>
										Access your dashboard, subjects, and class tools on the
										teacher portal.
									</p> */}
									<Link
										to='/teachers/login'
										className='login-card__teacher-gateway-btn'
									>
										<span className='login-card__teacher-gateway-btn-icon'>
											<svg
												xmlns='http://www.w3.org/2000/svg'
												width='18'
												height='18'
												viewBox='0 0 24 24'
												fill='none'
												stroke='currentColor'
												strokeWidth='2'
												strokeLinecap='round'
												strokeLinejoin='round'
												aria-hidden
											>
												<path d='M4 19.5A2.5 2.5 0 0 1 6.5 17H20' />
												<path d='M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z' />
												<path d='M12 8h.01' />
											</svg>
										</span>
										<span className='login-card__teacher-gateway-btn-label'>
											Acceso para profesores
										</span>
										<span
											className='login-card__teacher-gateway-btn-arrow'
											aria-hidden
										>
											→
										</span>
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default LoginScreen;