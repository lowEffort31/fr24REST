# LIFT Commands Reference

Comprehensive list of all LIFT API endpoints, parameters, and response structures.

## 🧭 Live Feed & Geography

### GET `/api/flights`
Retrieve a live feed of aircraft within a specific zone or bounding box.

**Parameters:**
- `zone` (string): `europe`, `northamerica`, etc.
- `airline` (string): ICAO code (e.g., `DLH`).
- `bounds` (string): `y2,y1,x1,x2` (Top, Bottom, Left, Right).

### GET `/api/nearby`
Geographical intelligence for "What's flying over me?".

**Parameters:**
- `lat` (float): Latitude.
- `lon` (float): Longitude.
- `radius` (float): Radius in km (Default: 50).

**Intelligence Features:**
- `distance`: Distance in km to the reference point.
- `intelligence.isApproaching`: `true` if aircraft is heading towards the reference point.

---

## 🚁 Intelligence & Lookup

### GET `/api/flight/:code`
Detailed status, history, and intelligence for a flight number or hex ID.

**Parameters:**
- `full` (bool): Returns the entire raw dataset.
- `photos` (bool): (Opt-in) Includes image galleries.
- `trail` (bool): (Opt-in) Includes high-res path trail.
- `airports` (bool): (Opt-in) Includes full metadata.

**Intelligence Features:**
- `intelligence.departureDelay` / `arrivalDelay`: Real-time delay in minutes.
- `intelligence.progressPercent`: Flight completion from 0 to 100%.
- `intelligence.remainingTime`: Estimated minutes until landing.
- `intelligence.aircraftVibe`: Human-readable nickname (e.g., "Superjumbo").
- `intelligence.turnaroundReference`: Recommended ground window for this type.

---

### GET `/api/flight/:code/history`
Retrieve a comprehensive timeline of past and upcoming segments for a flight number.

**Parameters:**
- `limit` (int): Number of segments to return (Default: 25).

**Key Fields:**
- `data[]`: List of flight segments.
- `data[].status`: `scheduled`, `landed`, `live`.
- `data[].time`: Departure and arrival timestamps.
- `data[].aircraft`: Registration and type of the specific segment.

---

### GET `/api/aircraft/:code`
Specialized lookup for an aircraft by its registration (e.g. `D-AIMG`).
*Same parameters and intelligence features as `/api/flight/:code`.*

---

## 🏢 Airport Operations

### GET `/api/airports/:code`
Detailed operations, weather, and turnaround tracking.

**Parameters:**
- `registration` (string): Filter schedule for a specific aircraft (Key for Turnaround tracking).
- `weather` (bool): Includes METAR Summary.
- `schedule` (bool): Includes arrivals/departures.
- `runways` (bool): Technical runway data.

**Intelligence Features:**
- `weatherSummary.condition`: Semantic status (`VFR`, `IFR`, `Thunderstorms`).
- `weatherSummary.weatherImpact`: `low`/`high` impact score for pilot reasoning.
- `weatherSummary.visibilityStatus`: `VFR` or `IFR` based on current visibility.
- `airportCongestion`: Load score from 1 (Quiet) to 10 (Critical).
- `turnarounds`: List of turnaround operations (Inbound -> Outbound).
- `turnarounds[].delayRisk`: `low`, `medium`, `high` based on the 30m window.
- `turnarounds[].groundWindow`: Gap in minutes between landing and next takeoff.
- `turnarounds[].predictedArrivalGate`: Predicted gate if not yet assigned.
- `turnarounds[].gateConfidence`: Confidence level of the gate prediction.

---

## 🔐 Authentication

### POST `/api/login`
Obtain session details for premium FR24 data.
