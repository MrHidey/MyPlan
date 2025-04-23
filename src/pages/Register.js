import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Login.css';
import { toast } from 'react-toastify';


const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_BASE}/api/auth/register`, {
        email,
        password
      });

      login(res.data.token);
      toast.success('registered successfully!');

      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed.';
            toast.error({ type: 'error', message: msg });
            toast.error('Register failed');
    }
  };

  return (
    <div className="auth-container">
      <h2>Admin Register</h2>
      <form onSubmit={handleRegister} className="auth-form">
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

        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
