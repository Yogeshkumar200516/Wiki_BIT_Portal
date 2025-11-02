import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './Login.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import authImage from '../../assets/images/auth.png';
import logoImage from '../../assets/images/logo.png';

const Login = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  // Simulate Google login
  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      // Simulate a successful login with dummy data
      const userData = {
        email: 'user@example.com',
        id: '1234567890',
        role: 'faculty',
        department: 'Engineering',
      };

      localStorage.setItem('user', JSON.stringify(userData));
      setLoading(false);

      // Trigger the onLogin callback
      onLogin(userData);
    }, 2000); // Simulate network delay
  };

  return (
    <div className='login-wrapper'>
        <div className="login-container">
      <div className="login-left">
        <div className="left">
          <h1 className="login-title">Wiki BIT</h1>
          <p className="login-subtitle">
            A student thrives on the foundation of knowledge, the light of curiosity, and the guidance of resources, which empower their journey to success.
          </p>
          <div className="login-illustration">
            <img src={authImage} alt="Illustration" />
          </div>
        </div>
      </div>
      <div className="login-right">
        <img src={logoImage} alt="Logo" className="login-logo" />
        <div className="login-signin">Sign In</div>
        <div className="login-access">Get access to your account</div>
        <hr className="divider" />
        <form className="login-form">
          <button
            type="button"
            className="login-button-google"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faGoogle} className="google-icon" />
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </button>
        </form>
      </div>
    </div>
    </div>
  );
};

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
};

export default Login;
