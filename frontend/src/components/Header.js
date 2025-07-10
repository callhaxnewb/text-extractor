import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="header-title">Text Extractor & Enricher</Link>
        <div>
          {user ? (
            <>
              <span>Welcome, {user.email}</span>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className='link'>Login  </Link>
              <Link to="/register" className='link'>Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}