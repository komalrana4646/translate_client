import React, { useState } from 'react';
import { useFormik } from 'formik';
import {
  FaGoogle,
  FaEye,
  FaEyeSlash,
  FaUser,
  FaEnvelope,
  FaLock,
  FaVenusMars,
  FaCheckCircle,
  FaLanguage,
} from 'react-icons/fa';

import { validationSchema } from './Validation.jsx';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

import {
  showErrorToast,
  showSuccessToast,
} from './Notification.jsx';

import { local } from './API.jsx';

export default function Signup() {

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoadiing] = useState(false);

  const Navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      gender: '',
    },

    validationSchema: validationSchema,

    onSubmit: async (values) => {

      try {

        setLoadiing(true);
        const res = await axios.post(`${local}create`,values);
        const id = res?.data?.db?.id;
      
        if (res.status === 200 || res.status === 201) {

          showSuccessToast(
            res.data.msg || 'Successfully Created Account'
          );

          Navigate(`/otp-verification/${id}`);
        }

      } catch (err) {

        showErrorToast('Server Error');

      } finally {

        setLoadiing(false);
      }
    },
  });

  const handleGoogleLogin = () => {
    console.log('Login with Google');
  };

  const formFields = [
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      icon: FaUser,
      placeholder: 'Enter your name...',
      showPasswordToggle: false,
    },

    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      icon: FaEnvelope,
      placeholder: 'Enter your email...',
      showPasswordToggle: false,
    },

    {
      name: 'password',
      label: 'Password',
      type: showPassword ? 'text' : 'password',
      icon: FaLock,
      placeholder: 'Enter your password...',
      showPasswordToggle: true,
      toggleState: showPassword,
      setToggleState: setShowPassword,
    },

    {
      name: 'confirmPassword',
      label: 'Confirm Password',
      type: showConfirmPassword ? 'text' : 'password',
      icon: FaCheckCircle,
      placeholder: 'Confirm your password...',
      showPasswordToggle: true,
      toggleState: showConfirmPassword,
      setToggleState: setShowConfirmPassword,
      showMatchIndicator: true,
    },
  ];

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

  const passwordsMatch =
    formik.values.password &&
    formik.values.confirmPassword &&
    formik.values.password ===
      formik.values.confirmPassword;

  return (

    <div className="h-screen bg-[#050816] flex items-center justify-center px-4 overflow-hidden">

      {/* MAIN CONTAINER */}
      <div className="w-full max-w-4xl h-[88vh] bg-[#0B1120] border border-[#1E293B] rounded-[24px] overflow-hidden shadow-2xl flex flex-col lg:flex-row">

        {/* LEFT SIDE */}
        <div className="lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#020617] via-[#0F172A] to-[#111827] flex items-center justify-center p-5">

          {/* Glow Effects */}
          <div className="absolute top-[-80px] left-[-80px] w-[220px] h-[220px] bg-cyan-500/20 rounded-full blur-3xl"></div>

          <div className="absolute bottom-[-80px] right-[-80px] w-[220px] h-[220px] bg-blue-600/20 rounded-full blur-3xl"></div>

          {/* Grid */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:30px_30px]"></div>
          </div>

          {/* CONTENT */}
          <div className="relative z-10 max-w-sm text-center">

            {/* Translator Icon */}
            <div className="relative mx-auto mb-5 w-24 h-24 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_40px_rgba(0,255,255,0.30)]">

              <div className="absolute inset-2 rounded-full border border-white/20"></div>

              <FaLanguage className="text-white text-5xl" />
            </div>

            {/* Heading */}
            <h1 className="text-3xl font-bold text-white leading-tight mb-3">
              Join AI <br />
              Translator
            </h1>

            {/* Description */}
            <p className="text-gray-300 text-sm leading-6">
              Create your account and start translating
              voice and text instantly into multiple
              languages using advanced AI technology.
            </p>

          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="lg:w-1/2 bg-white p-5 sm:p-6 lg:p-7 flex flex-col justify-center">

          {/* Heading */}
          <div className="mb-4">

            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Create Account
            </h1>

            <p className="text-gray-500 text-sm">
              Sign up to continue with AI Translator
            </p>
          </div>

          {/* FORM */}
          <form
            onSubmit={formik.handleSubmit}
            className="space-y-3"
          >

            {/* FORM FIELDS */}
            {formFields.map((field) => {

              const Icon = field.icon;

              const hasError =
                formik.touched[field.name] &&
                formik.errors[field.name];

              return (
                <div key={field.name}>

                  <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">

                    <Icon className="text-cyan-600" />

                    {field.label}
                  </label>

                  {field.showPasswordToggle ? (

                    <div className="relative">

                      <input
                        type={field.type}
                        name={field.name}
                        placeholder={field.placeholder}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values[field.name]}
                        className={`w-full h-11 px-4 rounded-xl border bg-gray-50 outline-none transition-all duration-300 focus:bg-white
                        ${
                          hasError
                            ? 'border-red-500 focus:ring-2 focus:ring-red-400'
                            : 'border-gray-200 focus:ring-2 focus:ring-cyan-500'
                        }`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          field.setToggleState(
                            !field.toggleState
                          )
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition"
                      >
                        {field.toggleState ? (
                          <FaEyeSlash />
                        ) : (
                          <FaEye />
                        )}
                      </button>
                    </div>

                  ) : (

                    <input
                      type={field.type}
                      name={field.name}
                      placeholder={field.placeholder}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values[field.name]}
                      className={`w-full h-11 px-4 rounded-xl border bg-gray-50 outline-none transition-all duration-300 focus:bg-white
                      ${
                        hasError
                          ? 'border-red-500 focus:ring-2 focus:ring-red-400'
                          : 'border-gray-200 focus:ring-2 focus:ring-cyan-500'
                      }`}
                    />
                  )}

                  {hasError && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors[field.name]}
                    </p>
                  )}

                  {field.showMatchIndicator &&
                    passwordsMatch && (
                      <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                        <FaCheckCircle />
                        Passwords match
                      </p>
                    )}
                </div>
              );
            })}

            {/* GENDER */}
            <div>

              <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">

                <FaVenusMars className="text-cyan-600" />

                Gender
              </label>

              <div className="flex gap-4">

                {genderOptions.map((option) => (

                  <label
                    key={option.value}
                    className="flex items-center text-sm text-gray-700"
                  >

                    <input
                      type="radio"
                      name="gender"
                      value={option.value}
                      onChange={formik.handleChange}
                      checked={
                        formik.values.gender === option.value
                      }
                      className="mr-2 accent-cyan-600"
                    />

                    {option.label}
                  </label>
                ))}
              </div>

              {formik.touched.gender &&
                formik.errors.gender && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.gender}
                  </p>
                )}
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 shadow-lg"
            >
              {loading ? 'Loading...' : 'Sign Up'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4">

            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>

            <div className="relative flex justify-center">

              <span className="bg-white px-4 text-gray-400 text-sm">
                Or continue with
              </span>
            </div>
          </div>

          {/* GOOGLE BUTTON */}
          <button
            onClick={handleGoogleLogin}
            className="w-full h-11 rounded-xl border border-gray-200 hover:border-cyan-400 hover:bg-cyan-50 transition flex items-center justify-center gap-3 font-medium text-sm"
          >

            <FaGoogle className="text-red-500 text-lg" />

            Sign up with Google
          </button>

          {/* LOGIN LINK */}
          <div className="mt-4 text-center">

            <p className="text-gray-600 text-sm">
              Already have an account?{' '}

              <Link
                to="/login"
                className="text-cyan-600 font-semibold hover:text-cyan-700 transition"
              >
                Sign In
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}