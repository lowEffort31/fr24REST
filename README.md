# FlightRadar24 REST API (Native Node.js)

<p align="center">
  <a href="https://vercel.com">
    <img src="https://img.shields.io/badge/Vercel-Serverless-000000?style=flat-square&logo=vercel&logoColor=white" alt="Vercel Deployment">
  </a>
  <a href="https://nodejs.org">
    <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js Version">
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="License: MIT">
  </a>
</p>

A high-performance, native REST-API for FlightRadar24 flight data, optimized for local development and Vercel Serverless. Designed without external SDK dependencies, using pure Node.js.

<p align="center">
  <a href="#quickstart">Quickstart</a> •
  <a href="#usage-examples">Usage Examples</a> •
  <a href="#query-parameters">Parameters</a> •
  <a href="#authentication">Authentication</a> •
  <a href="#complete-javascript-example">Full Example</a> •
  <a href="#vercel-serverless-deployment">Deployment</a> •
  <a href="#disclaimer">Disclaimer</a>
</p>

<p align="center">
  <img src="https://img.shields.io/github/last-commit/jonaskroedel/fr24REST?style=flat-square&color=blue" alt="Last Commit">
  <img src="https://img.shields.io/github/issues/jonaskroedel/fr24REST?style=flat-square&color=blue" alt="Issues">
  <img src="https://img.shields.io/github/languages/top/jonaskroedel/fr24REST?style=flat-square" alt="Top Language">
</p>

---

## 🛠 Tech Stack

<p align="left">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
</p>

## Quickstart

```bash
git clone https://github.com/jonaskroedel/fr24REST.git
cd fr24REST
npm install
node server.js
```

## Usage Examples

This is a standard REST API and can be integrated into any environment.

### 1. Simple Fetch (Summary Mode)

Returns essential data (ID, number, aircraft, origin, destination, status).

#### cURL
```bash
curl -s "http://localhost:3000/api/flight/LH400"
```

#### Python (requests)
```python
import requests

response = requests.get("http://localhost:3000/api/flight/LH400")
data = response.json()
print(f"Flight: {data['data']['number']} - Status: {data['data']['status']['text']}")
```

#### JavaScript (Fetch)
```javascript
const response = await fetch("http://localhost:3000/api/flight/LH400");
const { data } = await response.json();
console.log(`Tracking flight ${data.id} (${data.callsign})`);
```

### 2. Extended Data (Opt-in)

Include airplane photos and full historical coordinate trails.

```bash
# Add photos and breadcrumb trail
curl -s "http://localhost:3000/api/flight/LH400?photos=true&trail=true"
```

---

## Authentication

### Login required for more insights
Certain data fields (like advanced history or restricted flight details) may require a valid session. Use the `/api/login` endpoint to authenticate.

#### Python (Login & Authenticated Request)
```python
import requests

# 1. Login to get session data
credentials = {"email": "your@email.com", "password": "yourpassword"}
login_res = requests.post("http://localhost:3000/api/login", json=credentials)
session_data = login_res.json()

# 2. subsequent requests use the session cookies
# Note: The serverless version requires you to manage session persistence if needed.
print("Successfully logged in:", session_data['success'])
```

#### JavaScript (Login)
```javascript
const credentials = { email: "your@email.com", password: "yourpassword" };
const response = await fetch("http://localhost:3000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials)
});
const result = await response.json();
console.log("Login Status:", result.success);
```

## Query Parameters

You can customize the response of the `/api/flight/:code` endpoint using the following opt-in parameters:

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `full` | `boolean` | Returns the entire raw dataset and all breadcrumbs. |
| `photos` | `boolean` | (Opt-in) Includes aircraft image galleries. |
| `trail` | `boolean` | (Opt-in) Includes detailed flight path coordinates. |
| `airports` | `boolean` | (Opt-in) Includes full metadata for origin/destination. |

---

## ⚡ Complete JavaScript Example

This example demonstrates how to fetch all flights in a specific region and retrieve detailed information for the first live flight found.

```javascript
// Example: Tracking Europe
const BASE_URL = "http://localhost:3000/api";

async function trackRegion(zone) {
    try {
        console.log(`📡 Fetching live flights for zone: ${zone}...`);
        const listRes = await fetch(`${BASE_URL}/flights?zone=${zone}`);
        const { data: flights } = await listRes.json();

        if (flights.length === 0) return console.log("No flights found.");

        const target = flights[0];
        console.log(`📍 Found ${flights.length} flights. Fetching details for ${target.callsign}...`);

        // Fetch details with photos and trail enabled
        const detailRes = await fetch(`${BASE_URL}/flight/${target.id}?photos=true&trail=true`);
        const { data: details } = await detailRes.json();

        console.log("\n--- Flight Report ---");
        console.log(`Flight: ${details.number} (${details.callsign})`);
        console.log(`Aircraft: ${details.aircraft.model.text} (${details.aircraft.registration})`);
        console.log(`Route: ${details.origin.name} -> ${details.destination.name}`);
        console.log(`Status: ${details.status.text}`);
        console.log(`Breadcrumbs: Found ${details.trail.length} coordinates.`);
        console.log(`Photos: ${details.aircraft.images.thumbnails.length} images available.`);
    } catch (err) {
        console.error("Tracking Error:", err.message);
    }
}

trackRegion("europe");
```

### Example Output:
```text
📡 Fetching live flights for zone: europe...
📍 Found 1420 flights. Fetching details for DLH400...

--- Flight Report ---
Flight: LH400 (DLH400)
Aircraft: Airbus A340-642 (D-AIHZ)
Route: Frankfurt Airport -> New York John F. Kennedy International Airport
Status: Estimated- 14:50
Breadcrumbs: Found 124 coordinates.
Photos: 5 images available.
```

---

## ☁️ Vercel Serverless Deployment

Deploying to Vercel is streamlined for stateless execution:

```bash
vercel --prod
```

## Disclaimer

> [!WARNING]
> This project is for **educational purposes only**. It is intended to demonstrate how to interact with public APIs using native Node.js. Use it responsibly and respect the Terms of Service of FlightRadar24. The author is not responsible for any misuse of this software.

---

## Star History

<div align="center">
  <a href="https://star-history.com/#jonaskroedel/fr24REST&Date">
    <img src="https://api.star-history.com/svg?repos=jonaskroedel/fr24REST&type=Date" width="600" alt="Star History Chart">
  </a>
</div>

## Repository Structure
- `/api/fr24/`: Vercel Serverless function entry point.
- `/services/`: Core request and scraper logic.
- `/models/`: Data mapping and entity definitions.
- `server.js`: Local development listener.
- `vercel.json`: Vercel routing configuration.

---

<p align="center">
  Built by <a href="https://github.com/jonaskroedel">jonaskroedel</a> with ♥ for Flight Enthusiasts
</p>
