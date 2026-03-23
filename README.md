# <p align="center">LIFT</p>

<p align="center">
  <b>/lɪft/ — Lightweight Interface for Flight Tracking</b><br>
  <i>The high-performance, native flight tracking engine for Node.js. Lightweight by design. Native by heart. 28KB of pure Serverless power.</i>
</p>

<p align="center">
  <a href="README_DE.md">Auf Deutsch lesen (German) 🇩🇪</a>
</p>

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
  <img src="https://img.shields.io/github/languages/code-size/jonaskroedel/fr24REST?style=flat-square" alt="Code Size">
  <img src="https://img.shields.io/github/actions/workflow/status/jonaskroedel/fr24REST/ci.yml?branch=main&style=flat-square" alt="Build Status">
</p>

---

## 💡 Why LIFT?

I started this project because I wanted to understand exactly how global flight tracking data can be accessed and processed at scale. After looking at existing libraries and SDKs, I realized that most of them were either bloated, outdated, or lacked the "elegance" of a native Node.js implementation. 

LIFT was born from the desire to create something **lighter**, **faster**, and **more beautiful** than any other solution out there.

---

## 🛠 Tech Stack

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
</div>

## 🏗 Architecture & Optimization

The project has been optimized for maximum maintainability and performance:
- **Unified Logic**: All API routes and business logic are centralized in `app.js`.
- **Local & Serverless**: Both `server.js` (local) and `api/fr24/index.js` (Vercel) use identical code. No more redundant updates!
- **Vercel Ready**: The entire project (including the UI) executes seamlessly in the cloud.

---

## 🚀 Quickstart

```bash
# Clone & Install
git clone https://github.com/jonaskroedel/fr24REST.git
cd fr24REST
npm install

# Setup Environment (Optional for Auto-Auth)
cp .env.example .env
# Edit .env with your credentials

# Start Server
node server.js
```

![API Demo](public/assets/demo.gif)

## 🖥 Web Console

LIFT includes an integrated, stylish console for visual API testing. Start the server and open:
**[http://localhost:3000](http://localhost:3000)**

![API Console Preview](public/assets/console_preview.png)

---

## 📥 API Collection

For quick testing with **Insomnia** or **Postman**, you can import the included collection:
👉 [insomnia_collection.json](insomnia_collection.json)

---

## Usage Examples

LIFT is a standard REST API and can be integrated into any project.

### 1. Simple Flight Lookup

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

> [!TIP]
> Check out the [examples/](examples/) directory for complete, standalone scripts in **JavaScript** and **Python**.

### 2. Extended Data (Opt-in)

Includes airplane photos and full historical coordinate trails.

```bash
# Add photos and breadcrumb trail
curl -s "http://localhost:3000/api/flight/LH400?photos=true&trail=true"
```

---

## Authentication

### Native Auto-Login
If you store your credentials in a `.env` file (`FR24_EMAIL` & `FR24_PASSWORD`), LIFT will automatically authenticate when needed.

### Manual Login
Alternatively, you can use the `/api/login` endpoint directly:

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

### Parameters for /api/flight/:code
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `full` | `boolean` | Returns the entire raw dataset and all breadcrumbs. |
| `photos` | `boolean` | (Opt-in) Includes aircraft image galleries. |
| `trail` | `boolean` | (Opt-in) Includes detailed flight path coordinates. |
| `airports` | `boolean` | (Opt-in) Includes full metadata for origin/destination. |

### Parameters for /api/airports/:code
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `weather` | `boolean` | (Opt-in) Includes current METAR and weather data. |
| `schedule` | `boolean` | (Opt-in) Includes airport arrivals and departures. |
| `runways` | `boolean` | (Opt-in) Includes runway technical data. |
| `aircraftCount` | `boolean` | (Opt-in) Includes stats on ground/air aircraft. |

---

## ☁️ Vercel Serverless Deployment

Deployment to Vercel is streamlined for stateless execution:

```bash
vercel --prod
```

## 🗺 Roadmap

- [ ] **Real-time Webhook Support**: Push updates to external endpoints.
- [ ] **Protobuf Support**: Native decoding for even higher performance.
- [ ] **Interactive Map**: Integration of a Leaflet/Mapbox frontend.
- [ ] **Multi-Session Handling**: Support for multiple account cookies.

## ⚖️ Disclaimer

> [!CAUTION]
> ### STRICTLY AND EXCLUSIVELY FOR EDUCATIONAL PURPOSES
> This project is for **educational purposes only**. It is intended to demonstrate how to interact with public APIs using native Node.js tools. Use it at your own risk. Please respect the Terms of Service of FlightRadar24. The author is not responsible for any misuse or damage.

---

## Star History

<div align="center">
  <a href="https://star-history.com/#jonaskroedel/fr24REST&Date">
    <img src="https://api.star-history.com/svg?repos=jonaskroedel/fr24REST&type=Date" width="600" alt="Star History Chart">
  </a>
</div>

## Repository Structure
- `app.js`: Central Express app (Shared logic).
- `/api/fr24/`: Vercel Serverless entry point.
- `/services/`: Core request and scraper logic.
- `/models/`: Data mapping and entity definitions.
- `/public/`: Frontend (Interactive Console).
- `server.js`: Local Express listener.
- `vercel.json`: Vercel routing and configuration.

---

<p align="center">
  Built by <a href="https://github.com/jonaskroedel">jonaskroedel</a> with ♥ for Flight Enthusiasts
</p>
