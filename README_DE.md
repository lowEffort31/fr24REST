![LIFT](public/assets/header.jpg)

# <p align="center">LIFT</p>

<p align="center">
  <b>/lɪft/ — Lightweight Interface for Flight Tracking</b><br>
  <i>Die hochperformante, native Flight-Tracking-Engine für Node.js. Schlank im Design. Nativ im Herzen. Jetzt mit integriertem **Intelligence Layer** für Verspätungen, METAR-Parsing und Turnaround-Analysen.</i>
</p>


<p align="center">
  <a href="https://vercel.com">
    <img src="https://img.shields.io/badge/Vercel-Serverless-000000?style=flat-square&logo=vercel&logoColor=white" alt="Vercel Deployment">
  </a>
  <a href="https://nodejs.org">
    <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js Version">
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="Lizenz: MIT">
  </a>
  <img src="https://img.shields.io/github/languages/code-size/jonaskroedel/fr24REST?style=flat-square" alt="Code-Größe">
  <img src="https://img.shields.io/github/actions/workflow/status/jonaskroedel/fr24REST/ci.yml?branch=main&style=flat-square" alt="Build-Status">
</p>

<p align="center">
  <a href="README.md">Read in English (English) 🇺🇸</a>
</p>

---

## 💡 Warum LIFT?

Ich habe dieses Projekt gestartet, weil ich genau verstehen wollte, wie globale Flugdaten in großem Maßstab abgerufen und verarbeitet werden können. Nachdem ich mir bestehende Bibliotheken und SDKs angesehen hatte, wurde mir klar, dass die meisten entweder aufgebläht oder veraltet waren oder nicht die "Eleganz" einer nativen Node.js-Implementierung besaßen.

LIFT wurde aus dem Wunsch heraus geboren, etwas **Schlankeres**, **Schnelleres** und **Schöneres** zu schaffen als jede andere Lösung da draußen.

---

## 🛠 Tech-Stack

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
</div>

## 🏗 Architektur & Optimierung

Das Projekt wurde für maximale Wartbarkeit und Performanz optimiert:
- **Unified Logic**: Alle API-Routen und die Geschäftslogik sind in `app.js` zentralisiert.
- **Lokal & Serverless**: Sowohl `server.js` (lokal) als auch `api/fr24/index.js` (Vercel) nutzen denselben Code. Keine redundanten Updates mehr!
- **Vercel Ready**: Das gesamte Projekt (einschließlich der UI) wird nahtlos in der Cloud ausgeführt.

---

## 🚀 Schnellstart

```bash
# Klonen & Installieren
git clone https://github.com/jonaskroedel/fr24REST.git
cd fr24REST
npm install

# Umgebung einrichten (Optional für Auto-Authentifizierung)
cp .env.example .env
# .env mit deinen Zugangsdaten bearbeiten

# Server starten
node server.js
```

![API Demo](public/assets/demo.gif)

## 🖥 Web-Konsole

LIFT enthält eine integrierte, stylische Konsole zum visuellen Testen der API. Starte den Server und öffne:
**[http://localhost:3000](http://localhost:3000)**

![API Console Preview](public/assets/console_preview.png)

---

## 📥 API-Kollektion

Für schnelles Testen mit **Insomnia** oder **Postman** kannst du die mitgelieferte Kollektion importieren:
👉 [insomnia_collection.json](insomnia_collection.json)

---

## Anwendungsbeispiele

LIFT ist eine Standard-REST-API und kann in jedes Projekt integriert werden.

### 1. Einfache Flugabfrage

Gibt grundlegende Daten zurück (ID, Nummer, Flugzeug, Start, Ziel, Status).

#### cURL
```bash
curl -s "http://localhost:3000/api/flight/LH400"
```

#### Python (requests)
```python
import requests

response = requests.get("http://localhost:3000/api/flight/LH400")
data = response.json()
print(f"Flug: {data['data']['number']} - Status: {data['data']['status']['text']}")
```

#### JavaScript (Fetch)
```javascript
const response = await fetch("http://localhost:3000/api/flight/LH400");
const { data } = await response.json();
console.log(`Verfolge Flug ${data.id} (${data.callsign})`);
```

> [!TIP]
> Schau dir das [examples/](examples/) Verzeichnis an für vollständige, eigenständige Skripte in **JavaScript** und **Python**.

### 2. Erweiterte Daten (Opt-in)

Inklusive Flugzeugfotos und vollständiger historischer Pfad-Koordinaten.

```bash
# Fotos und Flugpfad hinzufügen
curl -s "http://localhost:3000/api/flight/LH400?photos=true&trail=true"

# Flugplan eines Flughafens nach Registrierung filtern
curl -s "http://localhost:3000/api/airports/FRA?registration=D-AIMG&schedule=true"

# Umgebungs-Scan (Lat/Lon/Radius)
curl -s "http://localhost:3000/api/nearby?lat=50.03&lon=8.57&radius=50"
```

---

## Authentifizierung

### Natives Auto-Login
Wenn du deine Zugangsdaten in einer `.env` Datei speicherst (`FR24_EMAIL` & `FR24_PASSWORD`), authentifiziert sich LIFT bei Bedarf automatisch.

### Manueller Login
Alternativ kannst du den `/api/login` Endpunkt direkt nutzen:

#### JavaScript (Login)
```javascript
const credentials = { email: "deine@email.de", password: "deinpasswort" };
const response = await fetch("http://localhost:3000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials)
});
const result = await response.json();
console.log("Login-Status:", result.success);
```

### Parameter für /api/flight/:code & /api/aircraft/:code
| `GET /api/flight/:code` | lookup | Detaillierte Fluginfo + **Intelligence (Delay)**. |
| `GET /api/aircraft/:code` | lookup | Flugzeugstatus nach Registrierung (Live-Redirect). |
| `GET /api/nearby` | lookup | Findet alle Flugzeuge in einem Umkreis (km). |
| `GET /api/airports/:code` | intelligence | Metadaten, **METAR-Zusammenfassung** und **Turnarounds**. |
| `GET /api/airlines` | directory | Offizieller JSON-Index der verzeichneten Airlines. |
| `GET /api/zones` | metadata | Geografische Regionsgrenzen. |

### Parameter für /api/airports/:code
| Parameter | Typ | Beschreibung |
| :--- | :--- | :--- |
| `registration` | `string` | (Opt-in) Filtert den Flugplan nach einer Registrierung. |
| `weather` | `boolean` | (Opt-in) Enthält aktuelle METAR- und Wetterdaten. |
| `schedule` | `boolean` | (Opt-in) Enthält Ankünfte und Abflüge des Flughafens. |
| `runways` | `boolean` | (Opt-in) Enthält technische Daten der Startbahnen. |
| `aircraftCount` | `boolean` | (Opt-in) Enthält Statistiken über Flugzeuge am Boden/Luft. |

---

## ☁️ Vercel Serverless Deployment

Das Deployment auf Vercel ist für die zustandslose Ausführung optimiert:

```bash
vercel --prod
```

## 🗺 Roadmap

- [ ] **Echtzeit-Webhook-Support**: Push-Updates an externe Endpunkte.
- [ ] **Protobuf-Support**: Nativ dekodierte Daten für noch höhere Performance.
- [ ] **Interaktive Karte**: Integration eines Leaflet/Mapbox-Frontends.
- [ ] **Multi-Session-Handling**: Unterstützung für mehrere Account-Cookies.

## ⚖️ Haftungsausschluss

> [!CAUTION]
> ### NUR UND AUSSCHLIESSLICH FÜR BILDUNGSZWECKE
> Dieses Projekt dient **einzig und allein Bildungszwecken**. Es soll demonstrieren, wie man mit nativen Node.js-Tools mit öffentlichen APIs interagiert. Die Nutzung erfolgt auf eigene Gefahr. Bitte respekiere die Terms of Service von FlightRadar24. Der Autor übernimmt keine Haftung für Missbrauch oder Schäden.

---

## Star-History

<div align="center">
  <a href="https://star-history.com/#jonaskroedel/fr24REST&Date">
    <img src="https://api.star-history.com/svg?repos=jonaskroedel/fr24REST&type=Date" width="600" alt="Star History Chart">
  </a>
</div>

## Repository-Struktur
- `app.js`: Zentrale Express-App (Shared Logic).
- `/api/fr24/`: Vercel Serverless Einstiegspunkt.
- `/services/`: Kern-Anfrage- & Scraper-Logik.
- `/models/`: Daten-Mapping & Entity-Definitionen.
- `/public/`: Frontend (Interaktive Konsole).
- `server.js`: Lokaler Express Listener.
- `vercel.json`: Vercel Routing & Konfiguration.

---

<p align="center">
  Erstellt von <a href="https://github.com/jonaskroedel">jonaskroedel</a> mit ♥ für Flugbegeisterte
</p>
