import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { z } from 'zod';
import { promises as fs } from 'fs';
import path from 'path';

dotenv.config();

// Use process.cwd() for file paths - works with Vite and ES modules
const DATA_DIR = path.join(process.cwd(), 'data');
const TEXT_CUSTOMISATIONS_PATH = path.join(DATA_DIR, 'textCustomisations.json');
const LOCATIONS_PATH = path.join(DATA_DIR, 'locations.json');

// Ensure data directory exists
try {
  fs.mkdir(DATA_DIR, { recursive: true });
} catch (error) {
  console.log('Data directory already exists or cannot be created');
}

// Type definitions
type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

type DeliveryAreaResponse = {
  id: number;
  name: string;
  deliveryFee: number;
  minimumOrder: number;
  estimatedDeliveryTime: string;
};

type PostalCodeValidationResponse = {
  postalCode: string;
  isValid: boolean;
  deliveryArea?: DeliveryAreaResponse;
  error?: string;
  suggestions?: string[];
};

type PostalCodeAutoCompleteResponse = {
  suggestions: Array<{
    postalCode: string;
    city: string;
    province: string;
    deliveryArea: DeliveryAreaResponse;
  }>;
};

type AvailabilityResponse = {
  date: string;
  available: boolean;
  availableTimeslots: Array<{
    id: number;
    start: string;
    end: string;
    availableSlots: number;
    cutoffTime: string;
  }>;
};

// Location management types
type LocationAddress = {
  address1: string;
  address2?: string;
  city: string;
  province: string;
  country: string;
  zip: string;
};

type Location = {
  id: number;
  name: string;
  address: LocationAddress;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type LocationResponse = {
  locations: Location[];
};

type LocationCreateRequest = {
  name: string;
  address: LocationAddress;
};

type LocationUpdateRequest = {
  name?: string;
  address?: LocationAddress;
  isActive?: boolean;
};

// Shopify integration types
type ShopifyOrder = {
  id: number;
  order_number: number;
  customer: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  line_items: Array<{
    id: number;
    product_id: number;
    variant_id: number;
    quantity: number;
    title: string;
  }>;
  shipping_address?: {
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    zip: string;
  };
  note_attributes?: Array<{
    name: string;
    value: string;
  }>;
  tags: string;
  created_at: string;
};

type ShopifyDeliveryData = {
  deliveryType: 'express' | 'standard' | 'collection';
  deliveryDate: string;
  timeslot: string;
  collectionLocation?: number;
  postalCode: string;
};

const app = express();

// Middleware
app.use(helmet());

// CORS configuration - allow Shopify domains and configured origins
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);

    // Allow configured origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow any Shopify domain
    if (origin.endsWith('.myshopify.com') || origin.endsWith('.shopify.com')) {
      return callback(null, true);
    }

    // Allow localhost for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }

    // Allow Netlify domains (for admin dashboard and customer widget)
    if (origin.endsWith('.netlify.app')) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Validation schemas
const postalCodeValidationSchema = z.object({
  postalCode: z.string().min(1, 'Postal code is required'),
  shopDomain: z.string().min(1, 'Shop domain is required')
});

const postalCodeAutoCompleteSchema = z.object({
  partialCode: z.string().min(1, 'Partial code is required'),
  shopDomain: z.string().min(1, 'Shop domain is required'),
  limit: z.number().optional().default(5)
});

const availabilityRequestSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  deliveryAreaId: z.number().positive('Invalid delivery area ID'),
  shopDomain: z.string().min(1, 'Shop domain is required')
});

// Mock data - In production, this would come from your database
const mockDeliveryAreas: DeliveryAreaResponse[] = [
  {
    id: 1,
    name: 'Central Singapore',
    deliveryFee: 8.99,
    minimumOrder: 30,
    estimatedDeliveryTime: '2-3 hours'
  },
  {
    id: 2,
    name: 'North Singapore',
    deliveryFee: 10.99,
    minimumOrder: 35,
    estimatedDeliveryTime: '3-4 hours'
  },
  {
    id: 3,
    name: 'East Singapore',
    deliveryFee: 9.99,
    minimumOrder: 30,
    estimatedDeliveryTime: '2-3 hours'
  },
  {
    id: 4,
    name: 'West Singapore',
    deliveryFee: 11.99,
    minimumOrder: 40,
    estimatedDeliveryTime: '3-4 hours'
  },
  {
    id: 5,
    name: 'South Singapore',
    deliveryFee: 12.99,
    minimumOrder: 45,
    estimatedDeliveryTime: '3-4 hours'
  }
];

const mockPostalCodeMap: Record<string, DeliveryAreaResponse> = {
  // Central Singapore (01-08)
  '01': mockDeliveryAreas[0], // Marina Bay, Raffles Place
  '02': mockDeliveryAreas[0], // Tanjong Pagar, Chinatown
  '03': mockDeliveryAreas[0], // Queenstown, Tiong Bahru
  '04': mockDeliveryAreas[0], // Telok Blangah, Harbourfront
  '05': mockDeliveryAreas[0], // Pasir Panjang, Clementi
  '06': mockDeliveryAreas[0], // Bukit Timah, Newton
  '07': mockDeliveryAreas[0], // Orchard, Tanglin
  '08': mockDeliveryAreas[0], // Museum, Dhoby Ghaut
  
  // North Singapore (09-13)
  '09': mockDeliveryAreas[1], // Woodlands, Admiralty
  '10': mockDeliveryAreas[1], // Sembawang, Canberra
  '11': mockDeliveryAreas[1], // Yishun, Khatib
  '12': mockDeliveryAreas[1], // Seletar, Punggol
  '13': mockDeliveryAreas[1], // Ang Mo Kio, Bishan
  
  // East Singapore (14-18)
  '14': mockDeliveryAreas[2], // Eunos, Geylang
  '15': mockDeliveryAreas[2], // Katong, Joo Chiat
  '16': mockDeliveryAreas[2], // Bedok, Upper East Coast
  '17': mockDeliveryAreas[2], // Changi, Loyang
  '18': mockDeliveryAreas[2], // Tampines, Pasir Ris
  
  // West Singapore (19-23)
  '19': mockDeliveryAreas[3], // Jurong, Tuas
  '20': mockDeliveryAreas[3], // Bukit Batok, Bukit Gombak
  '21': mockDeliveryAreas[3], // Choa Chu Kang, Yew Tee
  '22': mockDeliveryAreas[3], // Kranji, Sungei Kadut
  '23': mockDeliveryAreas[3], // Tengah, Pioneer
  
  // South Singapore (24-28)
  '24': mockDeliveryAreas[4], // Sentosa, Harbourfront
  '25': mockDeliveryAreas[4], // Keppel, Labrador
  '26': mockDeliveryAreas[4], // Bukit Merah, Redhill
  '27': mockDeliveryAreas[4], // Alexandra, Commonwealth
  '28': mockDeliveryAreas[4]  // Dover, Clementi
};

// Helper function to validate postal code format (Singapore format)
function isValidSingaporePostalCode(postalCode: string): boolean {
  const postalCodeRegex = /^\d{6}$/;
  return postalCodeRegex.test(postalCode);
}

// Helper function to normalize postal code
function normalizePostalCode(postalCode: string): string {
  return postalCode.replace(/[^0-9]/g, '').padStart(6, '0');
}

// Helper function to get postal code prefix (first 2 digits for Singapore)
function getPostalCodePrefix(postalCode: string): string {
  return normalizePostalCode(postalCode).substring(0, 2);
}

// POST /postal-code/validate
app.post('/postal-code/validate', async (req, res) => {
  try {
    const { postalCode, shopDomain } = postalCodeValidationSchema.parse(req.body);
    
    // Validate postal code format
    if (!isValidSingaporePostalCode(postalCode)) {
      const response: ApiResponse<PostalCodeValidationResponse> = {
        success: false,
        error: 'Invalid postal code format. Please enter a valid Singapore postal code.'
      };
      return res.status(400).json(response);
    }

    const normalizedCode = normalizePostalCode(postalCode);
    const prefix = getPostalCodePrefix(normalizedCode);
    
    // Check if postal code is in our delivery areas
    const deliveryArea = mockPostalCodeMap[prefix];
    
    if (deliveryArea) {
      const response: ApiResponse<PostalCodeValidationResponse> = {
        success: true,
        data: {
          postalCode: normalizedCode,
          isValid: true,
          deliveryArea
        }
      };
      return res.json(response);
    } else {
      // Find similar postal codes for suggestions
      const suggestions = Object.keys(mockPostalCodeMap)
        .filter(code => code.startsWith(prefix.substring(0, 2)))
        .slice(0, 3);

      const response: ApiResponse<PostalCodeValidationResponse> = {
        success: true,
        data: {
          postalCode: normalizedCode,
          isValid: false,
          error: 'Sorry, we don\'t deliver to this area yet.',
          suggestions
        }
      };
      return res.json(response);
    }
  } catch (error) {
    console.error('Postal code validation error:', error);
    const response: ApiResponse<PostalCodeValidationResponse> = {
      success: false,
      error: 'Internal server error'
    };
    return res.status(500).json(response);
  }
});

// POST /postal-code/autocomplete
app.post('/postal-code/autocomplete', async (req, res) => {
  try {
    const { partialCode, shopDomain, limit } = postalCodeAutoCompleteSchema.parse(req.body);
    
    const normalizedPartial = normalizePostalCode(partialCode);
    
    // Find matching postal codes
    const matchingCodes = Object.keys(mockPostalCodeMap)
      .filter(code => code.startsWith(normalizedPartial))
      .slice(0, limit);

    const suggestions = matchingCodes.map(code => ({
      postalCode: code,
      city: getCityFromPostalCode(code),
      province: getProvinceFromPostalCode(code),
      deliveryArea: mockPostalCodeMap[code]
    }));

    const response: ApiResponse<PostalCodeAutoCompleteResponse> = {
      success: true,
      data: { suggestions }
    };
    
    return res.json(response);
  } catch (error) {
    console.error('Postal code autocomplete error:', error);
    const response: ApiResponse<PostalCodeAutoCompleteResponse> = {
      success: false,
      error: 'Internal server error'
    };
    return res.status(500).json(response);
  }
});

// POST /availability
app.post('/availability', async (req, res) => {
  try {
    const { date, deliveryAreaId, shopDomain } = availabilityRequestSchema.parse(req.body);
    
    // Mock availability data
    const availability: AvailabilityResponse = {
      date,
      available: true,
      availableTimeslots: [
        {
          id: 1,
          start: '10:00',
          end: '14:00',
          availableSlots: 15,
          cutoffTime: '08:00'
        },
        {
          id: 2,
          start: '14:00',
          end: '18:00',
          availableSlots: 8,
          cutoffTime: '12:00'
        }
      ]
    };

    const response: ApiResponse<AvailabilityResponse> = {
      success: true,
      data: availability
    };
    
    return res.json(response);
  } catch (error) {
    console.error('Availability check error:', error);
    const response: ApiResponse<AvailabilityResponse> = {
      success: false,
      error: 'Internal server error'
    };
    return res.status(500).json(response);
  }
});

// Helper functions for postal code data
function getCityFromPostalCode(postalCode: string): string {
  const cityMap: Record<string, string> = {
    '01': 'Marina Bay',
    '02': 'Tanjong Pagar',
    '03': 'Queenstown',
    '04': 'Telok Blangah',
    '05': 'Pasir Panjang',
    '06': 'Bukit Timah',
    '07': 'Orchard',
    '08': 'Museum',
    '09': 'Woodlands',
    '10': 'Sembawang',
    '11': 'Yishun',
    '12': 'Seletar',
    '13': 'Ang Mo Kio',
    '14': 'Eunos',
    '15': 'Katong',
    '16': 'Bedok',
    '17': 'Changi',
    '18': 'Tampines',
    '19': 'Jurong',
    '20': 'Bukit Batok',
    '21': 'Choa Chu Kang',
    '22': 'Kranji',
    '23': 'Tengah',
    '24': 'Sentosa',
    '25': 'Keppel',
    '26': 'Bukit Merah',
    '27': 'Alexandra',
    '28': 'Dover'
  };
  return cityMap[postalCode] || 'Unknown';
}

function getProvinceFromPostalCode(postalCode: string): string {
  return 'SG'; // Singapore for this example
}

// GET /text-customisations
app.get('/text-customisations', async (req, res) => {
  try {
    let data;
    try {
      data = await fs.readFile(TEXT_CUSTOMISATIONS_PATH, 'utf-8');
    } catch (err) {
      // If file doesn't exist, return defaults
      data = JSON.stringify({
        deliveryType: "Select delivery type...",
        deliveryDate: "Select a date...",
        timeslot: "Select a timeslot...",
        postalCode: "Enter your postal code..."
      });
    }
    res.json({ success: true, data: JSON.parse(data) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to load text customisations.' });
  }
});

// POST /text-customisations
app.post('/text-customisations', async (req, res) => {
  try {
    const { deliveryType, deliveryDate, timeslot, postalCode } = req.body;
    const newData = { deliveryType, deliveryDate, timeslot, postalCode };
    await fs.writeFile(TEXT_CUSTOMISATIONS_PATH, JSON.stringify(newData, null, 2), 'utf-8');
    res.json({ success: true, data: newData });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to save text customisations.' });
  }
});

// Location management endpoints

// GET /locations
app.get('/locations', async (req, res) => {
  try {
    let data;
    try {
      data = await fs.readFile(LOCATIONS_PATH, 'utf-8');
    } catch (err) {
      // If file doesn't exist, return empty array
      data = JSON.stringify({ locations: [] });
    }
    res.json({ success: true, data: JSON.parse(data) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to load locations.' });
  }
});

// POST /locations
app.post('/locations', async (req, res) => {
  try {
    const { name, address }: LocationCreateRequest = req.body;
    
    // Validate required fields
    if (!name || !address || !address.address1 || !address.city || !address.zip) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, address1, city, and zip are required.' 
      });
    }

    // Read existing locations
    let locations: Location[] = [];
    try {
      const data = await fs.readFile(LOCATIONS_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      locations = parsed.locations || [];
    } catch (err) {
      // File doesn't exist, start with empty array
    }

    // Create new location
    const newLocation: Location = {
      id: Date.now(),
      name,
      address: {
        address1: address.address1,
        address2: address.address2 || '',
        city: address.city,
        province: address.province || '',
        country: address.country || 'Singapore',
        zip: address.zip
      },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    locations.push(newLocation);

    // Save to file
    await fs.writeFile(LOCATIONS_PATH, JSON.stringify({ locations }, null, 2), 'utf-8');
    
    res.json({ success: true, data: newLocation });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to create location.' });
  }
});

// PUT /locations/:id
app.put('/locations/:id', async (req, res) => {
  try {
    const locationId = parseInt(req.params.id);
    const updates: LocationUpdateRequest = req.body;

    // Read existing locations
    let locations: Location[] = [];
    try {
      const data = await fs.readFile(LOCATIONS_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      locations = parsed.locations || [];
    } catch (err) {
      return res.status(404).json({ success: false, error: 'No locations found.' });
    }

    // Find and update location
    const locationIndex = locations.findIndex(loc => loc.id === locationId);
    if (locationIndex === -1) {
      return res.status(404).json({ success: false, error: 'Location not found.' });
    }

    const updatedLocation = {
      ...locations[locationIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    locations[locationIndex] = updatedLocation;

    // Save to file
    await fs.writeFile(LOCATIONS_PATH, JSON.stringify({ locations }, null, 2), 'utf-8');
    
    res.json({ success: true, data: updatedLocation });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update location.' });
  }
});

// DELETE /locations/:id
app.delete('/locations/:id', async (req, res) => {
  try {
    const locationId = parseInt(req.params.id);

    // Read existing locations
    let locations: Location[] = [];
    try {
      const data = await fs.readFile(LOCATIONS_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      locations = parsed.locations || [];
    } catch (err) {
      return res.status(404).json({ success: false, error: 'No locations found.' });
    }

    // Find and remove location
    const locationIndex = locations.findIndex(loc => loc.id === locationId);
    if (locationIndex === -1) {
      return res.status(404).json({ success: false, error: 'Location not found.' });
    }

    const deletedLocation = locations[locationIndex];
    locations.splice(locationIndex, 1);

    // Save to file
    await fs.writeFile(LOCATIONS_PATH, JSON.stringify({ locations }, null, 2), 'utf-8');
    
    res.json({ success: true, data: deletedLocation });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete location.' });
  }
});

// Express timeslots endpoints

// GET /express-timeslots
app.get('/express-timeslots', async (req, res) => {
  try {
    // For now, return mock express timeslots
    // In production, this would be stored in a database or file
    const expressTimeslots = [
      { id: 1, start: "10:30", end: "11:30", fee: 25 },
      { id: 2, start: "11:30", end: "12:30", fee: 20 },
      { id: 3, start: "12:30", end: "13:30", fee: 10 },
      { id: 4, start: "13:30", end: "14:30", fee: 0 },
      { id: 5, start: "14:30", end: "15:30", fee: 0 },
      { id: 6, start: "15:30", end: "16:30", fee: 0 },
      { id: 7, start: "16:30", end: "17:30", fee: 0 },
    ];
    
    res.json({ success: true, data: { expressTimeslots } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to load express timeslots.' });
  }
});

// Shopify integration endpoints

// POST /shopify/save-delivery-data
app.post('/shopify/save-delivery-data', async (req, res) => {
  try {
    const { orderId, deliveryData, shopDomain }: {
      orderId: number;
      deliveryData: ShopifyDeliveryData;
      shopDomain: string;
    } = req.body;

    // Validate required fields
    if (!orderId || !deliveryData || !shopDomain) {
      return res.status(400).json({
        success: false,
        error: 'Order ID, delivery data, and shop domain are required.'
      });
    }

    // In a real implementation, you would:
    // 1. Verify the Shopify webhook/request
    // 2. Update the order with delivery information
    // 3. Store delivery data in your database
    // 4. Send confirmation to Shopify

    // For now, we'll just return success
    // You can implement the actual Shopify API calls here
    
    console.log(`Saving delivery data for order ${orderId} in shop ${shopDomain}:`, deliveryData);

    res.json({
      success: true,
      data: {
        orderId,
        deliveryData,
        shopDomain,
        savedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Error saving delivery data:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to save delivery data.'
    });
  }
});

// GET /shopify/orders/:orderId/delivery-data
app.get('/shopify/orders/:orderId/delivery-data', async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const { shopDomain } = req.query;

    if (!shopDomain) {
      return res.status(400).json({
        success: false,
        error: 'Shop domain is required.'
      });
    }

    // In a real implementation, you would fetch this from your database
    // For now, return mock data
    const mockDeliveryData: ShopifyDeliveryData = {
      deliveryType: 'standard',
      deliveryDate: '2024-06-15',
      timeslot: '14:00-16:00',
      postalCode: '123456'
    };

    res.json({
      success: true,
      data: mockDeliveryData
    });
  } catch (err) {
    console.error('Error fetching delivery data:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch delivery data.'
    });
  }
});

// POST /shopify/webhook/orders/create
app.post('/shopify/webhook/orders/create', async (req, res) => {
  try {
    const order: ShopifyOrder = req.body;
    
    console.log('Received order creation webhook:', order.order_number);

    // In a real implementation, you would:
    // 1. Verify the webhook signature
    // 2. Process the order
    // 3. Store order data
    // 4. Send notifications if needed

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error processing order webhook:', err);
    res.status(500).json({ success: false });
  }
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV === 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 API server running on port ${PORT}`);
  });
}

export const viteNodeApp = app; 