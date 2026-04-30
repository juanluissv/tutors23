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

	// const [email, setEmail] = useState("");
	// const [password, setPassword] = useState("");

	const [email, setEmail] = useState("juanluissv@gmail.com");
	const [password, setPassword] = useState("juan");

	const [login, { isLoading }] = useLoginMutation();
	const { studentInfo } = useSelector((state) => state.authStudent);

	const { search } = useLocation();
	const sp = new URLSearchParams(search);
	const redirect = sp.get('redirect') || '/';

  	const handleSubmit = async (e) => {
		e.preventDefault()
		if (email == '') { toast.error('Please enter  email'); return; } 
		if (password == '') { toast.error('Please enter  password'); return; }
		try {
			const res = await login({ email, password }).unwrap();
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
									<h1 className='login-card__title'>Welcome back</h1>
									<p className='login-card__subtitle'>
										Sign in to your account to continue learning
									</p>
								</div>
								<form
									className='login-form'
									id='login-form'
									name='login-form'
									onSubmit={handleSubmit}
								>
									<div className='login-field'>
										<label className='login-label' htmlFor='email'>
											Email
										</label>
										<input
											type='email'
											id='email'
											name='email'
											className='login-input'
											placeholder='you@example.com'
											autoComplete='email'
											onChange={(e) => setEmail(e.target.value)}
											value={email}
										/>
									</div>
									<div className='login-field'>
										<label className='login-label' htmlFor='password'>
											Password
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
											<input
												type='checkbox'
												id='remember'
												name='remember'
												className='login-checkbox'
											/>
											<span className='login-remember__text'>
												Remember me on this device
											</span>
										</label>
									</div>
									<button
										type='submit'
										id='login-button'
										name='login-button'
										className='login-submit'
									>
										Sign in
									</button>
								</form>
								<p className='login-card__footer'>
									Don't have an account?{' '}
									<Link to='/register' className='login-card__link'>
										Sign up
									</Link>
								</p>
								<div
									className='login-card__teacher-gateway'
									role='navigation'
									aria-label='Teacher sign-in'
								>
									<div className='login-card__teacher-gateway-accent' aria-hidden /> <br />
									{/* <p className='login-card__teacher-gateway-kicker'>
										Educators
									</p> */}
									<p className='login-card__teacher-gateway-lead'>
										Are you a teacher?
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
											Teacher login
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