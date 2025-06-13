import { promises as fs } from 'fs';
import path from 'path';

// Database file paths
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILES = {
  deliveryAreas: path.join(DATA_DIR, 'deliveryAreas.json'),
  globalTimeslots: path.join(DATA_DIR, 'globalTimeslots.json'),
  expressTimeslots: path.join(DATA_DIR, 'expressTimeslots.json'),
  expressTimeslotAssignments: path.join(DATA_DIR, 'expressTimeslotAssignments.json'),
  dayAssignments: path.join(DATA_DIR, 'dayAssignments.json'),
  blockedDates: path.join(DATA_DIR, 'blockedDates.json'),
  blockedTimeslots: path.join(DATA_DIR, 'blockedTimeslots.json'),
  globalAdvanceOrderRules: path.join(DATA_DIR, 'globalAdvanceOrderRules.json'),
  productAdvanceOrderRules: path.join(DATA_DIR, 'productAdvanceOrderRules.json'),
  locations: path.join(DATA_DIR, 'locations.json'),
  textCustomizations: path.join(DATA_DIR, 'textCustomizations.json'),
  settings: path.join(DATA_DIR, 'settings.json')
};

// Type definitions
export interface DeliveryArea {
  id: number;
  name: string;
  deliveryFee: number;
  minimumOrder: number;
  estimatedDeliveryTime: string;
}

export interface GlobalTimeslot {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  maxSlots: number;
  deliveryType: 'delivery' | 'express' | 'collection';
  cutoffTime: string;
  cutoffType: 'same-day' | 'next-day';
  isActive: boolean;
  createdAt: string;
}

export interface ExpressTimeslot {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  fee: number;
  maxSlots: number;
  isActive: boolean;
  cutoffMinutes: number;
  dayOfWeek: number;
  createdAt: string;
}

export interface ExpressTimeslotAssignment {
  id: number;
  dayOfWeek: number;
  expressTimeslotId: number;
  isActive: boolean;
  createdAt: string;
}

export interface DayTimeslotAssignment {
  id: number;
  dayOfWeek: number;
  globalTimeslotId: number;
  isActive: boolean;
  createdAt: string;
}

export interface BlockedDate {
  id: number;
  date: string;
  isRange: boolean;
  endDate?: string;
  title: string;
  createdAt: string;
}

export interface BlockedTimeslot {
  id: number;
  date: string;
  globalTimeslotId: number;
  blockType: 'complete' | 'quota-override';
  customQuota?: number;
  title: string;
  createdAt: string;
}

export interface GlobalAdvanceOrderRule {
  id: number;
  name: string;
  globalAdvanceDays: number;
  description: string;
  isActive: boolean;
  createdAt: string;
  appliesTo: 'all' | 'delivery' | 'collection' | 'express';
}

export interface ProductAdvanceOrderRule {
  id: number;
  productName: string;
  collectionName?: string;
  ruleType: 'product' | 'collection';
  leadTimeDays: number;
  orderStartDate: string;
  orderEndDate: string;
  deliveryStartDate?: string;
  deliveryEndDate?: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  priority: number;
}

export interface Location {
  id: number;
  name: string;
  address: {
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    zip: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TextCustomizations {
  deliveryType: string;
  deliveryDate: string;
  timeslot: string;
  postalCode: string;
}

export interface AppSettings {
  version: string;
  lastUpdated: string;
  migrationVersion: number;
}

// Database class
export class Database {
  constructor() {
    this.initializeDataDirectory();
  }

  private async initializeDataDirectory() {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      console.log('Data directory initialized:', DATA_DIR);
    } catch (error) {
      console.error('Failed to create data directory:', error);
    }
  }

  // Generic methods
  private async readFile<T>(filePath: string, defaultValue: T): Promise<T> {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // File doesn't exist, return default and create it
      await this.writeFile(filePath, defaultValue);
      return defaultValue;
    }
  }

  private async writeFile<T>(filePath: string, data: T): Promise<void> {
    try {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error(`Failed to write to ${filePath}:`, error);
      throw error;
    }
  }

  // Delivery Areas
  async getDeliveryAreas(): Promise<DeliveryArea[]> {
    return this.readFile(DB_FILES.deliveryAreas, [
      { id: 1, name: 'Central Singapore', deliveryFee: 0, minimumOrder: 50, estimatedDeliveryTime: '1-2 business days' },
      { id: 2, name: 'North Singapore', deliveryFee: 0, minimumOrder: 50, estimatedDeliveryTime: '1-2 business days' },
      { id: 3, name: 'East Singapore', deliveryFee: 0, minimumOrder: 50, estimatedDeliveryTime: '1-2 business days' },
      { id: 4, name: 'West Singapore', deliveryFee: 0, minimumOrder: 50, estimatedDeliveryTime: '1-2 business days' },
      { id: 5, name: 'South Singapore', deliveryFee: 0, minimumOrder: 50, estimatedDeliveryTime: '1-2 business days' }
    ]);
  }

  async saveDeliveryAreas(areas: DeliveryArea[]): Promise<void> {
    await this.writeFile(DB_FILES.deliveryAreas, areas);
  }

  // Global Timeslots
  async getGlobalTimeslots(): Promise<GlobalTimeslot[]> {
    return this.readFile(DB_FILES.globalTimeslots, [
      { id: 1, name: 'Morning Delivery', startTime: '09:00', endTime: '12:00', maxSlots: 10, deliveryType: 'delivery', cutoffTime: '08:00', cutoffType: 'same-day', isActive: true, createdAt: new Date().toISOString() },
      { id: 2, name: 'Afternoon Delivery', startTime: '13:00', endTime: '17:00', maxSlots: 8, deliveryType: 'delivery', cutoffTime: '12:00', cutoffType: 'same-day', isActive: true, createdAt: new Date().toISOString() },
      { id: 3, name: 'Evening Collection', startTime: '18:00', endTime: '20:00', maxSlots: 5, deliveryType: 'collection', cutoffTime: '17:00', cutoffType: 'same-day', isActive: true, createdAt: new Date().toISOString() }
    ]);
  }

  async saveGlobalTimeslots(timeslots: GlobalTimeslot[]): Promise<void> {
    await this.writeFile(DB_FILES.globalTimeslots, timeslots);
  }

  // Express Timeslots
  async getExpressTimeslots(): Promise<ExpressTimeslot[]> {
    return this.readFile(DB_FILES.expressTimeslots, [
      { id: 1, name: 'Express Morning', startTime: '10:00', endTime: '12:00', fee: 15.00, maxSlots: 3, isActive: true, cutoffMinutes: 60, dayOfWeek: 1, createdAt: new Date().toISOString() },
      { id: 2, name: 'Express Afternoon', startTime: '14:00', endTime: '16:00', fee: 18.00, maxSlots: 3, isActive: true, cutoffMinutes: 90, dayOfWeek: 1, createdAt: new Date().toISOString() },
      { id: 3, name: 'Express Friday', startTime: '15:00', endTime: '17:00', fee: 20.00, maxSlots: 2, isActive: true, cutoffMinutes: 120, dayOfWeek: 5, createdAt: new Date().toISOString() }
    ]);
  }

  async saveExpressTimeslots(timeslots: ExpressTimeslot[]): Promise<void> {
    await this.writeFile(DB_FILES.expressTimeslots, timeslots);
  }

  // Express Timeslot Assignments
  async getExpressTimeslotAssignments(): Promise<ExpressTimeslotAssignment[]> {
    return this.readFile(DB_FILES.expressTimeslotAssignments, []);
  }

  async saveExpressTimeslotAssignments(assignments: ExpressTimeslotAssignment[]): Promise<void> {
    await this.writeFile(DB_FILES.expressTimeslotAssignments, assignments);
  }

  // Day Assignments
  async getDayAssignments(): Promise<DayTimeslotAssignment[]> {
    return this.readFile(DB_FILES.dayAssignments, []);
  }

  async saveDayAssignments(assignments: DayTimeslotAssignment[]): Promise<void> {
    await this.writeFile(DB_FILES.dayAssignments, assignments);
  }

  // Blocked Dates
  async getBlockedDates(): Promise<BlockedDate[]> {
    return this.readFile(DB_FILES.blockedDates, []);
  }

  async saveBlockedDates(blockedDates: BlockedDate[]): Promise<void> {
    await this.writeFile(DB_FILES.blockedDates, blockedDates);
  }

  // Blocked Timeslots
  async getBlockedTimeslots(): Promise<BlockedTimeslot[]> {
    return this.readFile(DB_FILES.blockedTimeslots, []);
  }

  async saveBlockedTimeslots(blockedTimeslots: BlockedTimeslot[]): Promise<void> {
    await this.writeFile(DB_FILES.blockedTimeslots, blockedTimeslots);
  }

  // Global Advance Order Rules
  async getGlobalAdvanceOrderRules(): Promise<GlobalAdvanceOrderRule[]> {
    return this.readFile(DB_FILES.globalAdvanceOrderRules, []);
  }

  async saveGlobalAdvanceOrderRules(rules: GlobalAdvanceOrderRule[]): Promise<void> {
    await this.writeFile(DB_FILES.globalAdvanceOrderRules, rules);
  }

  // Product Advance Order Rules
  async getProductAdvanceOrderRules(): Promise<ProductAdvanceOrderRule[]> {
    return this.readFile(DB_FILES.productAdvanceOrderRules, []);
  }

  async saveProductAdvanceOrderRules(rules: ProductAdvanceOrderRule[]): Promise<void> {
    await this.writeFile(DB_FILES.productAdvanceOrderRules, rules);
  }

  // Locations
  async getLocations(): Promise<Location[]> {
    return this.readFile(DB_FILES.locations, []);
  }

  async saveLocations(locations: Location[]): Promise<void> {
    await this.writeFile(DB_FILES.locations, locations);
  }

  // Text Customizations
  async getTextCustomizations(): Promise<TextCustomizations> {
    return this.readFile(DB_FILES.textCustomizations, {
      deliveryType: 'Delivery Type',
      deliveryDate: 'Delivery Date',
      timeslot: 'Time Slot',
      postalCode: 'Postal Code'
    });
  }

  async saveTextCustomizations(customizations: TextCustomizations): Promise<void> {
    await this.writeFile(DB_FILES.textCustomizations, customizations);
  }

  // Settings
  async getSettings(): Promise<AppSettings> {
    return this.readFile(DB_FILES.settings, {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      migrationVersion: 1
    });
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    await this.writeFile(DB_FILES.settings, settings);
  }

  // Backup and restore
  async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(DATA_DIR, 'backups');
    await fs.mkdir(backupDir, { recursive: true });
    
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

  async restoreFromBackup(backupFile: string): Promise<void> {
    const backup = await this.readFile<any>(backupFile, null);
    if (!backup || !backup.data) {
      throw new Error('Invalid backup file');
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
      this.saveSettings({ ...data.settings, lastUpdated: new Date().toISOString() })
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

// Create singleton instance
export const db = new Database(); 