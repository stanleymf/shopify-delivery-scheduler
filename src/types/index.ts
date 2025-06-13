// Shopify API Response Types (2024-10 API Version)
export interface ShopifyApiResponse<T> {
  data?: T;
  errors?: ShopifyApiError[];
  extensions?: {
    cost?: {
      requestedQueryCost: number;
      actualQueryCost: number;
      throttleStatus: {
        maximumAvailable: number;
        currentlyAvailable: number;
        restoreRate: number;
      };
    };
  };
}

export interface ShopifyApiError {
  message: string;
  locations?: Array<{
    line: number;
    column: number;
  }>;
  path?: string[];
  extensions?: {
    code: string;
    exception?: {
      stacktrace: string[];
    };
  };
}

// Customer Types (GraphQL Admin API 2024-10)
export interface ShopifyCustomer {
  id: string; // GraphQL ID (gid://shopify/Customer/123)
  legacyResourceId: string; // REST API ID for backwards compatibility
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  displayName: string;
  phone: string | null;
  tags: string[];
  note: string | null;
  verifiedEmail: boolean;
  acceptsMarketing: boolean;
  acceptsMarketingUpdatedAt: string | null;
  marketingOptInLevel: 'SINGLE_OPT_IN' | 'CONFIRMED_OPT_IN' | 'UNKNOWN' | null;
  emailMarketingConsent: {
    marketingOptInLevel: 'SINGLE_OPT_IN' | 'CONFIRMED_OPT_IN' | 'UNKNOWN' | null;
    marketingState: 'NOT_SUBSCRIBED' | 'PENDING' | 'SUBSCRIBED' | 'UNSUBSCRIBED' | 'REDACTED' | 'INVALID';
    consentUpdatedAt: string | null;
  } | null;
  smsMarketingConsent: {
    marketingOptInLevel: 'SINGLE_OPT_IN' | 'CONFIRMED_OPT_IN' | 'UNKNOWN' | null;
    marketingState: 'NOT_SUBSCRIBED' | 'PENDING' | 'SUBSCRIBED' | 'UNSUBSCRIBED' | 'REDACTED' | 'INVALID';
    consentUpdatedAt: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
  state: 'DISABLED' | 'INVITED' | 'ENABLED' | 'DECLINED';
  locale: string;
  lifetimeDuration: string | null;
  numberOfOrders: string; // GraphQL returns as string
  totalSpent: string; // Money as string
  totalSpentV2: {
    amount: string;
    currencyCode: string;
  };
  averageOrderAmount: {
    amount: string;
    currencyCode: string;
  } | null;
  addresses: ShopifyCustomerAddress[];
  defaultAddress: ShopifyCustomerAddress | null;
  image: {
    url: string;
    altText: string | null;
  } | null;
  lastOrder: {
    id: string;
    name: string;
    createdAt: string;
    totalPrice: {
      amount: string;
      currencyCode: string;
    };
  } | null;
  metafields: {
    edges: Array<{
      node: ShopifyMetafield;
    }>;
  };
}

export interface ShopifyCustomerAddress {
  id: string;
  address1: string | null;
  address2: string | null;
  city: string | null;
  company: string | null;
  country: string | null;
  countryCodeV2: string | null;
  firstName: string | null;
  lastName: string | null;
  latitude: number | null;
  longitude: number | null;
  name: string | null;
  phone: string | null;
  province: string | null;
  provinceCode: string | null;
  zip: string | null;
  formatted: string[];
  formattedArea: string | null;
}

export interface ShopifyMetafield {
  id: string;
  namespace: string;
  key: string;
  value: string;
  type: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

// Customer Segment Types (GraphQL Admin API 2024-10)
export interface ShopifyCustomerSegment {
  id: string; // GraphQL ID
  name: string;
  query: string;
  createdAt: string;
  updatedAt: string;
  customersCount: {
    count: string; // GraphQL returns as string
    precision: 'EXACT' | 'ESTIMATED';
  };
  isMembershipStatic: boolean;
}

export interface CustomerSegmentMembership {
  customer: ShopifyCustomer;
  joinedAt: string;
  leftAt: string | null;
}

// Order Types (GraphQL Admin API 2024-10)
export interface ShopifyOrder {
  id: string;
  legacyResourceId: string;
  name: string;
  email: string | null;
  createdAt: string;
  updatedAt: string;
  processedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  financialStatus: 'AUTHORIZED' | 'PAID' | 'PARTIALLY_PAID' | 'PENDING' | 'PARTIALLY_REFUNDED' | 'REFUNDED' | 'VOIDED' | null;
  fulfillmentStatus: 'FULFILLED' | 'NULL' | 'PARTIAL' | 'RESTOCKED' | 'UNFULFILLED';
  totalPrice: {
    amount: string;
    currencyCode: string;
  };
  subtotalPrice: {
    amount: string;
    currencyCode: string;
  };
  totalTax: {
    amount: string;
    currencyCode: string;
  };
  totalShipping: {
    amount: string;
    currencyCode: string;
  };
  customer: ShopifyCustomer | null;
  tags: string[];
  note: string | null;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  test: boolean;
}

// Application Types
export interface TaggingRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  conditions: TaggingCondition[];
  actions: TaggingAction[];
  createdAt: string;
  updatedAt: string;
  lastExecutedAt: string | null;
  executionCount: number;
}

export interface TaggingCondition {
  id: string;
  field: CustomerField | OrderField | string;
  operator: ComparisonOperator;
  value: string | number | boolean | string[];
  caseSensitive?: boolean;
}

export interface TaggingAction {
  type: 'ADD_TAGS' | 'REMOVE_TAGS' | 'SET_TAGS';
  tags: string[];
}

export type CustomerField = 
  | 'email'
  | 'firstName'
  | 'lastName'
  | 'phone'
  | 'tags'
  | 'numberOfOrders'
  | 'totalSpent'
  | 'acceptsMarketing'
  | 'verifiedEmail'
  | 'createdAt'
  | 'updatedAt'
  | 'state'
  | 'locale'
  | 'lifetimeDuration'
  | 'averageOrderAmount'
  | 'lastOrderDate'
  | 'country'
  | 'province'
  | 'city';

export type OrderField = 
  | 'totalPrice'
  | 'subtotalPrice'
  | 'totalTax'
  | 'financialStatus'
  | 'fulfillmentStatus'
  | 'createdAt'
  | 'processedAt'
  | 'tags'
  | 'riskLevel'
  | 'test';

export type ComparisonOperator = 
  | 'EQUALS'
  | 'NOT_EQUALS'
  | 'GREATER_THAN'
  | 'LESS_THAN'
  | 'GREATER_THAN_OR_EQUAL'
  | 'LESS_THAN_OR_EQUAL'
  | 'CONTAINS'
  | 'NOT_CONTAINS'
  | 'STARTS_WITH'
  | 'ENDS_WITH'
  | 'IN'
  | 'NOT_IN'
  | 'IS_EMPTY'
  | 'IS_NOT_EMPTY'
  | 'REGEX_MATCH'
  | 'DAYS_AGO'
  | 'DAYS_FROM_NOW';

// Execution Results
export interface TaggingExecution {
  id: string;
  ruleId: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  startedAt: string;
  completedAt: string | null;
  customersProcessed: number;
  customersModified: number;
  errors: TaggingError[];
  summary: {
    tagsAdded: Record<string, number>;
    tagsRemoved: Record<string, number>;
    customersAffected: number;
  };
}

export interface TaggingError {
  customerId: string;
  message: string;
  code: string;
  timestamp: string;
}

// Configuration Types
export interface AppConfig {
  shopify: {
    shopDomain: string;
    accessToken: string;
    apiVersion: string;
    webhookSecret: string;
  };
  app: {
    port: number;
    environment: 'development' | 'production' | 'staging';
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    maxConcurrentJobs: number;
    rateLimitWindow: number;
    rateLimitRequests: number;
  };
  sync: {
    enabled: boolean;
    intervalMinutes: number;
    batchSize: number;
    maxRetries: number;
    retryDelayMs: number;
  };
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
  timestamp: string;
  requestId?: string;
}

// Pagination
export interface PaginationInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationInfo;
  totalCount?: number;
} 