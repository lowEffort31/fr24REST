# FlightRadar24 REST API (Native Node.js/Express)

Eine vollständig native REST-API für FlightRadar24 Flugdaten, ohne externe SDK-Abhängigkeiten.

## Installation

1. Repository klonen oder Dateien kopieren.
2. Abhängigkeiten installieren:
   ```bash
   npm install
   ```
3. Server starten:
   ```bash
   node server.js
   ```

Der Server läuft standardmäßig auf `http://localhost:3000`.

## API Endpunkte & Nutzung (Beispiele)

### 1. Flugsuche & Details (`/api/flight/:code`)
Sucht nach einem Flug via ID (Hex) oder Flugnummer (Callsign).

**Optionale Parameter (Opt-in):**
- `full=true`: Liefert absolut alle verfügbaren Daten (inkl. Rohdaten).
- `photos=true`: Inkludiert hochauflösende Bilder des Flugzeugs.
- `trail=true`: Inkludiert den detaillierten Flugverlauf (Koordinaten).
- `airports=true`: Liefert vollständige Flughafen-Details (Position, Timezone, Website).

Ohne diese Parameter ist der Response sehr schlank und auf das Wesentliche reduziert.

#### curl (Linux/macOS):
> [!IMPORTANT]
> In Shells wie **zsh** (Standard auf macOS) müssen URLs mit Query-Parametern (wie `?full=true`) in Anführungszeichen gesetzt werden, sonst tritt ein Fehler wie `no matches found` auf.

```bash
# Zusammenfassung (Standard)
curl -s "http://localhost:3000/api/flight/LH400"

# Vollständige Daten (inkl. Trail)
curl -s "http://localhost:3000/api/flight/LH400?full=true"
```

#### PowerShell (Windows):
```powershell
# Zusammenfassung
Invoke-RestMethod -Uri "http://localhost:3000/api/flight/LH400"

# Vollständige Daten
Invoke-RestMethod -Uri "http://localhost:3000/api/flight/LH400?full=true"
```

### 2. Live-Flüge (`/api/flights`)
Liefert alle aktuellen Flüge in einer Zone oder für eine Airline.

```bash
# Flüge über Europa
curl -s "http://localhost:3000/api/flights?zone=europe"

# Flüge einer Airline (ICAO Code)
curl -s "http://localhost:3000/api/flights?airline=DLH"
```

### 3. Login (`/api/login`)
Authentifiziert den Service bei FlightRadar24 für den Zugriff auf erweiterte Daten.

```bash
curl -X POST http://localhost:3000/api/login \
     -H "Content-Type: application/json" \
     -d '{"email":"your@email.com", "password":"yourpassword"}'
```

### 4. Sonstige Endpunkte
- `GET /api/airlines`: Liste aller Airlines.
- `GET /api/zones`: Statische Koordinaten der Regionen.
- `GET /api/airports/:code`: Details zu einem Flughafen (IATA Code).

## Struktur
- `/api/fr24/index.js`: Entrypoint für **Vercel Serverless** Funktionen.
- `/services/fr24.service.js`: Zentrale Logik für Scraper & Requests.
- `/models/entities.js`: Datenmodelle & Mapping.
- `server.js`: Lokaler Express Server (für Entwicklung).
- `vercel.json`: Konfiguration für das Routing auf Vercel.

## Vercel Deployment (Serverless)

Diese API ist für das Deployment auf **Vercel** optimiert. Da Serverless-Funktionen zustandslos sind, werden Login-Sessions (Cookies) nicht dauerhaft auf dem Server gespeichert. Jede Anfrage ist unabhängig.

**Deployment-Schritte:**
1. Installiere das Vercel CLI: `npm i -g vercel`
2. Führe das Deployment aus:
   ```bash
   vercel
   ```

Die API ist dann unter `https://dein-projekt.vercel.app/api/...` erreichbar. Das Routing wird automatisch durch die `vercel.json` an den Unterordner `/api/fr24` weitergeleitet.
