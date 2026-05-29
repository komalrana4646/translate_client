import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  FaGoogle,
  FaApple,
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaLanguage,
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { showSuccessToast, showErrorToast } from './Notification';
import { local } from './API';
import { useAuth } from '../dataContext';

const loginValidationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),

  password: Yup.string()
    .required('Password is required'),
});

export default function Login() {

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setverify } = useAuth();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },

    validationSchema: loginValidationSchema,

    onSubmit: async (values) => {
      try {

        setLoading(true);

        const res = await axios.post(`${local}login`, values);

        if (res.status === 200) {

          localStorage.setItem('userId', res.data.id);
          localStorage.setItem('usertoken', res.data.token);

          showSuccessToast(res?.data?.msg || 'Login successful');

          setverify(true);

          navigate('/');
        }

      } catch (err) {

        if (err?.response?.data?.msg === 'pls verify otp') {

          showErrorToast(err?.response?.data?.msg);

          navigate(`/otp-verification/${err?.response?.data?.id}`);
        }

        else if (err?.response?.data?.msg === 'user not found') {

          showErrorToast(err?.response?.data?.msg);

          navigate('/signup');
        }

        else {

          showErrorToast(err?.response?.data?.msg || 'Server Error');
        }

      } finally {

        setLoading(false);
      }
    },
  });

  return (

    <div className="min-h-screen bg-[#050816] flex items-center justify-center px-4 py-4 overflow-hidden">

      {/* MAIN CONTAINER */}
      <div className="w-full max-w-5xl min-h-[650px] bg-[#0B1120] border border-[#1E293B] rounded-[28px] overflow-hidden shadow-2xl flex flex-col lg:flex-row">

        {/* LEFT SIDE */}
        <div className="lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#020617] via-[#0F172A] to-[#111827] flex items-center justify-center p-6">

          {/* Background Glow */}
          <div className="absolute top-[-100px] left-[-100px] w-[250px] h-[250px] bg-cyan-500/20 rounded-full blur-3xl"></div>

          <div className="absolute bottom-[-100px] right-[-100px] w-[260px] h-[260px] bg-blue-600/20 rounded-full blur-3xl"></div>

          {/* Grid */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:35px_35px]"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-md text-center">

            {/* Translator Circle */}
            <div className="relative mx-auto mb-7 w-32 h-32 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_50px_rgba(0,255,255,0.30)]">

              <div className="absolute inset-3 rounded-full border border-white/20"></div>

              <FaLanguage className="text-white text-6xl" />
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              AI Powered <br />
              Translator
            </h1>

            {/* Description */}
            <p className="text-gray-300 text-base leading-7">
              Translate voice and text instantly into multiple languages
              using advanced Artificial Intelligence technology.
            </p>

          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="lg:w-1/2 bg-white p-5 sm:p-7 lg:p-10 flex flex-col justify-center">

          {/* Heading */}
          <div className="mb-6">

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h1>

            <p className="text-gray-500 text-base">
              Login to your AI Translator account
            </p>
          </div>

          {/* FORM */}
          <form
            onSubmit={formik.handleSubmit}
            className="space-y-5"
          >

            {/* EMAIL */}
            <div>

              <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">

                <FaEnvelope className="text-cyan-600" />

                Email Address
              </label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                className={`w-full h-12 px-4 rounded-xl border bg-gray-50 outline-none transition-all duration-300 focus:bg-white
                ${
                  formik.touched.email && formik.errors.email
                    ? 'border-red-500 focus:ring-2 focus:ring-red-400'
                    : 'border-gray-200 focus:ring-2 focus:ring-cyan-500'
                }`}
              />

              {formik.touched.email && formik.errors.email && (

                <p className="text-red-500 text-sm mt-2">
                  {formik.errors.email}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div>

              <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">

                <FaLock className="text-cyan-600" />

                Password
              </label>

              <div className="relative">

                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                  className={`w-full h-12 px-4 rounded-xl border bg-gray-50 outline-none transition-all duration-300 focus:bg-white
                  ${
                    formik.touched.password && formik.errors.password
                      ? 'border-red-500 focus:ring-2 focus:ring-red-400'
                      : 'border-gray-200 focus:ring-2 focus:ring-cyan-500'
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {formik.touched.password && formik.errors.password && (

                <p className="text-red-500 text-sm mt-2">
                  {formik.errors.password}
                </p>
              )}
            </div>

            {/* FORGOT PASSWORD */}
            <div className="flex justify-end">

              <Link
                to="/forgot-password"
                className="text-cyan-600 hover:text-cyan-700 text-sm font-medium transition"
              >
                Forgot Password?
              </Link>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-base hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 shadow-lg"
            >
              {loading ? 'Please Wait...' : 'Log In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">

            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>

            <div className="relative flex justify-center">

              <span className="bg-white px-4 text-gray-400 text-sm">
                Or continue with
              </span>
            </div>
          </div>

          {/* SOCIAL BUTTONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            {/* GOOGLE */}
            <button className="h-12 rounded-xl border border-gray-200 hover:border-cyan-400 hover:bg-cyan-50 transition flex items-center justify-center gap-3 font-medium">

              <FaGoogle className="text-red-500 text-lg" />

              Google
            </button>

            {/* APPLE */}
            <button className="h-12 rounded-xl border border-gray-200 hover:border-black hover:bg-gray-100 transition flex items-center justify-center gap-3 font-medium">

              <FaApple className="text-xl" />

              Apple
            </button>
          </div>

          {/* SIGNUP */}
          <div className="mt-6 text-center">

            <p className="text-gray-600 text-sm">
              Don&apos;t have an account?{' '}

              <Link
                to="/signup"
                className="text-cyan-600 font-semibold hover:text-cyan-700 transition"
              >
                Sign Up
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}