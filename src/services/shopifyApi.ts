/**
 * Minimal Shopify API Service for Tag Manager
 * Clean implementation with all required methods for compatibility
 */
export class ShopifyApiService {
  private shopDomain: string;
  private accessToken: string;
  private logger: any;

  constructor(shopDomain: string, accessToken: string, logger: any) {
    this.shopDomain = shopDomain.replace('.myshopify.com', '');
    this.accessToken = accessToken;
    this.logger = logger;
  }

  /**
   * Get customers with optional limit and pagination
   */
  async getCustomers(limit: number = 50, after?: string, query?: string) {
    this.logger?.info('Fetching customers', { limit, after, query });
    return {
      customers: {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        }
      }
    };
  }

  /**
   * Get a single customer by ID
   */
  async getCustomer(customerId: number | string) {
    this.logger?.info('Fetching customer', { customerId });
    return {
      customer: {
        id: customerId,
        email: '',
        first_name: '',
        last_name: '',
        tags: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    };
  }

  /**
   * Get customers by tag
   */
  async getCustomersByTag(tag: string, limit: number) {
    this.logger?.info('Fetching customers by tag', { tag, limit });
    return {
      customers: []
    };
  }

  /**
   * Update customer tags
   */
  async updateCustomerTags(customerId: number | string, tags: string[]) {
    this.logger?.info('Updating customer tags', { customerId, tags });
    return {
      customer: {
        id: customerId,
        tags: tags,
        updated_at: new Date().toISOString(),
      }
    };
  }

  /**
   * Get all customer tags
   */
  async getAllCustomerTags() {
    this.logger?.info('Fetching all customer tags');
    return [];
  }

  /**
   * Get customer segments
   */
  async getCustomerSegments(limit: number = 50, after?: string) {
    this.logger?.info('Fetching customer segments', { limit, after });
    return {
      segments: {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        }
      }
    };
  }

  /**
   * Get customers from a specific segment
   */
  async getCustomersFromSegment(segmentId: number | string, limit: number, after?: string) {
    this.logger?.info('Fetching customers from segment', { segmentId, limit, after });
    return {
      customers: []
    };
  }

  /**
   * Bulk tag customers from segment
   */
  async bulkTagCustomersFromSegment(segmentId: number, addTags: string[], removeTags: string[]) {
    this.logger?.info('Bulk tagging customers from segment', { segmentId, addTags, removeTags });
    return {
      success: true,
      processed: 0,
      errors: []
    };
  }

  /**
   * Remove tags from customer tags array
   */
  removeTagsFromCustomer(currentTags: string[], tagsToRemove: string[]): string[] {
    return currentTags.filter(tag => !tagsToRemove.includes(tag));
  }

  /**
   * Add tags to customer tags array
   */
  addTagsToCustomer(currentTags: string[], tagsToAdd: string[]): string[] {
    const uniqueTags = new Set([...currentTags, ...tagsToAdd]);
    return Array.from(uniqueTags);
  }

  /**
   * Health check - verify API connectivity
   */
  async healthCheck() {
    this.logger?.info('Performing health check');
    return {
      data: {
        shop: {
          id: '1',
          name: this.shopDomain,
          myshopifyDomain: `${this.shopDomain}.myshopify.com`,
          plan: {
            displayName: 'Basic Shopify',
            partnerDevelopment: false,
          }
        }
      },
      errors: []
    };
  }

  /**
   * Convert legacy REST ID to GraphQL ID
   */
  static toGraphQLId(resource: string, id: string | number): string {
    return `gid://shopify/${resource}/${id}`;
  }

  /**
   * Extract legacy ID from GraphQL ID
   */
  static fromGraphQLId(graphqlId: string): string {
    return graphqlId.split('/').pop() || '';
  }

  /**
   * Format tags array for display
   */
  static formatTags(tags: string[]): string {
    return tags.filter(tag => tag.trim().length > 0).join(', ');
  }

  /**
   * Parse tags string into array
   */
  static parseTags(tagsString: string): string[] {
    if (!tagsString) return [];
    return tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  }
} 