import React, {useState, useEffect} from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { setStudentCredentials } from '../slices/student/authStudentSlice';
import { useRegisterMutation } from '../slices/student/studentApiSlice';
import Loader from '../components/Loader';
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import '../App.css'

function RegisterScreen () {	
	const navigate = useNavigate();
  	const dispatch = useDispatch();


	const isSidebarOpen = false
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [register, { isLoading }] = useRegisterMutation();
	const { studentInfo } = useSelector((state) => state.authStudent);

	const handleToggleSidebar = () => {}

	const { search } = useLocation();
	const sp = new URLSearchParams(search);
	const redirect = sp.get('redirect') || '/';

	const handleSubmit = async (e) => {
		e.preventDefault()
		if (email == '') { toast.error('Please enter  email'); return; }
		if (password == '') { toast.error('Please enter  password'); return; }    
		if (confirmPassword == '') { toast.error('Please enter  confirm password'); return; }
		if (password !== confirmPassword) {
		  toast.error('Passwords do not match');
		} else {
		  try {
			const res = await register({ email, password }).unwrap();
			dispatch(setStudentCredentials({ ...res }));
			navigate(redirect);
		  } catch (err) {
			toast.error(err?.data?.message || err.error);
		  }
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
									<h1 className='login-card__title'>Create an account</h1>
									<p className='login-card__subtitle'>
										Sign up to start learning
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
											autoComplete='new-password'
											onChange={(e) => setPassword(e.target.value)}											
											value={password}
										/>
									</div>
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='confirm-password'
										>
											Confirm password
										</label>
										<input
											type='password'
											id='confirm-password'
											name='confirm-password'
											className='login-input'
											placeholder='••••••••'
											autoComplete='new-password'
											onChange={(e) => setConfirmPassword(e.target.value)}
											value={confirmPassword}
										/>
									</div>
									
									<button
										type='submit'
										id='register-button'
										name='register-button'
										className='login-submit'
									>
										Sign up
									</button>
								</form>
								<p className='login-card__footer'>
									Already have an account?{' '}
									<Link to='/login' className='login-card__link'>
										Sign in
									</Link>
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default RegisterScreen; 