// Core Types
export type Timeslot = {
  id: number;
  start: string;
  end: string;
  type?: "delivery" | "collection" | "both";
  cutoff?: { daysBefore: number; time: string };
  quota?: number;
};

// Shopify API Types
export type ShopifyProduct = {
  id: number;
  title: string;
  handle: string;
  status: string;
  vendor: string;
  product_type: string;
  tags: string[];
  variants: ShopifyVariant[];
  collections: ShopifyCollection[];
  images: ShopifyImage[];
  created_at: string;
  updated_at: string;
};

export type ShopifyVariant = {
  id: number;
  product_id: number;
  title: string;
  sku: string;
  price: string;
  compare_at_price: string;
  inventory_quantity: number;
  inventory_management: string;
  inventory_policy: string;
  weight: number;
  weight_unit: string;
  requires_shipping: boolean;
  taxable: boolean;
  barcode: string;
  grams: number;
  option1?: string;
  option2?: string;
  option3?: string;
};

export type ShopifyCollection = {
  id: number;
  title: string;
  handle: string;
  description: string;
  published_at: string;
  updated_at: string;
  products_count: number;
};

export type ShopifyImage = {
  id: number;
  product_id: number;
  position: number;
  src: string;
  width: number;
  height: number;
  alt: string;
};

// Local Product Type (extends Shopify data with availability windows)
export type Product = {
  shopifyId: number; // Shopify product/collection ID
  shopifyType: "product" | "collection";
  name: string;
  handle: string;
  status: string;
  variants?: ShopifyVariant[]; // Only for products
  parentCollection?: number; // For products that belong to collections
  availabilityWindows: {
    id: number;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    isActive: boolean;
  }[];
  lastSynced: string; // ISO timestamp
};

// Delivery Area Types
export type DeliveryArea = {
  id: number;
  name: string;
  postalCodes: string[];
  deliveryFee: number;
  minimumOrder: number;
  isActive: boolean;
};

// Cart Integration Types
export type CartItem = {
  id: number;
  productId: number;
  variantId: number;
  quantity: number;
  title: string;
  variantTitle: string;
  price: number;
  sku: string;
};

export type DeliveryRequest = {
  date: string; // YYYY-MM-DD
  timeslotId: number;
  deliveryAreaId: number;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: {
      address1: string;
      address2?: string;
      city: string;
      province: string;
      postalCode: string;
      country: string;
    };
  };
  cartItems: CartItem[];
  specialInstructions?: string;
  totalAmount: number;
  deliveryFee: number;
};

export type AvailabilityResponse = {
  date: string;
  available: boolean;
  reason?: string;
  availableTimeslots: {
    id: number;
    start: string;
    end: string;
    availableSlots: number;
    cutoffTime: string;
  }[];
};

export type DeliveryAreaResponse = {
  id: number;
  name: string;
  deliveryFee: number;
  minimumOrder: number;
  estimatedDeliveryTime: string;
};

// API Response Types
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// Configuration Types
export type WidgetConfig = {
  apiUrl: string;
  shopDomain: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  currency: string;
  timezone: string;
  showProductAvailability: boolean;
  allowExpressDelivery: boolean;
  maxFutureDays: number;
  // Postal Code Features
  enablePostalCodeValidation: boolean;
  enablePostalCodeAutoComplete: boolean;
  postalCodeAutoCompleteDelay: number; // milliseconds
  showPostalCodeSuggestions: boolean;
  maxPostalCodeSuggestions: number;
};

// Event Types for Widget Communication
export type WidgetEvent = 
  | { type: 'DELIVERY_DATE_SELECTED'; payload: { date: string; timeslotId: number } }
  | { type: 'DELIVERY_AREA_SELECTED'; payload: { areaId: number; deliveryFee: number } }
  | { type: 'AVAILABILITY_CHECKED'; payload: { date: string; available: boolean } }
  | { type: 'POSTAL_CODE_VALIDATED'; payload: { postalCode: string; isValid: boolean; area?: DeliveryAreaResponse } }
  | { type: 'ERROR'; payload: { message: string; code?: string } };

// Postal Code Validation Types
export type PostalCodeValidationRequest = {
  postalCode: string;
  shopDomain: string;
};

export type PostalCodeValidationResponse = {
  postalCode: string;
  isValid: boolean;
  deliveryArea?: DeliveryAreaResponse;
  error?: string;
  suggestions?: string[]; // For similar postal codes
};

export type PostalCodeAutoCompleteRequest = {
  partialCode: string;
  shopDomain: string;
  limit?: number;
};

export type PostalCodeAutoCompleteResponse = {
  suggestions: Array<{
    postalCode: string;
    city: string;
    province: string;
    deliveryArea?: DeliveryAreaResponse;
  }>;
}; 