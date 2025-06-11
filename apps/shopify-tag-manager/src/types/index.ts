// Shopify API Types
export interface ShopifyCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  tags: string;
  total_spent: string;
  orders_count: number;
  last_order_id?: number;
  last_order_date?: string;
  created_at: string;
  updated_at: string;
  note?: string;
  verified_email: boolean;
  accepts_marketing: boolean;
  accepts_marketing_updated_at: string;
  marketing_opt_in_level?: string;
  tax_exempt: boolean;
  tax_exemptions: string[];
  phone?: string;
  last_order_name?: string;
  currency: string;
  addresses: ShopifyAddress[];
  sms_marketing_consent?: {
    state: string;
    opt_in_level: string;
    consent_updated_at: string;
    consent_collected_from: string;
  };
  admin_graphql_api_id: string;
  default_address: ShopifyAddress;
}

export interface ShopifyAddress {
  id: number;
  customer_id: number;
  first_name: string;
  last_name: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone?: string;
  name: string;
  province_code: string;
  country_code: string;
  country_name: string;
  default: boolean;
}

export interface ShopifyOrder {
  id: number;
  order_number: number;
  customer: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  total_price: string;
  created_at: string;
  updated_at: string;
  tags: string;
}

// Tag Management Types
export interface CustomerSegmentRule {
  name: string;
  conditions: SegmentCondition[];
  tags: string[];
  remove_tags: string[];
  enabled: boolean;
  priority: number;
}

export interface SegmentCondition {
  field: CustomerField;
  operator: ComparisonOperator;
  value: string | number | Date;
}

export type CustomerField = 
  | 'total_spent'
  | 'orders_count'
  | 'last_order_date'
  | 'created_at'
  | 'tags'
  | 'email'
  | 'first_name'
  | 'last_name'
  | 'accepts_marketing'
  | 'verified_email';

export type ComparisonOperator = 
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equal'
  | 'less_than_or_equal'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'older_than_days'
  | 'newer_than_days'
  | 'in'
  | 'not_in';

export interface TagOperation {
  customerId: number;
  addTags: string[];
  removeTags: string[];
  reason: string;
  segmentRule?: string;
}

export interface TagSyncResult {
  success: boolean;
  customerId: number;
  operations: TagOperation[];
  errors: string[];
  timestamp: string;
}

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  rules: CustomerSegmentRule[];
  customerCount: number;
  lastUpdated: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Configuration Types
export interface AppConfig {
  shopify: {
    shopDomain: string;
    apiKey: string;
    apiSecret: string;
    accessToken: string;
  };
  app: {
    port: number;
    nodeEnv: string;
    logLevel: string;
  };
  tagManagement: {
    autoTagEnabled: boolean;
    tagSyncInterval: number;
    customerSegmentRules: Record<string, CustomerSegmentRule>;
  };
}

// Webhook Types
export interface ShopifyWebhook {
  id: number;
  address: string;
  topic: string;
  created_at: string;
  updated_at: string;
}

export interface WebhookPayload {
  id: number;
  email: string;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  orders_count: number;
  total_spent: string;
  last_order_id?: number;
  last_order_date?: string;
  tags: string;
  note?: string;
  verified_email: boolean;
  accepts_marketing: boolean;
  accepts_marketing_updated_at: string;
  marketing_opt_in_level?: string;
  tax_exempt: boolean;
  tax_exemptions: string[];
  phone?: string;
  last_order_name?: string;
  currency: string;
  addresses: ShopifyAddress[];
  default_address: ShopifyAddress;
  admin_graphql_api_id: string;
} 