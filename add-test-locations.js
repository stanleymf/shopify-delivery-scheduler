// Script to add test collection locations
const API_URL = 'https://shopify-delivery-scheduler-production.up.railway.app';

const testLocations = [
  {
    name: "Orchard Collection Point",
    address: {
      address1: "313 Orchard Road",
      address2: "Level 3",
      city: "Singapore",
      province: "Central",
      country: "Singapore",
      zip: "238895"
    }
  },
  {
    name: "Marina Bay Collection",
    address: {
      address1: "10 Bayfront Avenue",
      address2: "Basement 1",
      city: "Singapore",
      province: "Central",
      country: "Singapore",
      zip: "018956"
    }
  },
  {
    name: "VivoCity Collection",
    address: {
      address1: "1 HarbourFront Walk",
      address2: "Level 2",
      city: "Singapore",
      province: "South",
      country: "Singapore",
      zip: "098585"
    }
  }
];

async function addLocations() {
  for (const location of testLocations) {
    try {
      const response = await fetch(`${API_URL}/locations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(location)
      });
      
      const data = await response.json();
      if (data.success) {
        console.log(`✅ Added location: ${location.name}`);
      } else {
        console.log(`❌ Failed to add ${location.name}:`, data.error);
      }
    } catch (error) {
      console.log(`❌ Error adding ${location.name}:`, error.message);
    }
  }
}

// Run the script
addLocations(); 