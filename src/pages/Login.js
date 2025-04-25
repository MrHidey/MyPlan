import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Login.css';
import { toast } from 'react-toastify';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_BASE}/auth/login`, {
        email,
        password
      });

      login(res.data.token);
      toast.success('Logged in successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed.';
      toast.error(msg);  // Just pass the string message    
    }
  };

  return (
    <div className="auth-container">
      <h2>Admin Login</h2>
      <form onSubmit={handleLogin} className="auth-form">
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)} />

        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)} />

        <button type="submit">Login</button>
      </form>
    
      
    </div>
  );
};

export default Login;
