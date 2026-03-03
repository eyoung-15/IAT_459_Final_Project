import React, { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Note: We use the FULL URL. There is no proxy to infer the host.
    fetch('http://localhost:5000/api/hello')
      .then(response => response.json())
      .then(data => setMessage(data.message))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div className="App">
      <h1>Frontend meets Backend</h1>
      <p>Server says: {message}</p>
    </div>
  );
}

export default App;