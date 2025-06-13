import { useEffect, useCallback, useRef } from 'react';

// API URL from environment variable or default to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Type definitions matching the backend
interface DeliveryArea {
  id: number;
  name: string;
  deliveryFee: number;
  minimumOrder: number;
  estimatedDeliveryTime: string;
}

interface GlobalTimeslot {
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

interface ExpressTimeslot {
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

interface ExpressTimeslotAssignment {
  id: number;
  dayOfWeek: number;
  expressTimeslotId: number;
  isActive: boolean;
  createdAt: string;
}

interface DayTimeslotAssignment {
  id: number;
  dayOfWeek: number;
  globalTimeslotId: number;
  isActive: boolean;
  createdAt: string;
}

interface BlockedDate {
  id: number;
  date: string;
  isRange: boolean;
  endDate?: string;
  title: string;
  createdAt: string;
}

interface BlockedTimeslot {
  id: number;
  date: string;
  globalTimeslotId: number;
  blockType: 'complete' | 'quota-override';
  customQuota?: number;
  title: string;
  createdAt: string;
}

interface GlobalAdvanceOrderRule {
  id: number;
  name: string;
  globalAdvanceDays: number;
  description: string;
  isActive: boolean;
  createdAt: string;
  appliesTo: 'all' | 'delivery' | 'collection' | 'express';
}

interface ProductAdvanceOrderRule {
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

interface Location {
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

interface DataPersistenceProps {
  deliveryAreas: DeliveryArea[];
  setDeliveryAreas: (areas: DeliveryArea[]) => void;
  
  globalTimeslots: GlobalTimeslot[];
  setGlobalTimeslots: (timeslots: GlobalTimeslot[]) => void;
  
  expressTimeslots: ExpressTimeslot[];
  setExpressTimeslots: (timeslots: ExpressTimeslot[]) => void;
  
  expressTimeslotAssignments: ExpressTimeslotAssignment[];
  setExpressTimeslotAssignments: (assignments: ExpressTimeslotAssignment[]) => void;
  
  dayAssignments: DayTimeslotAssignment[];
  setDayAssignments: (assignments: DayTimeslotAssignment[]) => void;
  
  blockedDates: BlockedDate[];
  setBlockedDates: (dates: BlockedDate[]) => void;
  
  blockedTimeslots: BlockedTimeslot[];
  setBlockedTimeslots: (timeslots: BlockedTimeslot[]) => void;
  
  globalAdvanceOrderRules: GlobalAdvanceOrderRule[];
  setGlobalAdvanceOrderRules: (rules: GlobalAdvanceOrderRule[]) => void;
  
  productAdvanceOrderRules: ProductAdvanceOrderRule[];
  setProductAdvanceOrderRules: (rules: ProductAdvanceOrderRule[]) => void;
  
  locations: Location[];
  setLocations: (locations: Location[]) => void;
}

export const useDataPersistence = (props: DataPersistenceProps) => {
  const {
    deliveryAreas, setDeliveryAreas,
    globalTimeslots, setGlobalTimeslots,
    expressTimeslots, setExpressTimeslots,
    expressTimeslotAssignments, setExpressTimeslotAssignments,
    dayAssignments, setDayAssignments,
    blockedDates, setBlockedDates,
    blockedTimeslots, setBlockedTimeslots,
    globalAdvanceOrderRules, setGlobalAdvanceOrderRules,
    productAdvanceOrderRules, setProductAdvanceOrderRules,
    locations, setLocations
  } = props;

  // Track whether initial data has been loaded to prevent saving empty arrays
  const isInitialLoadComplete = useRef(false);

  // Helper function to make API calls
  const apiCall = useCallback(async (endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API call to ${endpoint} failed:`, error);
      throw error;
    }
  }, []);

  // Load all data on component mount
  const loadAllData = useCallback(async () => {
    try {
      const response = await apiCall('/api/data/all');
      if (response.success && response.data) {
        const data = response.data;
        
        // Update all state with loaded data, ensuring arrays are always arrays
        if (Array.isArray(data.deliveryAreas)) setDeliveryAreas(data.deliveryAreas);
        if (Array.isArray(data.globalTimeslots)) setGlobalTimeslots(data.globalTimeslots);
        if (Array.isArray(data.expressTimeslots)) setExpressTimeslots(data.expressTimeslots);
        if (Array.isArray(data.expressTimeslotAssignments)) setExpressTimeslotAssignments(data.expressTimeslotAssignments);
        if (Array.isArray(data.dayAssignments)) setDayAssignments(data.dayAssignments);
        if (Array.isArray(data.blockedDates)) setBlockedDates(data.blockedDates);
        if (Array.isArray(data.blockedTimeslots)) setBlockedTimeslots(data.blockedTimeslots);
        if (Array.isArray(data.globalAdvanceOrderRules)) setGlobalAdvanceOrderRules(data.globalAdvanceOrderRules);
        if (Array.isArray(data.productAdvanceOrderRules)) setProductAdvanceOrderRules(data.productAdvanceOrderRules);
        if (Array.isArray(data.locations)) setLocations(data.locations);
        
        console.log('✅ All configuration data loaded from server');
        // Mark initial load as complete to enable auto-save
        isInitialLoadComplete.current = true;
      }
    } catch (error) {
      console.error('❌ Failed to load configuration data:', error);
      // Even if loading fails, mark as complete to enable manual saves
      isInitialLoadComplete.current = true;
    }
  }, [
    setDeliveryAreas, setGlobalTimeslots, setExpressTimeslots, setExpressTimeslotAssignments,
    setDayAssignments, setBlockedDates, setBlockedTimeslots, setGlobalAdvanceOrderRules,
    setProductAdvanceOrderRules, setLocations, apiCall
  ]);

  // Save individual data types
  const saveDeliveryAreas = useCallback(async (areas: DeliveryArea[]) => {
    try {
      await apiCall('/api/delivery-areas', 'POST', areas);
      console.log('✅ Delivery areas saved');
    } catch (error) {
      console.error('❌ Failed to save delivery areas:', error);
    }
  }, [apiCall]);

  const saveGlobalTimeslots = useCallback(async (timeslots: GlobalTimeslot[]) => {
    try {
      await apiCall('/api/global-timeslots', 'POST', timeslots);
      console.log('✅ Global timeslots saved');
    } catch (error) {
      console.error('❌ Failed to save global timeslots:', error);
    }
  }, [apiCall]);

  const saveExpressTimeslots = useCallback(async (timeslots: ExpressTimeslot[]) => {
    try {
      await apiCall('/api/express-timeslots', 'POST', timeslots);
      console.log('✅ Express timeslots saved');
    } catch (error) {
      console.error('❌ Failed to save express timeslots:', error);
    }
  }, [apiCall]);

  const saveExpressTimeslotAssignments = useCallback(async (assignments: ExpressTimeslotAssignment[]) => {
    try {
      await apiCall('/api/express-timeslot-assignments', 'POST', assignments);
      console.log('✅ Express timeslot assignments saved');
    } catch (error) {
      console.error('❌ Failed to save express timeslot assignments:', error);
    }
  }, [apiCall]);

  const saveDayAssignments = useCallback(async (assignments: DayTimeslotAssignment[]) => {
    try {
      await apiCall('/api/day-assignments', 'POST', assignments);
      console.log('✅ Day assignments saved');
    } catch (error) {
      console.error('❌ Failed to save day assignments:', error);
    }
  }, [apiCall]);

  const saveBlockedDates = useCallback(async (dates: BlockedDate[]) => {
    try {
      await apiCall('/api/blocked-dates', 'POST', dates);
      console.log('✅ Blocked dates saved');
    } catch (error) {
      console.error('❌ Failed to save blocked dates:', error);
    }
  }, [apiCall]);

  const saveBlockedTimeslots = useCallback(async (timeslots: BlockedTimeslot[]) => {
    try {
      await apiCall('/api/blocked-timeslots', 'POST', timeslots);
      console.log('✅ Blocked timeslots saved');
    } catch (error) {
      console.error('❌ Failed to save blocked timeslots:', error);
    }
  }, [apiCall]);

  const saveGlobalAdvanceOrderRules = useCallback(async (rules: GlobalAdvanceOrderRule[]) => {
    try {
      await apiCall('/api/global-advance-rules', 'POST', rules);
      console.log('✅ Global advance order rules saved');
    } catch (error) {
      console.error('❌ Failed to save global advance order rules:', error);
    }
  }, [apiCall]);

  const saveProductAdvanceOrderRules = useCallback(async (rules: ProductAdvanceOrderRule[]) => {
    try {
      await apiCall('/api/product-advance-rules', 'POST', rules);
      console.log('✅ Product advance order rules saved');
    } catch (error) {
      console.error('❌ Failed to save product advance order rules:', error);
    }
  }, [apiCall]);

  const saveLocations = useCallback(async (locations: Location[]) => {
    try {
      await apiCall('/locations', 'POST', { locations });
      console.log('✅ Locations saved');
    } catch (error) {
      console.error('❌ Failed to save locations:', error);
    }
  }, [apiCall]);

  // Backup and restore functions
  const createBackup = useCallback(async () => {
    try {
      const response = await apiCall('/api/backup/create', 'POST');
      if (response.success) {
        console.log('✅ Backup created:', response.backupFile);
        return response.backupFile;
      }
    } catch (error) {
      console.error('❌ Failed to create backup:', error);
      throw error;
    }
  }, [apiCall]);

  const restoreFromBackup = useCallback(async (backupFile: string) => {
    try {
      await apiCall('/api/backup/restore', 'POST', { backupFile });
      // Reload all data after restore
      await loadAllData();
      console.log('✅ Data restored from backup');
    } catch (error) {
      console.error('❌ Failed to restore from backup:', error);
      throw error;
    }
  }, [apiCall, loadAllData]);

  // Auto-save effects - save data whenever it changes (but only after initial load)
  useEffect(() => {
    if (isInitialLoadComplete.current && deliveryAreas.length > 0) {
      saveDeliveryAreas(deliveryAreas);
    }
  }, [deliveryAreas, saveDeliveryAreas]);

  useEffect(() => {
    if (isInitialLoadComplete.current && globalTimeslots.length > 0) {
      saveGlobalTimeslots(globalTimeslots);
    }
  }, [globalTimeslots, saveGlobalTimeslots]);

  useEffect(() => {
    if (isInitialLoadComplete.current && expressTimeslots.length > 0) {
      saveExpressTimeslots(expressTimeslots);
    }
  }, [expressTimeslots, saveExpressTimeslots]);

  useEffect(() => {
    if (isInitialLoadComplete.current) {
      saveExpressTimeslotAssignments(expressTimeslotAssignments);
    }
  }, [expressTimeslotAssignments, saveExpressTimeslotAssignments]);

  useEffect(() => {
    if (isInitialLoadComplete.current) {
      saveDayAssignments(dayAssignments);
    }
  }, [dayAssignments, saveDayAssignments]);

  useEffect(() => {
    if (isInitialLoadComplete.current) {
      saveBlockedDates(blockedDates);
    }
  }, [blockedDates, saveBlockedDates]);

  useEffect(() => {
    if (isInitialLoadComplete.current) {
      saveBlockedTimeslots(blockedTimeslots);
    }
  }, [blockedTimeslots, saveBlockedTimeslots]);

  useEffect(() => {
    if (isInitialLoadComplete.current) {
      saveGlobalAdvanceOrderRules(globalAdvanceOrderRules);
    }
  }, [globalAdvanceOrderRules, saveGlobalAdvanceOrderRules]);

  useEffect(() => {
    if (isInitialLoadComplete.current) {
      saveProductAdvanceOrderRules(productAdvanceOrderRules);
    }
  }, [productAdvanceOrderRules, saveProductAdvanceOrderRules]);

  useEffect(() => {
    if (isInitialLoadComplete.current) {
      saveLocations(locations);
    }
  }, [locations, saveLocations]);

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Return utility functions for manual operations
  return {
    loadAllData,
    createBackup,
    restoreFromBackup,
    saveAll: async () => {
      await Promise.all([
        saveDeliveryAreas(deliveryAreas),
        saveGlobalTimeslots(globalTimeslots),
        saveExpressTimeslots(expressTimeslots),
        saveExpressTimeslotAssignments(expressTimeslotAssignments),
        saveDayAssignments(dayAssignments),
        saveBlockedDates(blockedDates),
        saveBlockedTimeslots(blockedTimeslots),
        saveGlobalAdvanceOrderRules(globalAdvanceOrderRules),
        saveProductAdvanceOrderRules(productAdvanceOrderRules),
        saveLocations(locations),
      ]);
      console.log('✅ All data saved successfully');
    }
  };
}; 