class Flight {
  constructor(id, data) {
    this.id = id;
    this.latitude = data[1];
    this.longitude = data[2];
    this.heading = data[3];
    this.altitude = data[4];
    this.speed = data[5];
    this.origin = data[11];
    this.destination = data[12];
    this.airlineIcao = data[18];
  }
}

class Airport {
  constructor(data) {
    this.details = data;
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
    this.raw = data; // Keep raw for extended info
  }
}

module.exports = { Flight, Airport, Zone, FlightDetails };
