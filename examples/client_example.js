/**
 * FR24 REST API Client Example (JavaScript)
 * 
 * This script demonstrates how to interact with the local FR24 REST API
 * to fetch live flights and get detailed information.
 * 
 * Run with: node examples/client_example.js
 */

const BASE_URL = "http://localhost:3000/api";

async function runExample() {
    try {
        console.log("✈️  Fetching live flights in Europe...");
        const response = await fetch(`${BASE_URL}/flights?zone=europe`);
        const { data: flights } = await response.json();

        if (!flights || flights.length === 0) {
            console.log("No flights found in the selected zone.");
            return;
        }

        console.log(`✅ Found ${flights.length} flights.`);
        
        // Take the first flight and fetch details
        const target = flights[0];
        console.log(`\n🔍 Fetching details for Flight: ${target.callsign || target.flightNumber || 'Unknown'} (ID: ${target.id})...`);
        
        const detailRes = await fetch(`${BASE_URL}/flight/${target.id}?photos=true&trail=true&airports=true`);
        const { data: details } = await detailRes.json();

        // MERGE: Use list-view data (target) as fallback for detailed view (details)
        const aircraft = details.aircraft?.model?.text || target.model || 'Unknown Aircraft';
        const registration = details.aircraft?.registration || target.registration || 'No Reg';
        const origin = details.origin?.name || target.originCode || 'Unknown Origin';
        const dest = details.destination?.name || target.destinationCode || 'Unknown Destination';
        const status = details.status?.text || (target.onGround ? 'On Ground' : 'In Flight');

        console.log("------------------------------------------");
        console.log(`Flight:       ${details.number || target.flightNumber || 'N/A'} (${details.callsign || target.callsign || 'N/A'})`);
        console.log(`Aircraft:     ${aircraft}`);
        console.log(`Registration: ${registration}`);
        console.log(`Route:        ${origin} -> ${dest}`);
        console.log(`Status:       ${status}`);
        if (details.trail && details.trail.length > 0) {
            console.log(`Trail:        ${details.trail.length} coordinates available`);
        }
        console.log("------------------------------------------");

    } catch (error) {
        console.error("❌ Error:", error.message);
        console.log("\n💡 Make sure the server is running on http://localhost:3000");
    }
}

runExample();
