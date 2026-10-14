import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setToken } from '../api.js';

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const fn = mode === 'login' ? api.login : api.register;
      const { token } = await fn(email, password);
      setToken(token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form className="card auth" onSubmit={submit}>
      <h1>{mode === 'login' ? 'Sign in' : 'Create first admin account'}</h1>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input
        type="password"
        placeholder="Password (min 8 characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <p className="error">{error}</p>}
      <button type="submit">{mode === 'login' ? 'Sign in' : 'Register'}</button>
      <button type="button" className="link" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        {mode === 'login' ? 'First time? Create the admin account' : 'Back to sign in'}
      </button>
    </form>
  );
}
