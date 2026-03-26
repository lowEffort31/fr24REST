const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();
const fr24Service = require('./services/fr24.service');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve frontend for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- API ROUTES ---

// GET /api/flights: Query-Params zone, airline oder bounds
app.get('/api/flights', async (req, res, next) => {
  try {
    const { zone, airline, bounds } = req.query;
    const flights = await fr24Service.getFlights({ zone, airline, bounds });
    res.json({ success: true, count: flights.length, data: flights });
  } catch (error) {
    next(error);
  }
});

// POST /api/login: Login to FR24
app.post('/api/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password required' });
    }
    const result = await fr24Service.login(email, password);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(401).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/flight/:code/history
 * Detailed historical and upcoming segments for a flight number
 */
app.get('/api/flight/:code/history', async (req, res) => {
    try {
        const { code } = req.params;
        const history = await fr24Service.getFlightHistory(code);
        res.json({ success: true, count: history.length, data: history });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/flight/:code: Detailed flight info (Hex ID or Flight Number)
app.get('/api/flight/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const { full, photos, trail, airports } = req.query;
    const details = await fr24Service.getFlightDetails(code);
    
    // Check if user wants full response or specific sections
    const isFull = full === 'true' || full === '1';
    
    if (!isFull) {
        // Summarize airports logic (keep only codes if not requested)
        if (airports !== 'true' && airports !== '1') {
            if (details.origin) {
                details.origin = { 
                    name: details.origin.name, 
                    iata: details.origin.code?.iata, 
                    gate: details.origin.info?.gate 
                };
            }
            if (details.destination) {
                details.destination = { 
                    name: details.destination.name, 
                    iata: details.destination.code?.iata, 
                    gate: details.destination.info?.gate 
                };
            }
        }

        // Photos opt-in
        if (photos !== 'true' && photos !== '1') {
            if (details.aircraft) delete details.aircraft.images;
        }

        // Trail opt-in
        if (trail !== 'true' && trail !== '1') {
            delete details.trail;
        }

        // Always remove raw unless full
        delete details.raw;
    }
    
    res.json({ success: true, data: details });
  } catch (error) {
    if (error.message.includes('No live flight found')) {
        return res.status(404).json({ success: false, error: error.message });
    }
    next(error);
  }
});

// GET /api/aircraft/:code: Detailed aircraft info by Registration (Alias for flight lookup)
app.get('/api/aircraft/:code', async (req, res, next) => {
    try {
      const { code } = req.params;
      const { full, photos, trail, airports } = req.query;
      const details = await fr24Service.getFlightDetails(code); // Works for registration too
      
      // Apply same filter logic as flight endpoint
      const isFull = full === 'true' || full === '1';
      if (!isFull) {
          if (airports !== 'true' && airports !== '1') {
              if (details.origin) details.origin = { name: details.origin.name, iata: details.origin.code?.iata };
              if (details.destination) details.destination = { name: details.destination.name, iata: details.destination.code?.iata };
          }
          if (photos !== 'true' && photos !== '1') if (details.aircraft) delete details.aircraft.images;
          if (trail !== 'true' && trail !== '1') delete details.trail;
          delete details.raw;
      }
      
      res.json({ success: true, data: details });
    } catch (error) {
      if (error.message.includes('No live flight found')) {
          return res.status(404).json({ success: false, error: `Aircraft ${req.params.code} is currently not tracked or on ground.` });
      }
      next(error);
    }
});

// GET /api/airlines: Ruft die offizielle JSON-Liste der Airlines ab
app.get('/api/airlines', async (req, res, next) => {
  try {
    const airlines = await fr24Service.getAirlines();
    res.json({ success: true, count: airlines?.rows?.length || airlines.length, data: airlines });
  } catch (error) {
    next(error);
  }
});

// GET /api/airports/:code: Liefert detaillierte Informationen über einen Flughafen
app.get('/api/airports/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const { registration } = req.query;
    if (!code || code.length !== 3) {
      return res.status(400).json({ success: false, error: 'Invalid airport IATA code format' });
    }
    const airport = await fr24Service.getAirportDetails(code, req.query);
    res.json({ success: true, data: airport });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, error: error.message });
    }
    next(error);
  }
});

// GET /api/zones: Gibt die statischen Koordinaten-Grenzwerte für Regionen zurück
app.get('/api/zones', async (req, res, next) => {
  try {
    const zones = await fr24Service.getZones();
    res.json({ success: true, count: zones.length, data: zones });
  } catch (error) {
    next(error);
  }
});

// GET /api/nearby: Find flights near coordinates
app.get('/api/nearby', async (req, res, next) => {
  try {
    const { lat, lon, radius } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ success: false, error: 'Latitude and Longitude required' });
    }
    const flights = await fr24Service.getNearbyFlights(parseFloat(lat), parseFloat(lon), parseFloat(radius || 50));
    res.json({ success: true, count: flights.length, data: flights });
  } catch (error) {
    next(error);
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err.message);
  
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

module.exports = app;
