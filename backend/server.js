const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const noteRoutes = require('./routes/noteRoutes');


const app = express();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://2210030173:2210030173@vishnunotes.pnvda9r.mongodb.net/';
const allowedOrigins = process.env.CLIENT_URL
	? process.env.CLIENT_URL.split(',').map(origin => origin.trim())
	: ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
	origin(origin, callback) {
		// Allow server-to-server requests and local tools without an Origin header.
		if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
			return callback(null, true);
		}
		return callback(new Error('Not allowed by CORS'));
	}
}));
app.use(express.json());

mongoose.connect(MONGODB_URI)
	.then(() => console.log('MongoDB connection established'))
	.catch(err => console.error('MongoDB connection error:', err));

const db = mongoose.connection;
db.on('connected', () => {
	console.log('MongoDB connected successfully');
});
db.on('error', (err) => {
	console.error('MongoDB connection error:', err);
});
db.on('disconnected', () => {
	console.log('MongoDB disconnected');
});


app.get('/api/health', (req, res) => {
	res.json({ 
		status: 'ok', 
		timestamp: new Date().toISOString(),
		dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
		allowedOrigins: allowedOrigins.slice(0, 2).concat('...') // Return a sample for debugging
	});
});

app.use('/api/notes', noteRoutes);


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
