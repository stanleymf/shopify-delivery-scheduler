import { useState, useEffect } from "react";

// Simple types for minimal functionality
type Location = {
  id: number;
  name: string;
  address: {
    address1: string;
    city: string;
    province: string;
    country: string;
    zip: string;
  };
  isActive: boolean;
};

function App() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [textCustomisations, setTextCustomisations] = useState({
    deliveryType: "Select delivery type...",
    deliveryDate: "Select a date...",
    timeslot: "Select a timeslot...",
    postalCode: "Enter your postal code..."
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load locations
      const locationsResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/locations`);
      const locationsData = await locationsResponse.json();
      if (locationsData.success) {
        setLocations(locationsData.data.locations || []);
      }

      // Load text customisations
      const textResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/text-customisations`);
      const textData = await textResponse.json();
      if (textData.success) {
        setTextCustomisations(textData.data);
      }
    } catch (err) {
      setError('Failed to load data');
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTextCustomisationsSave = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/text-customisations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(textCustomisations)
      });
      
      if (response.ok) {
        alert('Text customisations saved successfully!');
      } else {
        alert('Failed to save text customisations');
      }
    } catch (err) {
      alert('Error saving text customisations');
      console.error('Error saving text customisations:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Shopify Delivery Scheduler - Admin Dashboard</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <h2>Text Customisations</h2>
        <div style={{ display: 'grid', gap: '10px', maxWidth: '400px' }}>
          <div>
            <label>Delivery Type Label:</label>
            <input
              type="text"
              value={textCustomisations.deliveryType}
              onChange={(e) => setTextCustomisations(prev => ({ ...prev, deliveryType: e.target.value }))}
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
          </div>
          <div>
            <label>Delivery Date Label:</label>
            <input
              type="text"
              value={textCustomisations.deliveryDate}
              onChange={(e) => setTextCustomisations(prev => ({ ...prev, deliveryDate: e.target.value }))}
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
          </div>
          <div>
            <label>Timeslot Label:</label>
            <input
              type="text"
              value={textCustomisations.timeslot}
              onChange={(e) => setTextCustomisations(prev => ({ ...prev, timeslot: e.target.value }))}
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
          </div>
          <div>
            <label>Postal Code Label:</label>
            <input
              type="text"
              value={textCustomisations.postalCode}
              onChange={(e) => setTextCustomisations(prev => ({ ...prev, postalCode: e.target.value }))}
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
          </div>
          <button
            onClick={handleTextCustomisationsSave}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Save Text Customisations
          </button>
        </div>
      </div>

      <div>
        <h2>Collection Locations ({locations.length})</h2>
        {locations.length === 0 ? (
          <p>No collection locations configured.</p>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {locations.map((location) => (
              <div
                key={location.id}
                style={{
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: location.isActive ? '#f8f9fa' : '#f1f3f4'
                }}
              >
                <h3 style={{ margin: '0 0 10px 0' }}>{location.name}</h3>
                <p style={{ margin: '0', color: '#666' }}>
                  {location.address.address1}, {location.address.city}, {location.address.province} {location.address.zip}
                </p>
                <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: location.isActive ? '#28a745' : '#dc3545' }}>
                  Status: {location.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <h3>API Status</h3>
        <p>API URL: {import.meta.env.VITE_API_URL || 'http://localhost:3001'}</p>
        <p>Locations loaded: {locations.length}</p>
        <p>Text customisations loaded: {Object.keys(textCustomisations).length > 0 ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
}

export default App; 