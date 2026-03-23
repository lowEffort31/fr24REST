const { Flight, Airport, Zone, FlightDetails } = require('../models/entities');

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept': 'application/json, text/plain, */*',
  'Referer': 'https://www.flightradar24.com/',
  'Origin': 'https://www.flightradar24.com',
};

const FIXED_ZONES = {
  europe: { tl_y: 72.57, tl_x: -16.96, br_y: 33.57, br_x: 53.05 },
  northamerica: { tl_y: 72.82, tl_x: -179.14, br_y: 14.54, br_x: -52.2 },
  southamerica: { tl_y: 15.0, tl_x: -105.0, br_y: -60.0, br_x: -30.0 },
  oceania: { tl_y: 10.0, tl_x: 100.0, br_y: -50.0, br_x: 180.0 },
  asia: { tl_y: 75.0, tl_x: 40.0, br_y: -10.0, br_x: 150.0 },
  africa: { tl_y: 40.0, tl_x: -20.0, br_y: -40.0, br_x: 60.0 }
};

class FR24Service {
  constructor() {
    this.session = null;
    this.cookies = "";
  }

  async getHeaders() {
    // Auto-login if credentials are in ENV and no cookies are set
    if (!this.cookies && process.env.FR24_EMAIL && process.env.FR24_PASSWORD) {
        try {
            console.log("🔐 Auto-authenticating with environment credentials...");
            await this.login(process.env.FR24_EMAIL, process.env.FR24_PASSWORD);
        } catch (e) {
            console.error("⚠️ Auto-authentication failed:", e.message);
        }
    }

    const headers = { ...DEFAULT_HEADERS };
    if (this.cookies) {
      headers['Cookie'] = this.cookies;
    }
    return headers;
  }

  /**
   * Login to FlightRadar24
   */
  async login(email, password) {
    const url = 'https://www.flightradar24.com/main/login';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...DEFAULT_HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
        'fr24-platform': 'web-26.079.0806'
      },
      body: new URLSearchParams({ email, password, remember: 'true' })
    });

    if (!response.ok) {
        throw new Error(`Login failed: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        throw new Error(`Invalid JSON response from login: ${text.substring(0, 100)}...`);
    }

    if (data.error) {
        throw new Error(`Login error: ${data.error}`);
    }

    // Capture all cookies from set-cookie headers
    const setCookies = response.headers.getSetCookie(); // Node 18+ method for multiple headers
    if (setCookies && setCookies.length > 0) {
        this.cookies = setCookies.map(c => c.split(';')[0]).join('; ');
    }

    this.session = data.result;
    return data;
  }

  /**
   * Fetch flights from Data Cloud feed
   */
  async getFlights(params = {}) {
    let bounds = params.bounds || '';
    
    // If zone is provided but bounds are not, look up the zone coordinates
    if (params.zone && !bounds) {
        const zoneData = FIXED_ZONES[params.zone.toLowerCase()];
        if (zoneData) {
            // FR24 Bounds Format: y2,y1,x1,x2 (Top, Bottom, Left, Right)
            bounds = `${zoneData.tl_y},${zoneData.br_y},${zoneData.tl_x},${zoneData.br_x}`;
        }
    }

    const baseUrl = 'https://data-cloud.flightradar24.com/zones/fcgi/feed.js';
    const query = new URLSearchParams({
      bounds: bounds,
      faa: '1', satellite: '1', mlat: '1', flarm: '1', adsb: '1', gnd: '1', air: '1', vehicles: '1', estimated: '1', ager: '1', gliders: '1', stats: '1'
    });
    
    if (params.airline) query.append('airline', params.airline);
    if (params.zone) query.append('zone', params.zone);

    const url = `${baseUrl}?${query.toString()}`;
    const headers = await this.getHeaders();
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch flights: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const flights = [];
    
    for (const [id, flightData] of Object.entries(data)) {
      if (id === 'full_count' || id === 'version' || id === 'stats') continue;
      flights.push(new Flight(id, flightData));
    }
    
    return flights;
  }

  /**
   * Fetch airlines list
   */
  async getAirlines() {
    const url = 'https://www.flightradar24.com/_json/airlines.php';
    const headers = await this.getHeaders();
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch airlines: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }

  /**
   * Fetch detailed airport information
   */
  async getAirportDetails(code, params = {}) {
    let url = `https://api.flightradar24.com/common/v1/airport.json?code=${code}&plugin[]=details`;
    
    // Add optional plugins
    if (params.weather === 'true' || params.weather === '1') url += '&plugin[]=weather';
    if (params.schedule === 'true' || params.schedule === '1') url += '&plugin[]=schedule';
    if (params.runways === 'true' || params.runways === '1') url += '&plugin[]=runways';
    if (params.aircraftCount === 'true' || params.aircraftCount === '1') url += '&plugin[]=aircraftCount';

    const headers = await this.getHeaders();
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error(`Airport ${code} not found`);
        }
      throw new Error(`Failed to fetch airport details: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const airportRoot = data.result?.response?.airport;
    const pluginData = airportRoot?.pluginData;
    
    if (!pluginData || !pluginData.details) {
        throw new Error(`No data found for airport ${code}`);
    }
    
    return new Airport(pluginData);
  }

  /**
   * Search for a flight or airport
   */
  async search(query) {
    const url = `https://www.flightradar24.com/v1/search/web/find?query=${encodeURIComponent(query)}&limit=10`;
    const headers = await this.getHeaders();
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`Search failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }

  /**
   * Get flight details by ID or flight number
   */
  async getFlightDetails(code) {
    let flightId = code;

    // If code doesn't look like a hex ID, try to search for it
    const isHex = /^[0-9a-f]{7,8}$/i.test(code);
    
    if (!isHex) {
        const results = await this.search(code);
        // Find live flight or specifically matching flight number in results
        const flightResult = results.results?.find(r => r.type === 'live' || (r.id && r.id.length === 8 && /^[0-9a-f]+$/i.test(r.id)));
        if (!flightResult) {
            throw new Error(`No live flight found for ${code}`);
        }
        flightId = flightResult.id;
    }

    const url = `https://data-live.flightradar24.com/clickhandler/?version=1.5&flight=${flightId}`;
    const headers = await this.getHeaders();
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch flight details: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    if (data.error || data.success === false) {
        throw new Error(`FR24 Error: ${data.message || data.error || 'Unknown error'}`);
    }

    return new FlightDetails(data);
  }

  /**
   * Fetch zones
   */
  async getZones() {
    return Object.entries(FIXED_ZONES).map(([name, coords]) => new Zone(name, coords));
  }
}

module.exports = new FR24Service();
