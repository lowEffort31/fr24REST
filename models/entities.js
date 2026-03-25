class Flight {
  constructor(id, data) {
    this.id = id;
    this.latitude = data[1];
    this.longitude = data[2];
    this.heading = data[3];
    this.altitude = data[4];
    this.speed = data[5];
    this.radar = data[7];
    this.model = data[8];
    this.registration = data[9];
    this.originCode = data[11];
    this.destinationCode = data[12];
    this.flightNumber = data[13];
    this.callsign = data[16];
    this.airline = data[18];
    this.intelligence = {};
  }

  calculateNeighborhood(refLat, refLon, prevDistance = null) {
      const R = 6371; // Earth radius in km
      const dLat = (this.latitude - refLat) * Math.PI / 180;
      const dLon = (this.longitude - refLon) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(refLat * Math.PI / 180) * Math.cos(this.latitude * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      this.distance = Math.round(R * c * 10) / 10;
      
      // isApproaching: true if heading is towards reference point (simplified)
      // or if we have historical data (not available here, so we use heading vector)
      const angleToRef = Math.atan2(refLon - this.longitude, refLat - this.latitude) * 180 / Math.PI;
      const normalizedAngle = (angleToRef + 360) % 360;
      const diff = Math.abs(this.heading - normalizedAngle);
      this.intelligence.isApproaching = diff < 90 || diff > 270;
  }
}

class Airport {
  constructor(pluginData) {
    const details = pluginData.details || {};
    this.name = details.name;
    this.code = details.code;
    this.position = details.position;
    this.timezone = details.timezone;
    this.visible = details.visible;
    this.website = details.website;
    
    // Optional plugins
    if (pluginData.weather) {
      this.weather = pluginData.weather;
      // Synthesize Weather Summary v3
      const windKts = pluginData.weather.wind?.speed?.kts || 0;
      const visKm = pluginData.weather.sky?.visibility?.km || 10;
      const metar = pluginData.weather.metar || "";
      
      let weatherImpact = "low";
      if (windKts > 25 || visKm < 1 || /TS|SN|FG|SQ/.test(metar)) weatherImpact = "high";

      this.weatherSummary = {
          metar: metar,
          temp: pluginData.weather.temp?.celsius,
          wind: `${pluginData.weather.wind?.direction?.degree}° / ${windKts} kts`,
          visibility: visKm,
          pressure: pluginData.weather.pressure?.hpa,
          condition: this.parseWeatherCondition(pluginData.weather),
          weatherImpact: weatherImpact,
          visibilityStatus: visKm < 5 ? "IFR" : "VFR"
      };
    }
    
    if (pluginData.schedule) {
        this.schedule = pluginData.schedule;
        // Turnaround Intelligence (find aterrizando -> despegando same registration)
        this.calculateTurnarounds();
    }
    
    if (pluginData.runways) this.runways = pluginData.runways;
    if (pluginData.aircraftCount) {
        this.aircraftCount = pluginData.aircraftCount;
    } else if (details.stats) {
        this.aircraftCount = details.stats;
    }

    // Airport Congestion v3
    if (this.aircraftCount) {
        const onGround = (this.aircraftCount.ground || this.aircraftCount.total_ground || 0);
        const traffic = (this.aircraftCount.total_arrivals || 0) + (this.aircraftCount.total_departures || 0);
        this.airportCongestion = Math.min(10, Math.max(1, Math.round((onGround / (traffic || 100)) * 10)));
    }
    
    this.raw = pluginData;
  }

  calculateTurnarounds() {
    if (!this.schedule || !this.schedule.arrivals || !this.schedule.departures) return;
    
    const arrivals = this.schedule.arrivals.data || [];
    const departures = this.schedule.departures.data || [];
    
    this.turnarounds = [];
    
    arrivals.forEach(arrival => {
        const reg = arrival.flight?.aircraft?.registration;
        if (!reg) return;
        
        const departure = departures.find(d => d.flight?.aircraft?.registration === reg);
        if (departure) {
            const landingTime = arrival.flight?.time?.estimated?.arrival || arrival.flight?.time?.scheduled?.arrival;
            const takeoffTime = departure.flight?.time?.estimated?.departure || departure.flight?.time?.scheduled?.departure;
            
            if (landingTime && takeoffTime) {
                const groundWindow = Math.round((takeoffTime - landingTime) / 60);
                
                // Get turnaround reference for probability score
                const model = arrival.flight?.aircraft?.model?.code || "";
                let ref = 35; // Default reference
                if (model.startsWith('B73') || model.startsWith('A32')) ref = 35;
                else if (model.startsWith('B7') || model.startsWith('A3') || model.startsWith('A7')) ref = 75;
                else if (model.length > 0) ref = 30;

                let delayRisk = "low";
                if (groundWindow < 30) delayRisk = "high";
                else if (groundWindow < ref + 10) delayRisk = "medium";

                // Gate Prediction v3
                let predictedArrivalGate = arrival.flight?.airport?.origin?.info?.gate || null;
                let gateConfidence = predictedArrivalGate ? "high" : "none";
                
                if (!predictedArrivalGate && departure.flight?.airport?.origin?.info?.gate) {
                    predictedArrivalGate = departure.flight.airport.origin.info.gate;
                    gateConfidence = "predicted (turnaround)";
                }

                this.turnarounds.push({
                    registration: reg,
                    model: model,
                    inboundFlight: arrival.flight?.identification?.number?.default,
                    outboundFlight: departure.flight?.identification?.number?.default,
                    groundWindow: groundWindow,
                    turnaroundReference: ref,
                    delayRisk: delayRisk,
                    predictedArrivalGate: predictedArrivalGate,
                    gateConfidence: gateConfidence
                });
            }
        }
    });
  }

  parseWeatherCondition(weather) {
      const metar = weather.metar || "";
      if (metar.includes('TS') || metar.includes('SQ') || metar.includes('FC')) return "Thunderstorms/Severe";
      if (metar.includes('SN') || metar.includes('GR')) return "Snow/Hail";
      if (metar.includes('RA') || metar.includes('DZ')) return "Rainy";
      
      return weather.flight?.category || "VFR";
  }
}

class Zone {
  constructor(name, data) {
    this.name = name;
    this.tl_y = data.tl_y;
    this.tl_x = data.tl_x;
    this.br_y = data.br_y;
    this.br_x = data.br_x;
  }
}

class FlightDetails {
  constructor(data) {
    this.id = data.identification?.id;
    this.callsign = data.identification?.callsign;
    this.number = data.identification?.number?.default;
    this.aircraft = data.aircraft;
    this.airline = data.airline;
    this.origin = data.airport?.origin;
    this.destination = data.airport?.destination;
    this.status = data.status;
    this.trail = data.trail;
    this.time = data.time;
    
    // Intelligence Layer: Calculated Data
    this.intelligence = this.calculateIntelligence(data);
    
    this.raw = data;
  }

  calculateIntelligence(data) {
    const time = data.time || {};
    const intel = {};
    
    // 1. Delay Minutes
    if (time.scheduled?.departure && time.estimated?.departure) {
        intel.departureDelay = Math.round((time.estimated.departure - time.scheduled.departure) / 60);
    }
    if (time.scheduled?.arrival && time.estimated?.arrival) {
        intel.arrivalDelay = Math.round((time.estimated.arrival - time.scheduled.arrival) / 60);
    }

    // 2. Turnaround Reference (Static values based on type)
    const type = data.aircraft?.model?.code || "";
    if (type.startsWith('B73') || type.startsWith('A32')) {
        intel.turnaroundReference = 35; // Standard Narrowbody
    } else if (type.startsWith('B7') || type.startsWith('A3') || type.startsWith('A7')) {
        intel.turnaroundReference = 75; // Widebody / Heavy
    } else if (type.length > 0) {
        intel.turnaroundReference = 30; // Regional/Small
    }

    // 3. Progress Intelligence v3
    const now = Math.floor(Date.now() / 1000);
    const dep = time.real?.departure || time.estimated?.departure || time.scheduled?.departure;
    const arr = time.estimated?.arrival || time.scheduled?.arrival;

    if (dep && arr && now > dep) {
        const total = arr - dep;
        const elapsed = now - dep;
        intel.progressPercent = Math.min(100, Math.round((elapsed / total) * 100));
        intel.remainingTime = Math.max(0, Math.round((arr - now) / 60));
    }

    // 4. Aircraft Vibe v3
    const VIBES = {
        'A388': "Superjumbo (King of the Skies)",
        'B748': "Queen of the Skies",
        'B38M': "737 MAX (The Gamechanger)",
        'A21N': "A321neo (Efficient Workhorse)",
        'B789': "Dreamliner",
        'A359': "XWB (Sleek & Silent)"
    };
    intel.aircraftVibe = VIBES[type] || "Reliable Flyer";

    return intel;
  }
}

module.exports = { Flight, Airport, Zone, FlightDetails };
