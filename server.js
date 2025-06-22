const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const entryRoutes = require('./routes/entryRoutes');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Allow us to parse JSON in the body of requests

// server.js
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB Connected...'))
.catch(err => console.error(err));

// API Routes
app.use('/api/entries', entryRoutes);

// Serve the frontend (we will create this in Phase 2)
app.use(express.static('frontend'));

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});