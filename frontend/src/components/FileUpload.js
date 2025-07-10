import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function FileUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState(null);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState('en');
  const [enrichmentDepth, setEnrichmentDepth] = useState('medium');
  const { getToken } = useAuth();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);
    formData.append('enrichmentDepth', enrichmentDepth);

    try {
      const token = await getToken();
      const response = await fetch('http://localhost:5000/api/extract', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setExtractedInfo(data);
        if (onUploadSuccess) onUploadSuccess(data);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'File upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error.message || 'Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">Upload PDF</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf"
            className="file-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="language">Language:</label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="file-input"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="enrichmentDepth">Enrichment Depth:</label>
          <select
            id="enrichmentDepth"
            value={enrichmentDepth}
            onChange={(e) => setEnrichmentDepth(e.target.value)}
            className="file-input"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={!file || uploading}
          className={`btn btn-primary ${(!file || uploading) ? 'btn-disabled' : ''}`}
        >
          {uploading ? 'Processing...' : 'Upload and Process'}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
      {uploading && <p>Processing document, this may take a moment...</p>}
      {extractedInfo && (
        <div>
          <h3>Extracted Information</h3>
          <p><strong>Summary:</strong> {extractedInfo.summary}</p>
          <p><strong>Insights:</strong> {extractedInfo.insights}</p>
        </div>
      )}
    </div>
  );
}