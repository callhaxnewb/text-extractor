import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import FileUpload from './components/FileUpload';
import ResultsTable from './components/ResultsTable';
import ExtractionDetails from './components/ExtractionDetails';
import './App.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
}

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <AuthProvider>
      <Router>
        <div>
          <Header />
          <main className="main-content">
            <div className="container">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <FileUpload onUploadSuccess={handleUploadSuccess} />
                    <ResultsTable refreshTrigger={refreshTrigger} />
                  </ProtectedRoute>
                } />
                <Route path="/extraction/:id" element={
                  <ProtectedRoute>
                    <ExtractionDetails />
                  </ProtectedRoute>
                } />
              </Routes>
            </div>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;