const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fr24Service = require('./services/fr24.service');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

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
            details.origin = { 
                name: details.origin?.name, 
                iata: details.origin?.code?.iata, 
                gate: details.origin?.info?.gate 
            };
            details.destination = { 
                name: details.destination?.name, 
                iata: details.destination?.code?.iata, 
                gate: details.destination?.info?.gate 
            };
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
    if (!code || code.length !== 3) {
      return res.status(400).json({ success: false, error: 'Invalid airport IATA code format' });
    }
    const airport = await fr24Service.getAirportDetails(code);
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

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err.message);
  
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`FlightRadar24 REST API running on http://localhost:${PORT}`);
});
