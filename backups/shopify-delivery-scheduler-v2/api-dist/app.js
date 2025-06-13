import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { z } from "zod";
import { promises } from "fs";
import path from "path";
const DATA_DIR$1 = path.join(process.cwd(), "data");
const DB_FILES = {
  deliveryAreas: path.join(DATA_DIR$1, "deliveryAreas.json"),
  globalTimeslots: path.join(DATA_DIR$1, "globalTimeslots.json"),
  expressTimeslots: path.join(DATA_DIR$1, "expressTimeslots.json"),
  expressTimeslotAssignments: path.join(DATA_DIR$1, "expressTimeslotAssignments.json"),
  dayAssignments: path.join(DATA_DIR$1, "dayAssignments.json"),
  blockedDates: path.join(DATA_DIR$1, "blockedDates.json"),
  blockedTimeslots: path.join(DATA_DIR$1, "blockedTimeslots.json"),
  globalAdvanceOrderRules: path.join(DATA_DIR$1, "globalAdvanceOrderRules.json"),
  productAdvanceOrderRules: path.join(DATA_DIR$1, "productAdvanceOrderRules.json"),
  locations: path.join(DATA_DIR$1, "locations.json"),
  textCustomizations: path.join(DATA_DIR$1, "textCustomizations.json"),
  settings: path.join(DATA_DIR$1, "settings.json")
};
class Database {
  constructor() {
    this.initializeDataDirectory();
  }
  async initializeDataDirectory() {
    try {
      await promises.mkdir(DATA_DIR$1, { recursive: true });
      console.log("Data directory initialized:", DATA_DIR$1);
    } catch (error) {
      console.error("Failed to create data directory:", error);
    }
  }
  // Generic methods
  async readFile(filePath, defaultValue) {
    try {
      const data = await promises.readFile(filePath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      await this.writeFile(filePath, defaultValue);
      return defaultValue;
    }
  }
  async writeFile(filePath, data) {
    try {
      await promises.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (error) {
      console.error(`Failed to write to ${filePath}:`, error);
      throw error;
    }
  }
  // Delivery Areas
  async getDeliveryAreas() {
    return this.readFile(DB_FILES.deliveryAreas, [
      { id: 1, name: "Central Singapore", deliveryFee: 0, minimumOrder: 50, estimatedDeliveryTime: "1-2 business days" },
      { id: 2, name: "North Singapore", deliveryFee: 0, minimumOrder: 50, estimatedDeliveryTime: "1-2 business days" },
      { id: 3, name: "East Singapore", deliveryFee: 0, minimumOrder: 50, estimatedDeliveryTime: "1-2 business days" },
      { id: 4, name: "West Singapore", deliveryFee: 0, minimumOrder: 50, estimatedDeliveryTime: "1-2 business days" },
      { id: 5, name: "South Singapore", deliveryFee: 0, minimumOrder: 50, estimatedDeliveryTime: "1-2 business days" }
    ]);
  }
  async saveDeliveryAreas(areas) {
    await this.writeFile(DB_FILES.deliveryAreas, areas);
  }
  // Global Timeslots
  async getGlobalTimeslots() {
    return this.readFile(DB_FILES.globalTimeslots, [
      { id: 1, name: "Morning Delivery", startTime: "09:00", endTime: "12:00", maxSlots: 10, deliveryType: "delivery", cutoffTime: "08:00", cutoffType: "same-day", isActive: true, createdAt: (/* @__PURE__ */ new Date()).toISOString() },
      { id: 2, name: "Afternoon Delivery", startTime: "13:00", endTime: "17:00", maxSlots: 8, deliveryType: "delivery", cutoffTime: "12:00", cutoffType: "same-day", isActive: true, createdAt: (/* @__PURE__ */ new Date()).toISOString() },
      { id: 3, name: "Evening Collection", startTime: "18:00", endTime: "20:00", maxSlots: 5, deliveryType: "collection", cutoffTime: "17:00", cutoffType: "same-day", isActive: true, createdAt: (/* @__PURE__ */ new Date()).toISOString() }
    ]);
  }
  async saveGlobalTimeslots(timeslots) {
    await this.writeFile(DB_FILES.globalTimeslots, timeslots);
  }
  // Express Timeslots
  async getExpressTimeslots() {
    return this.readFile(DB_FILES.expressTimeslots, [
      { id: 1, name: "Express Morning", startTime: "10:00", endTime: "12:00", fee: 15, maxSlots: 3, isActive: true, cutoffMinutes: 60, dayOfWeek: 1, createdAt: (/* @__PURE__ */ new Date()).toISOString() },
      { id: 2, name: "Express Afternoon", startTime: "14:00", endTime: "16:00", fee: 18, maxSlots: 3, isActive: true, cutoffMinutes: 90, dayOfWeek: 1, createdAt: (/* @__PURE__ */ new Date()).toISOString() },
      { id: 3, name: "Express Friday", startTime: "15:00", endTime: "17:00", fee: 20, maxSlots: 2, isActive: true, cutoffMinutes: 120, dayOfWeek: 5, createdAt: (/* @__PURE__ */ new Date()).toISOString() }
    ]);
  }
  async saveExpressTimeslots(timeslots) {
    await this.writeFile(DB_FILES.expressTimeslots, timeslots);
  }
  // Express Timeslot Assignments
  async getExpressTimeslotAssignments() {
    return this.readFile(DB_FILES.expressTimeslotAssignments, []);
  }
  async saveExpressTimeslotAssignments(assignments) {
    await this.writeFile(DB_FILES.expressTimeslotAssignments, assignments);
  }
  // Day Assignments
  async getDayAssignments() {
    return this.readFile(DB_FILES.dayAssignments, []);
  }
  async saveDayAssignments(assignments) {
    await this.writeFile(DB_FILES.dayAssignments, assignments);
  }
  // Blocked Dates
  async getBlockedDates() {
    return this.readFile(DB_FILES.blockedDates, []);
  }
  async saveBlockedDates(blockedDates) {
    await this.writeFile(DB_FILES.blockedDates, blockedDates);
  }
  // Blocked Timeslots
  async getBlockedTimeslots() {
    return this.readFile(DB_FILES.blockedTimeslots, []);
  }
  async saveBlockedTimeslots(blockedTimeslots) {
    await this.writeFile(DB_FILES.blockedTimeslots, blockedTimeslots);
  }
  // Global Advance Order Rules
  async getGlobalAdvanceOrderRules() {
    return this.readFile(DB_FILES.globalAdvanceOrderRules, []);
  }
  async saveGlobalAdvanceOrderRules(rules) {
    await this.writeFile(DB_FILES.globalAdvanceOrderRules, rules);
  }
  // Product Advance Order Rules
  async getProductAdvanceOrderRules() {
    return this.readFile(DB_FILES.productAdvanceOrderRules, []);
  }
  async saveProductAdvanceOrderRules(rules) {
    await this.writeFile(DB_FILES.productAdvanceOrderRules, rules);
  }
  // Locations
  async getLocations() {
    return this.readFile(DB_FILES.locations, []);
  }
  async saveLocations(locations) {
    await this.writeFile(DB_FILES.locations, locations);
  }
  // Text Customizations
  async getTextCustomizations() {
    return this.readFile(DB_FILES.textCustomizations, {
      deliveryType: "Delivery Type",
      deliveryDate: "Delivery Date",
      timeslot: "Time Slot",
      postalCode: "Postal Code"
    });
  }
  async saveTextCustomizations(customizations) {
    await this.writeFile(DB_FILES.textCustomizations, customizations);
  }
  // Settings
  async getSettings() {
    return this.readFile(DB_FILES.settings, {
      version: "1.0.0",
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
      migrationVersion: 1
    });
  }
  async saveSettings(settings) {
    await this.writeFile(DB_FILES.settings, settings);
  }
  // Backup and restore
  async createBackup() {
    const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
    const backupDir = path.join(DATA_DIR$1, "backups");
    await promises.mkdir(backupDir, { recursive: true });
    const backupFile = path.join(backupDir, `backup-${timestamp}.json`);
    const backup = {
      timestamp,
      data: {
        deliveryAreas: await this.getDeliveryAreas(),
        globalTimeslots: await this.getGlobalTimeslots(),
        expressTimeslots: await this.getExpressTimeslots(),
        expressTimeslotAssignments: await this.getExpressTimeslotAssignments(),
        dayAssignments: await this.getDayAssignments(),
        blockedDates: await this.getBlockedDates(),
        blockedTimeslots: await this.getBlockedTimeslots(),
        globalAdvanceOrderRules: await this.getGlobalAdvanceOrderRules(),
        productAdvanceOrderRules: await this.getProductAdvanceOrderRules(),
        locations: await this.getLocations(),
        textCustomizations: await this.getTextCustomizations(),
        settings: await this.getSettings()
      }
    };
    await this.writeFile(backupFile, backup);
    return backupFile;
  }
  async restoreFromBackup(backupFile) {
    const backup = await this.readFile(backupFile, null);
    if (!backup || !backup.data) {
      throw new Error("Invalid backup file");
    }
    const { data } = backup;
    await Promise.all([
      this.saveDeliveryAreas(data.deliveryAreas || []),
      this.saveGlobalTimeslots(data.globalTimeslots || []),
      this.saveExpressTimeslots(data.expressTimeslots || []),
      this.saveExpressTimeslotAssignments(data.expressTimeslotAssignments || []),
      this.saveDayAssignments(data.dayAssignments || []),
      this.saveBlockedDates(data.blockedDates || []),
      this.saveBlockedTimeslots(data.blockedTimeslots || []),
      this.saveGlobalAdvanceOrderRules(data.globalAdvanceOrderRules || []),
      this.saveProductAdvanceOrderRules(data.productAdvanceOrderRules || []),
      this.saveLocations(data.locations || []),
      this.saveTextCustomizations(data.textCustomizations || {}),
      this.saveSettings({ ...data.settings, lastUpdated: (/* @__PURE__ */ new Date()).toISOString() })
    ]);
  }
  // Export all data
  async exportAllData() {
    return {
      deliveryAreas: await this.getDeliveryAreas(),
      globalTimeslots: await this.getGlobalTimeslots(),
      expressTimeslots: await this.getExpressTimeslots(),
      expressTimeslotAssignments: await this.getExpressTimeslotAssignments(),
      dayAssignments: await this.getDayAssignments(),
      blockedDates: await this.getBlockedDates(),
      blockedTimeslots: await this.getBlockedTimeslots(),
      globalAdvanceOrderRules: await this.getGlobalAdvanceOrderRules(),
      productAdvanceOrderRules: await this.getProductAdvanceOrderRules(),
      locations: await this.getLocations(),
      textCustomizations: await this.getTextCustomizations(),
      settings: await this.getSettings()
    };
  }
}
const db = new Database();
dotenv.config();
const DATA_DIR = path.join(process.cwd(), "data");
const TEXT_CUSTOMISATIONS_PATH = path.join(DATA_DIR, "textCustomisations.json");
const LOCATIONS_PATH = path.join(DATA_DIR, "locations.json");
try {
  promises.mkdir(DATA_DIR, { recursive: true });
} catch (error) {
  console.log("Data directory already exists or cannot be created");
}
const app = express();
app.use(helmet());
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin)
      return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    if (origin.endsWith(".myshopify.com") || origin.endsWith(".shopify.com")) {
      return callback(null, true);
    }
    if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
      return callback(null, true);
    }
    if (origin.endsWith(".netlify.app")) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
};
app.use(cors(corsOptions));
app.use(express.json());
app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    version: "1.0.0"
  });
});
const postalCodeValidationSchema = z.object({
  postalCode: z.string().min(1, "Postal code is required"),
  shopDomain: z.string().min(1, "Shop domain is required")
});
const postalCodeAutoCompleteSchema = z.object({
  partialCode: z.string().min(1, "Partial code is required"),
  shopDomain: z.string().min(1, "Shop domain is required"),
  limit: z.number().optional().default(5)
});
const availabilityRequestSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  deliveryAreaId: z.number().positive("Invalid delivery area ID"),
  shopDomain: z.string().min(1, "Shop domain is required")
});
const mockDeliveryAreas = [
  {
    id: 1,
    name: "Central Singapore",
    deliveryFee: 0,
    minimumOrder: 0,
    estimatedDeliveryTime: "2-3 hours"
  },
  {
    id: 2,
    name: "North Singapore",
    deliveryFee: 0,
    minimumOrder: 0,
    estimatedDeliveryTime: "3-4 hours"
  },
  {
    id: 3,
    name: "East Singapore",
    deliveryFee: 0,
    minimumOrder: 0,
    estimatedDeliveryTime: "2-3 hours"
  },
  {
    id: 4,
    name: "West Singapore",
    deliveryFee: 0,
    minimumOrder: 0,
    estimatedDeliveryTime: "3-4 hours"
  },
  {
    id: 5,
    name: "South Singapore",
    deliveryFee: 0,
    minimumOrder: 0,
    estimatedDeliveryTime: "3-4 hours"
  }
];
const mockPostalCodeMap = {
  // Central Singapore (01-11)
  "01": mockDeliveryAreas[0],
  // Marina Bay, Raffles Place
  "02": mockDeliveryAreas[0],
  // Tanjong Pagar, Chinatown
  "03": mockDeliveryAreas[0],
  // Queenstown, Tiong Bahru
  "04": mockDeliveryAreas[0],
  // Telok Blangah, Harbourfront
  "05": mockDeliveryAreas[0],
  // Pasir Panjang, Clementi
  "06": mockDeliveryAreas[0],
  // Bukit Timah, Newton
  "07": mockDeliveryAreas[0],
  // Orchard, Tanglin
  "08": mockDeliveryAreas[0],
  // Museum, Dhoby Ghaut
  "09": mockDeliveryAreas[0],
  // Rochor, Bugis
  "10": mockDeliveryAreas[0],
  // Novena, Thomson
  "11": mockDeliveryAreas[0],
  // Bishan, Ang Mo Kio
  // North Singapore (72-73, 75-82)
  "72": mockDeliveryAreas[1],
  // Woodlands, Admiralty
  "73": mockDeliveryAreas[1],
  // Sembawang, Canberra
  "75": mockDeliveryAreas[1],
  // Yishun, Khatib
  "76": mockDeliveryAreas[1],
  // Upper Thomson, Lentor
  "77": mockDeliveryAreas[1],
  // Seletar, Punggol
  "78": mockDeliveryAreas[1],
  // Punggol East, Coney Island
  "79": mockDeliveryAreas[1],
  // Sengkang, Buangkok
  "80": mockDeliveryAreas[1],
  // Hougang, Ponggol
  "81": mockDeliveryAreas[1],
  // Serangoon, Bartley
  "82": mockDeliveryAreas[1],
  // Ang Mo Kio, Bishan
  // East Singapore (38-42, 50-52)
  "38": mockDeliveryAreas[2],
  // Geylang, Kallang
  "39": mockDeliveryAreas[2],
  // Eunos, Kembangan
  "40": mockDeliveryAreas[2],
  // Katong, Joo Chiat
  "41": mockDeliveryAreas[2],
  // Marine Parade, Siglap
  "42": mockDeliveryAreas[2],
  // Bedok, Upper East Coast
  "50": mockDeliveryAreas[2],
  // Changi, Loyang
  "51": mockDeliveryAreas[2],
  // Tampines, Pasir Ris
  "52": mockDeliveryAreas[2],
  // Pasir Ris, Punggol
  // West Singapore (60-71)
  "60": mockDeliveryAreas[3],
  // Jurong West, Boon Lay
  "61": mockDeliveryAreas[3],
  // Jurong East, Lakeside
  "62": mockDeliveryAreas[3],
  // Jurong Central, Pioneer
  "63": mockDeliveryAreas[3],
  // Tuas, Joo Koon
  "64": mockDeliveryAreas[3],
  // Bukit Batok, Bukit Gombak
  "65": mockDeliveryAreas[3],
  // Choa Chu Kang, Yew Tee
  "66": mockDeliveryAreas[3],
  // Bukit Panjang, Petir
  "67": mockDeliveryAreas[3],
  // Kranji, Sungei Kadut
  "68": mockDeliveryAreas[3],
  // Lim Chu Kang, Tengah
  "69": mockDeliveryAreas[3],
  // Boon Lay, Pioneer
  "70": mockDeliveryAreas[3],
  // Clementi, Dover
  "71": mockDeliveryAreas[3],
  // Jurong Island, Tuas
  // South Singapore (14-16)
  "14": mockDeliveryAreas[4],
  // Kallang, Sports Hub
  "15": mockDeliveryAreas[4],
  // Tanjong Rhu, Mountbatten
  "16": mockDeliveryAreas[4]
  // Buona Vista, HarbourFront
};
function isValidSingaporePostalCode(postalCode) {
  const postalCodeRegex = /^\d{6}$/;
  return postalCodeRegex.test(postalCode);
}
function normalizePostalCode(postalCode) {
  return postalCode.replace(/[^0-9]/g, "").padStart(6, "0");
}
function getPostalCodePrefix(postalCode) {
  return normalizePostalCode(postalCode).substring(0, 2);
}
app.post("/postal-code/validate", async (req, res) => {
  try {
    const { postalCode, shopDomain } = postalCodeValidationSchema.parse(req.body);
    if (!isValidSingaporePostalCode(postalCode)) {
      const response = {
        success: false,
        error: "Invalid postal code format. Please enter a valid Singapore postal code."
      };
      return res.status(400).json(response);
    }
    const normalizedCode = normalizePostalCode(postalCode);
    const prefix = getPostalCodePrefix(normalizedCode);
    const deliveryArea = mockPostalCodeMap[prefix];
    if (deliveryArea) {
      const response = {
        success: true,
        data: {
          postalCode: normalizedCode,
          isValid: true,
          deliveryArea
        }
      };
      return res.json(response);
    } else {
      const suggestions = Object.keys(mockPostalCodeMap).filter((code) => code.startsWith(prefix.substring(0, 2))).slice(0, 3);
      const response = {
        success: true,
        data: {
          postalCode: normalizedCode,
          isValid: false,
          error: "Sorry, we don't deliver to this area yet.",
          suggestions
        }
      };
      return res.json(response);
    }
  } catch (error) {
    console.error("Postal code validation error:", error);
    const response = {
      success: false,
      error: "Internal server error"
    };
    return res.status(500).json(response);
  }
});
app.post("/postal-code/autocomplete", async (req, res) => {
  try {
    const { partialCode, shopDomain, limit } = postalCodeAutoCompleteSchema.parse(req.body);
    const normalizedPartial = normalizePostalCode(partialCode);
    const matchingCodes = Object.keys(mockPostalCodeMap).filter((code) => code.startsWith(normalizedPartial)).slice(0, limit);
    const suggestions = matchingCodes.map((code) => ({
      postalCode: code,
      city: getCityFromPostalCode(code),
      province: getProvinceFromPostalCode(code),
      deliveryArea: mockPostalCodeMap[code]
    }));
    const response = {
      success: true,
      data: { suggestions }
    };
    return res.json(response);
  } catch (error) {
    console.error("Postal code autocomplete error:", error);
    const response = {
      success: false,
      error: "Internal server error"
    };
    return res.status(500).json(response);
  }
});
app.post("/availability", async (req, res) => {
  try {
    const { date, deliveryAreaId, shopDomain } = availabilityRequestSchema.parse(req.body);
    const availability = {
      date,
      available: true,
      availableTimeslots: [
        {
          id: 1,
          start: "10:00",
          end: "14:00",
          availableSlots: 15,
          cutoffTime: "08:00"
        },
        {
          id: 2,
          start: "14:00",
          end: "18:00",
          availableSlots: 8,
          cutoffTime: "12:00"
        }
      ]
    };
    const response = {
      success: true,
      data: availability
    };
    return res.json(response);
  } catch (error) {
    console.error("Availability check error:", error);
    const response = {
      success: false,
      error: "Internal server error"
    };
    return res.status(500).json(response);
  }
});
function getCityFromPostalCode(postalCode) {
  const cityMap = {
    "01": "Marina Bay",
    "02": "Tanjong Pagar",
    "03": "Queenstown",
    "04": "Telok Blangah",
    "05": "Pasir Panjang",
    "06": "Bukit Timah",
    "07": "Orchard",
    "08": "Museum",
    "09": "Woodlands",
    "10": "Sembawang",
    "11": "Yishun",
    "12": "Seletar",
    "13": "Ang Mo Kio",
    "14": "Eunos",
    "15": "Katong",
    "16": "Bedok",
    "17": "Changi",
    "18": "Tampines",
    "19": "Jurong",
    "20": "Bukit Batok",
    "21": "Choa Chu Kang",
    "22": "Kranji",
    "23": "Tengah",
    "24": "Sentosa",
    "25": "Keppel",
    "26": "Bukit Merah",
    "27": "Alexandra",
    "28": "Dover"
  };
  return cityMap[postalCode] || "Unknown";
}
function getProvinceFromPostalCode(postalCode) {
  return "SG";
}
app.get("/text-customisations", async (req, res) => {
  try {
    let data;
    try {
      data = await promises.readFile(TEXT_CUSTOMISATIONS_PATH, "utf-8");
    } catch (err) {
      data = JSON.stringify({
        deliveryType: "Select delivery type...",
        deliveryDate: "Select a date...",
        timeslot: "Select a timeslot...",
        postalCode: "Enter your postal code..."
      });
    }
    res.json({ success: true, data: JSON.parse(data) });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to load text customisations." });
  }
});
app.post("/text-customisations", async (req, res) => {
  try {
    const { deliveryType, deliveryDate, timeslot, postalCode } = req.body;
    const newData = { deliveryType, deliveryDate, timeslot, postalCode };
    await promises.writeFile(TEXT_CUSTOMISATIONS_PATH, JSON.stringify(newData, null, 2), "utf-8");
    res.json({ success: true, data: newData });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to save text customisations." });
  }
});
app.get("/locations", async (req, res) => {
  try {
    let data;
    try {
      data = await promises.readFile(LOCATIONS_PATH, "utf-8");
    } catch (err) {
      data = JSON.stringify({ locations: [] });
    }
    res.json({ success: true, data: JSON.parse(data) });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to load locations." });
  }
});
app.post("/locations", async (req, res) => {
  try {
    const { name, address } = req.body;
    if (!name || !address || !address.address1 || !address.city || !address.zip) {
      return res.status(400).json({
        success: false,
        error: "Name, address1, city, and zip are required."
      });
    }
    let locations = [];
    try {
      const data = await promises.readFile(LOCATIONS_PATH, "utf-8");
      const parsed = JSON.parse(data);
      locations = parsed.locations || [];
    } catch (err) {
    }
    const newLocation = {
      id: Date.now(),
      name,
      address: {
        address1: address.address1,
        address2: address.address2 || "",
        city: address.city,
        province: address.province || "",
        country: address.country || "Singapore",
        zip: address.zip
      },
      isActive: true,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    locations.push(newLocation);
    await promises.writeFile(LOCATIONS_PATH, JSON.stringify({ locations }, null, 2), "utf-8");
    res.json({ success: true, data: newLocation });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to create location." });
  }
});
app.put("/locations/:id", async (req, res) => {
  try {
    const locationId = parseInt(req.params.id);
    const updates = req.body;
    let locations = [];
    try {
      const data = await promises.readFile(LOCATIONS_PATH, "utf-8");
      const parsed = JSON.parse(data);
      locations = parsed.locations || [];
    } catch (err) {
      return res.status(404).json({ success: false, error: "No locations found." });
    }
    const locationIndex = locations.findIndex((loc) => loc.id === locationId);
    if (locationIndex === -1) {
      return res.status(404).json({ success: false, error: "Location not found." });
    }
    const updatedLocation = {
      ...locations[locationIndex],
      ...updates,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    locations[locationIndex] = updatedLocation;
    await promises.writeFile(LOCATIONS_PATH, JSON.stringify({ locations }, null, 2), "utf-8");
    res.json({ success: true, data: updatedLocation });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update location." });
  }
});
app.delete("/locations/:id", async (req, res) => {
  try {
    const locationId = parseInt(req.params.id);
    let locations = [];
    try {
      const data = await promises.readFile(LOCATIONS_PATH, "utf-8");
      const parsed = JSON.parse(data);
      locations = parsed.locations || [];
    } catch (err) {
      return res.status(404).json({ success: false, error: "No locations found." });
    }
    const locationIndex = locations.findIndex((loc) => loc.id === locationId);
    if (locationIndex === -1) {
      return res.status(404).json({ success: false, error: "Location not found." });
    }
    const deletedLocation = locations[locationIndex];
    locations.splice(locationIndex, 1);
    await promises.writeFile(LOCATIONS_PATH, JSON.stringify({ locations }, null, 2), "utf-8");
    res.json({ success: true, data: deletedLocation });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to delete location." });
  }
});
app.get("/express-timeslots", async (req, res) => {
  try {
    const expressTimeslots = [
      { id: 1, start: "10:30", end: "11:30", fee: 25 },
      { id: 2, start: "11:30", end: "12:30", fee: 20 },
      { id: 3, start: "12:30", end: "13:30", fee: 10 },
      { id: 4, start: "13:30", end: "14:30", fee: 0 },
      { id: 5, start: "14:30", end: "15:30", fee: 0 },
      { id: 6, start: "15:30", end: "16:30", fee: 0 },
      { id: 7, start: "16:30", end: "17:30", fee: 0 }
    ];
    res.json({ success: true, data: { expressTimeslots } });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to load express timeslots." });
  }
});
app.post("/shopify/save-delivery-data", async (req, res) => {
  try {
    const { orderId, deliveryData, shopDomain } = req.body;
    if (!orderId || !deliveryData || !shopDomain) {
      return res.status(400).json({
        success: false,
        error: "Order ID, delivery data, and shop domain are required."
      });
    }
    console.log(`Saving delivery data for order ${orderId} in shop ${shopDomain}:`, deliveryData);
    res.json({
      success: true,
      data: {
        orderId,
        deliveryData,
        shopDomain,
        savedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
  } catch (err) {
    console.error("Error saving delivery data:", err);
    res.status(500).json({
      success: false,
      error: "Failed to save delivery data."
    });
  }
});
app.get("/shopify/orders/:orderId/delivery-data", async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);
    const { shopDomain } = req.query;
    if (!shopDomain) {
      return res.status(400).json({
        success: false,
        error: "Shop domain is required."
      });
    }
    const mockDeliveryData = {
      deliveryType: "standard",
      deliveryDate: "2024-06-15",
      timeslot: "14:00-16:00",
      postalCode: "123456"
    };
    res.json({
      success: true,
      data: mockDeliveryData
    });
  } catch (err) {
    console.error("Error fetching delivery data:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch delivery data."
    });
  }
});
app.post("/shopify/webhook/orders/create", async (req, res) => {
  try {
    const order = req.body;
    console.log("Received order creation webhook:", order.order_number);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error processing order webhook:", err);
    res.status(500).json({ success: false });
  }
});
app.get("/api/data/all", async (req, res) => {
  try {
    const allData = await db.exportAllData();
    res.json({ success: true, data: allData });
  } catch (error) {
    console.error("Failed to load all data:", error);
    res.status(500).json({ success: false, error: "Failed to load configuration data" });
  }
});
app.get("/api/delivery-areas", async (req, res) => {
  try {
    const deliveryAreas = await db.getDeliveryAreas();
    res.json({ success: true, data: deliveryAreas });
  } catch (error) {
    console.error("Failed to load delivery areas:", error);
    res.status(500).json({ success: false, error: "Failed to load delivery areas" });
  }
});
app.post("/api/delivery-areas", async (req, res) => {
  try {
    await db.saveDeliveryAreas(req.body);
    res.json({ success: true, message: "Delivery areas saved successfully" });
  } catch (error) {
    console.error("Failed to save delivery areas:", error);
    res.status(500).json({ success: false, error: "Failed to save delivery areas" });
  }
});
app.get("/api/global-timeslots", async (req, res) => {
  try {
    const globalTimeslots = await db.getGlobalTimeslots();
    res.json({ success: true, data: globalTimeslots });
  } catch (error) {
    console.error("Failed to load global timeslots:", error);
    res.status(500).json({ success: false, error: "Failed to load global timeslots" });
  }
});
app.post("/api/global-timeslots", async (req, res) => {
  try {
    await db.saveGlobalTimeslots(req.body);
    res.json({ success: true, message: "Global timeslots saved successfully" });
  } catch (error) {
    console.error("Failed to save global timeslots:", error);
    res.status(500).json({ success: false, error: "Failed to save global timeslots" });
  }
});
app.get("/api/express-timeslots", async (req, res) => {
  try {
    const expressTimeslots = await db.getExpressTimeslots();
    res.json({ success: true, data: { expressTimeslots } });
  } catch (error) {
    console.error("Failed to load express timeslots:", error);
    res.status(500).json({ success: false, error: "Failed to load express timeslots" });
  }
});
app.post("/api/express-timeslots", async (req, res) => {
  try {
    await db.saveExpressTimeslots(req.body);
    res.json({ success: true, message: "Express timeslots saved successfully" });
  } catch (error) {
    console.error("Failed to save express timeslots:", error);
    res.status(500).json({ success: false, error: "Failed to save express timeslots" });
  }
});
app.get("/api/express-timeslot-assignments", async (req, res) => {
  try {
    const assignments = await db.getExpressTimeslotAssignments();
    res.json({ success: true, data: assignments });
  } catch (error) {
    console.error("Failed to load express timeslot assignments:", error);
    res.status(500).json({ success: false, error: "Failed to load express timeslot assignments" });
  }
});
app.post("/api/express-timeslot-assignments", async (req, res) => {
  try {
    await db.saveExpressTimeslotAssignments(req.body);
    res.json({ success: true, message: "Express timeslot assignments saved successfully" });
  } catch (error) {
    console.error("Failed to save express timeslot assignments:", error);
    res.status(500).json({ success: false, error: "Failed to save express timeslot assignments" });
  }
});
app.get("/api/day-assignments", async (req, res) => {
  try {
    const assignments = await db.getDayAssignments();
    res.json({ success: true, data: assignments });
  } catch (error) {
    console.error("Failed to load day assignments:", error);
    res.status(500).json({ success: false, error: "Failed to load day assignments" });
  }
});
app.post("/api/day-assignments", async (req, res) => {
  try {
    await db.saveDayAssignments(req.body);
    res.json({ success: true, message: "Day assignments saved successfully" });
  } catch (error) {
    console.error("Failed to save day assignments:", error);
    res.status(500).json({ success: false, error: "Failed to save day assignments" });
  }
});
app.get("/api/blocked-dates", async (req, res) => {
  try {
    const blockedDates = await db.getBlockedDates();
    res.json({ success: true, data: blockedDates });
  } catch (error) {
    console.error("Failed to load blocked dates:", error);
    res.status(500).json({ success: false, error: "Failed to load blocked dates" });
  }
});
app.post("/api/blocked-dates", async (req, res) => {
  try {
    await db.saveBlockedDates(req.body);
    res.json({ success: true, message: "Blocked dates saved successfully" });
  } catch (error) {
    console.error("Failed to save blocked dates:", error);
    res.status(500).json({ success: false, error: "Failed to save blocked dates" });
  }
});
app.get("/api/blocked-timeslots", async (req, res) => {
  try {
    const blockedTimeslots = await db.getBlockedTimeslots();
    res.json({ success: true, data: blockedTimeslots });
  } catch (error) {
    console.error("Failed to load blocked timeslots:", error);
    res.status(500).json({ success: false, error: "Failed to load blocked timeslots" });
  }
});
app.post("/api/blocked-timeslots", async (req, res) => {
  try {
    await db.saveBlockedTimeslots(req.body);
    res.json({ success: true, message: "Blocked timeslots saved successfully" });
  } catch (error) {
    console.error("Failed to save blocked timeslots:", error);
    res.status(500).json({ success: false, error: "Failed to save blocked timeslots" });
  }
});
app.get("/api/global-advance-rules", async (req, res) => {
  try {
    const rules = await db.getGlobalAdvanceOrderRules();
    res.json({ success: true, data: rules });
  } catch (error) {
    console.error("Failed to load global advance rules:", error);
    res.status(500).json({ success: false, error: "Failed to load global advance rules" });
  }
});
app.post("/api/global-advance-rules", async (req, res) => {
  try {
    await db.saveGlobalAdvanceOrderRules(req.body);
    res.json({ success: true, message: "Global advance rules saved successfully" });
  } catch (error) {
    console.error("Failed to save global advance rules:", error);
    res.status(500).json({ success: false, error: "Failed to save global advance rules" });
  }
});
app.get("/api/product-advance-rules", async (req, res) => {
  try {
    const rules = await db.getProductAdvanceOrderRules();
    res.json({ success: true, data: rules });
  } catch (error) {
    console.error("Failed to load product advance rules:", error);
    res.status(500).json({ success: false, error: "Failed to load product advance rules" });
  }
});
app.post("/api/product-advance-rules", async (req, res) => {
  try {
    await db.saveProductAdvanceOrderRules(req.body);
    res.json({ success: true, message: "Product advance rules saved successfully" });
  } catch (error) {
    console.error("Failed to save product advance rules:", error);
    res.status(500).json({ success: false, error: "Failed to save product advance rules" });
  }
});
app.post("/api/backup/create", async (req, res) => {
  try {
    const backupFile = await db.createBackup();
    res.json({ success: true, message: "Backup created successfully", backupFile });
  } catch (error) {
    console.error("Failed to create backup:", error);
    res.status(500).json({ success: false, error: "Failed to create backup" });
  }
});
app.post("/api/backup/restore", async (req, res) => {
  try {
    const { backupFile } = req.body;
    await db.restoreFromBackup(backupFile);
    res.json({ success: true, message: "Data restored from backup successfully" });
  } catch (error) {
    console.error("Failed to restore from backup:", error);
    res.status(500).json({ success: false, error: "Failed to restore from backup" });
  }
});
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({
    success: false,
    error: "Internal server error"
  });
});
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found"
  });
});
const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV === "production") {
  app.listen(PORT, () => {
    console.log(`🚀 API server running on port ${PORT}`);
  });
}
const viteNodeApp = app;
export {
  viteNodeApp
};
