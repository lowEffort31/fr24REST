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
  <a href="#usage-examples">Usage</a> •
  <a href="#authentication">Authentication</a> •
  <a href="#vercel-serverless-deployment">Deployment</a> •
  <a href="#disclaimer">Disclaimer</a>
</p>

---

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

---

## Vercel Serverless Deployment

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
