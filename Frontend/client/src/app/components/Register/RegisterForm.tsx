'use client'

import { useContext, useEffect, useState } from 'react';
import Heading from '../Heading';
import { useRouter } from 'next/navigation';
import { register } from '@/libs/apiUrls';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { AuthContext } from '@/context/AuthContext';
import { FaRegEyeSlash } from "react-icons/fa";
import { FiEye } from "react-icons/fi";
import { useRegisterMutation } from '@/store/apiSlice';


export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const [errors, setErrors] = useState({
        username: '',
        email: '',
        password: ''
    });


    const authContext = useContext(AuthContext);

    if (!authContext) {
        throw new Error('AuthContext must be used within an AuthProvider');
    }

    const { register: authRegister, isAuthenticated } = authContext;


    const [registerUser] = useRegisterMutation();


    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/');
        };
    }, [isAuthenticated, router]);


    const validateForm = () => {
        let valid = true;
        const newErrors: any = {
            username: '',
            email: '',
            password: ''
        };

        if (username.length < 5) {
            newErrors.username = 'حداقل 5 حرف وارد شود';
            valid = false;
        };

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            newErrors.email = 'ایمیل معتبر نیست';
            valid = false;
        };

        if (password && password.length < 4) {
            newErrors.password = 'حداقل 4 حرف یا عدد وارد شود';
            valid = false;
        };

        setErrors(newErrors);
        return valid;
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        };

        try {

            const result = await registerUser({ username, email, password }).unwrap();
            localStorage.setItem('accessToken', result.accessToken);
            localStorage.setItem('refreshToken', result.refreshToken);
            authRegister(result.accessToken, result.refreshToken);
            toast.success('وارد شدید');
            window.location.reload();
            router.push('/');

        } catch (error) {
            console.log('Registration failed. Please try again', error);
            setPassword('');
            toast.error('نام کاربری یا ایمیل قبلا استفاده شده است');
        }
    };

    return (
        <div className='w-full'>
            <Heading title='عضویت در دیجی شاپ' center />
            <form onSubmit={handleRegister} className='mt-10 flex flex-col gap-3'>

                {/* Username */}
                <div className='w-full relative flex flex-col gap-1'>
                    <div>
                        <input
                            id='username'
                            type="text"
                            autoComplete='off'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={`peer w-full p-4 pt-6 outline-none bg-white font-light border-2 rounded-md transition disabled:opacity-70 disabled:cursor-not-allowed`}
                        />
                        <label
                            htmlFor="username"
                            className={`absolute text-[0.88rem] duration-150 transform -translate-y-3 top-5 z-10 origin-[0] right-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4`}
                        >
                            نام کاربری
                        </label>
                    </div>
                    {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
                </div>

                {/* Email */}
                <div className='w-full relative flex flex-col gap-1'>
                    <div>
                        <input
                            id='email'
                            type="email"
                            autoComplete='off'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`peer w-full p-4 pt-6 outline-none bg-white font-light border-2 rounded-md transition disabled:opacity-70 disabled:cursor-not-allowed`}
                        />
                        <label
                            htmlFor="email"
                            className={`absolute text-[0.88rem] duration-150 transform -translate-y-3 top-5 z-10 origin-[0] right-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4`}
                        >
                            ایمیل
                        </label>
                    </div>
                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>


                {/* Password */}
                <div className='w-full relative flex flex-col gap-1'>
                    <div>
                        <input
                            id='password'
                            type={showPassword ? "text" : "password"}
                            autoComplete='off'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`peer w-full p-4 pt-6 outline-none bg-white font-light border-2 rounded-md transition disabled:opacity-70 disabled:cursor-not-allowed`}
                        />
                        <label
                            htmlFor="password"
                            className={`absolute text-[0.88rem] duration-150 transform -translate-y-3 top-5 z-10 origin-[0] right-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4`}
                        >
                            رمز عبور
                        </label>
                        <div
                            className='absolute left-3 top-6 cursor-pointer' // Position the eye icon
                            onClick={() => setShowPassword(!showPassword)} // Toggle showPassword state
                        >
                            {showPassword ? <FiEye size={20} className='text-slate-400' /> : <FaRegEyeSlash size={20} className='text-slate-400' />} {/* Display eye or eye-slash icon */}
                        </div>
                    </div>
                    {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                </div>


                <button
                    type="submit"
                    className={`disabled:opacity-70 disabled:cursor-not-allowed rounded-md hover:opacity-80 transition w-full border-slate-700 flex items-center justify-center gap-2 bg-slate-700 text-white text-md p-4`}
                >
                    عضویت
                </button>

                <div className='text-sm text-center mt-2'>
                    حساب کاربری دارید؟ <Link href={'/login'} className='text-rose-500'>وارد شوید</Link>
                </div>
            </form>
        </div>
    );
}
