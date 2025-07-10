import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const text = await response.text();
      console.log('Response text:', text);
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        setError('Server returned invalid data: ' + text);
        return;
      }

      if (response.ok) {
        console.log('Registration successful:', data);
        await login(email, password);
        navigate('/');
      } else {
        setError(data.message || 'Failed to register');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Network error, please try again');
    }
  };


  return (
    <div className="card">
      <h2 className="card-title">Register</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}



