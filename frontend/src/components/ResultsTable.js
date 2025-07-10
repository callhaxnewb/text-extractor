import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ResultsTable({ refreshTrigger }) {
  const [extractions, setExtractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, getToken } = useAuth();

  useEffect(() => {
    fetchExtractions();
  }, [refreshTrigger]);

  const fetchExtractions = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await fetch('http://localhost:5000/api/extractions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch extractions');
      }
      const data = await response.json();
      setExtractions(data);
    } catch (error) {
      console.error('Error fetching extractions:', error);
      setError('Failed to load extractions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:5000/api/extractions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setExtractions(extractions.filter(extraction => extraction._id !== id));
      } else {
        throw new Error('Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document. Please try again.');
    }
  };

  const getOwnerName = (extraction) => {
    return extraction.user && extraction.user.email
      ? extraction.user.email.split('@')[0]
      : 'Unknown';
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="card">
      <h2 className="card-title">Processed Documents</h2>
      {extractions.length === 0 ? (
        <p>No documents processed yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Filename</th>
              <th>Created At</th>
              <th>Owner</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {extractions.map((extraction) => (
              <tr key={extraction._id}>
                <td>{extraction.filename}</td>
                <td>{new Date(extraction.createdAt).toLocaleString()}</td>
                <td>{getOwnerName(extraction)}</td>
                <td>
                  <Link to={`/extraction/${extraction._id}`} className="link">
                    View Details
                  </Link>
                  {extraction.user && user && extraction.user._id === user.id && (
                    <button onClick={() => handleDelete(extraction._id)} className="btn btn-delete">
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}