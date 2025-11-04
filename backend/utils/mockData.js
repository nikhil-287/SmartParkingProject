// Mock parking data based on Geoapify response structure
const mockParkingData = [
  {
    type: "Feature",
    properties: {
      name: "VTA Park and Ride - SJSU North",
      formatted: "850 N 4th Street, San Jose, CA 95112",
      categories: ["parking", "parking.cars", "parking.surface"],
      lon: -121.878924,
      lat: 37.339386,
      parking: {
        type: "surface",
        access: "permissive",
        capacity: 150,
        fee: false,
        park_and_ride: true
      },
      restrictions: {
        access: "permissive"
      }
    },
    geometry: {
      type: "Point",
      coordinates: [-121.878924, 37.339386]
    }
  },
  {
    type: "Feature",
    properties: {
      name: "SJSU 7th Street Garage",
      formatted: "330 S 7th Street, San Jose, CA 95112",
      categories: ["parking", "parking.cars", "parking.multistorey"],
      lon: -121.882214,
      lat: 37.334512,
      parking: {
        type: "multi-storey",
        access: "public",
        capacity: 800,
        fee: true,
        levels: 10
      },
      restrictions: {
        access: "public"
      }
    },
    geometry: {
      type: "Point",
      coordinates: [-121.882214, 37.334512]
    }
  },
  {
    type: "Feature",
    properties: {
      name: "City Hall Parking",
      formatted: "200 E Santa Clara St, San Jose, CA 95113",
      categories: ["parking", "parking.cars", "parking.underground"],
      lon: -121.885422,
      lat: 37.337702,
      parking: {
        type: "underground",
        access: "public",
        capacity: 500,
        fee: true
      },
      restrictions: {
        access: "public"
      }
    },
    geometry: {
      type: "Point",
      coordinates: [-121.885422, 37.337702]
    }
  },
  {
    type: "Feature",
    properties: {
      name: "Plaza Parking Lot",
      formatted: "88 S 4th St, San Jose, CA 95112",
      categories: ["parking", "parking.cars", "parking.surface"],
      lon: -121.880556,
      lat: 37.334888,
      parking: {
        type: "surface",
        access: "public",
        capacity: 75,
        fee: true
      },
      restrictions: {
        access: "public"
      }
    },
    geometry: {
      type: "Point",
      coordinates: [-121.880556, 37.334888]
    }
  },
  {
    type: "Feature",
    properties: {
      name: "Japantown Parking",
      formatted: "565 N 6th St, San Jose, CA 95112",
      categories: ["parking", "parking.cars", "parking.surface"],
      lon: -121.879234,
      lat: 37.352891,
      parking: {
        type: "surface",
        access: "public",
        capacity: 120,
        fee: false
      },
      restrictions: {
        access: "public"
      }
    },
    geometry: {
      type: "Point",
      coordinates: [-121.879234, 37.352891]
    }
  }
];

module.exports = mockParkingData;
