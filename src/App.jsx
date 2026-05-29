import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import OtpVerification from './components/otpVerification';

import { useAuth } from './dataContext';

export default function App() {

  const { verify } = useAuth();

  return (

    <BrowserRouter>

      <Routes>

        {/* HOME */}
        <Route
          path="/"
          element={
            verify
              ? <Home />
              : <Navigate to="/login" />
          }
        />

        {/* LOGIN */}
        <Route
          path="/login"
          element={
            !verify
              ? <Login />
              : <Navigate to="/" />
          }
        />

        {/* SIGNUP */}
        <Route
          path="/signup"
          element={<Signup />}
        />

        {/* OTP */}
        <Route
          path="/otp-verification/:id"
          element={<OtpVerification />}
        />

      </Routes>

    </BrowserRouter>
  );
}