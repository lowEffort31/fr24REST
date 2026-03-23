import requests
import json

"""
FR24 REST API Client Example (Python)

This script demonstrates how to interact with the local FR24 REST API
to fetch live flights and get detailed information.

Requirements: pip install requests
Run with: python examples/client_example.py
"""

BASE_URL = "http://localhost:3000/api"

def run_example():
    try:
        print("✈️  Fetching live flights in Europe...")
        response = requests.get(f"{BASE_URL}/flights?zone=europe")
        response.raise_for_status()
        flights = response.json().get('data', [])

        if not flights:
            print("No flights found in the selected zone.")
            return

        print(f"✅ Found {len(flights)} flights.")

        # Take the first flight and fetch details
        target = flights[0]
        flight_id = target.get('id')
        callsign = target.get('callsign') or target.get('flightNumber', 'Unknown')
        
        print(f"\n🔍 Fetching details for Flight: {callsign} (ID: {flight_id})...")
        
        # Fetch details with photos, trail and airports enabled
        params = {"photos": "true", "trail": "true", "airports": "true"}
        detail_res = requests.get(f"{BASE_URL}/flight/{flight_id}", params=params)
        detail_res.raise_for_status()
        details = detail_res.json().get('data', {}) or {}

        # MERGE: Use list-view data (target) as fallback for detailed view (details)
        aircraft_info = details.get('aircraft', {}) or {}
        aircraft_name = aircraft_info.get('model', {}).get('text') or target.get('model') or 'Unknown Aircraft'
        reg = aircraft_info.get('registration') or target.get('registration') or 'No Reg'
        
        origin_info = details.get('origin', {}) or {}
        dest_info = details.get('destination', {}) or {}
        origin_name = origin_info.get('name') or target.get('originCode') or 'Unknown Origin'
        dest_name = dest_info.get('name') or target.get('destinationCode') or 'Unknown Destination'
        
        status_info = details.get('status', {}) or {}
        status_text = status_info.get('text') or ("On Ground" if target.get('onGround') else "In Flight")

        print("------------------------------------------")
        print(f"Flight:       {details.get('number') or target.get('flightNumber') or 'N/A'} ({details.get('callsign') or target.get('callsign') or 'N/A'})")
        print(f"Aircraft:     {aircraft_name}")
        print(f"Registration: {reg}")
        print(f"Route:        {origin_name} -> {dest_name}")
        print(f"Status:       {status_text}")
        
        trail = details.get('trail', [])
        if trail:
            print(f"Trail:        {len(trail)} coordinates available")
        print("------------------------------------------")

    except requests.exceptions.RequestException as e:
        print(f"❌ Error: {e}")
        print("\n💡 Make sure the server is running on http://localhost:3000")

if __name__ == "__main__":
    run_example()
