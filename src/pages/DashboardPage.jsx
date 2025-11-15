import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Import our API service

function DashboardPage() {
  // 1. Create state to store clients and any errors
  const [clients, setClients] = useState([]);
  const [error, setError] = useState('');

  // 2. useEffect runs once when the component loads
  useEffect(() => {
    // This is the function that will fetch data
    const fetchClients = async () => {
      try {
        // 3. Get the token from localStorage
        const token = localStorage.getItem('token');

        if (!token) {
          setError('No token found. Please log in.');
          return;
        }

        // 4. Make the authenticated API call
        const response = await api.get('/clients/getClients', {
          headers: {
            'Authorization': `Bearer ${token}` // 👈 This is the crucial part
          }
        });

        // 5. Save the clients from the response into our state
        setClients(response.data);

      } catch (err) {
        console.error('Failed to fetch clients:', err);
        setError(err.response?.data?.error || 'Failed to fetch clients');
      }
    };

    fetchClients(); // Call the function
  }, []); // The empty array [] means "run this only once"

  // 6. Render the page
  return (
    <div>
      <h1>Your Dashboard</h1>
      <h2>Your Clients</h2>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {/* 7. Display the clients */}
      <ul>
        {clients.length > 0 ? (
          clients.map(client => (
            <li key={client.id}>{client.name}</li>
          ))
        ) : (
          <p>You have no clients yet.</p>
        )}
      </ul>
    </div>
  );
}

export default DashboardPage;