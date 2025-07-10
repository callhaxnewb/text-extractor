import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';

export default function ExtractionDetails() {
  const [extraction, setExtraction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  const fetchExtractionDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/extractions/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch extraction details');
      }
      const data = await response.json();
      
      // Process insights to remove the prompt and format as a numbered list
      if (data.insights) {
        const insightsText = data.insights.replace(/^Based on the following summary, provide key insights:\s*/, '');
        const insightsList = insightsText.split(/\d+\.\s*/).filter(item => item.trim() !== '');
        data.formattedInsights = insightsList.map((item, index) => `${index + 1}. ${item.trim()}`).join('\n');
      }
      
      setExtraction(data);
    } catch (error) {
      console.error('Error fetching extraction details:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchExtractionDetails();
  }, [fetchExtractionDetails]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!extraction) return <div>No extraction found</div>;

  return (
    <div className="container">
      <Link to="/" className="link">&larr; Back to all extractions</Link>
      <div><br/></div>
      <div className="card">
        <h2 className="card-title">{extraction.filename}</h2>
        <div className="grid">
          <div className="card">
            <h3 className="card-title">Summary</h3>
            <p>{extraction.summary || 'No summary available'}</p>
          </div>
          <div className="card">
            <h3 className="card-title">Insights</h3>
            <pre className="pre-wrap">{extraction.formattedInsights || 'No insights available'}</pre>
          </div>
        </div>
        <div className="card">
          <h3 className="card-title">Extracted Text</h3>
          <pre className="pre-wrap">{extraction.text || 'No extracted text available'}</pre>
        </div>
      </div>
    </div>
  );
}