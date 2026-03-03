// server.js
const express = require('express');
const cors = require('cors'); // Import the CORS package
const app = express();
const PORT = 5000;

// Middleware to parse JSON 
app.use(express.json());

// Enable CORS: Allow requests specifically from your React Frontend
app.use(cors({
  origin: 'http://localhost:3000'
}));

// A test route
app.get('/api/hello', (req, res) => {
  res.json({ message: "Hello from the Node backend!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});