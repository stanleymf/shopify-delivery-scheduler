import { ShopifyCustomer, ShopifyOrder, ShopifyWebhook, WebhookPayload } from '../types/index.js';

export class ShopifyApiService {
  private shopDomain: string;
  private accessToken: string;
  private apiVersion: string = '2024-01';

  constructor(shopDomain: string, accessToken: string) {
    this.shopDomain = shopDomain;
    this.accessToken = accessToken;
  }

  private getApiUrl(endpoint: string): string {
    return `https://${this.shopDomain}/admin/api/${this.apiVersion}/${endpoint}`;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = this.getApiUrl(endpoint);
    
    const defaultOptions: RequestInit = {
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Shopify API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  // Customer Management
  async getCustomers(limit: number = 50, page: number = 1): Promise<{ customers: ShopifyCustomer[] }> {
    const endpoint = `customers.json?limit=${limit}&page=${page}`;
    return this.makeRequest<{ customers: ShopifyCustomer[] }>(endpoint);
  }

  async getCustomer(customerId: number): Promise<{ customer: ShopifyCustomer }> {
    const endpoint = `customers/${customerId}.json`;
    return this.makeRequest<{ customer: ShopifyCustomer }>(endpoint);
  }

  async updateCustomerTags(customerId: number, tags: string): Promise<{ customer: ShopifyCustomer }> {
    const endpoint = `customers/${customerId}.json`;
    const body = {
      customer: {
        id: customerId,
        tags: tags
      }
    };

    return this.makeRequest<{ customer: ShopifyCustomer }>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  async searchCustomers(query: string, limit: number = 50): Promise<{ customers: ShopifyCustomer[] }> {
    const endpoint = `customers/search.json?query=${encodeURIComponent(query)}&limit=${limit}`;
    return this.makeRequest<{ customers: ShopifyCustomer[] }>(endpoint);
  }

  // Order Management
  async getCustomerOrders(customerId: number, limit: number = 50): Promise<{ orders: ShopifyOrder[] }> {
    const endpoint = `customers/${customerId}/orders.json?limit=${limit}&status=any`;
    return this.makeRequest<{ orders: ShopifyOrder[] }>(endpoint);
  }

  async getOrders(limit: number = 50, page: number = 1): Promise<{ orders: ShopifyOrder[] }> {
    const endpoint = `orders.json?limit=${limit}&page=${page}&status=any`;
    return this.makeRequest<{ orders: ShopifyOrder[] }>(endpoint);
  }

  // Tag Management
  async getAllCustomerTags(): Promise<string[]> {
    const endpoint = 'customers.json?limit=250';
    const response = await this.makeRequest<{ customers: ShopifyCustomer[] }>(endpoint);
    
    const allTags = new Set<string>();
    response.customers.forEach(customer => {
      if (customer.tags) {
        customer.tags.split(',').forEach(tag => {
          allTags.add(tag.trim());
        });
      }
    });

    return Array.from(allTags).sort();
  }

  async getCustomersByTag(tag: string, limit: number = 50): Promise<{ customers: ShopifyCustomer[] }> {
    const endpoint = `customers.json?limit=${limit}&tag=${encodeURIComponent(tag)}`;
    return this.makeRequest<{ customers: ShopifyCustomer[] }>(endpoint);
  }

  // Webhook Management
  async createWebhook(topic: string, address: string): Promise<{ webhook: ShopifyWebhook }> {
    const endpoint = 'webhooks.json';
    const body = {
      webhook: {
        topic: topic,
        address: address,
        format: 'json'
      }
    };

    return this.makeRequest<{ webhook: ShopifyWebhook }>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  async getWebhooks(): Promise<{ webhooks: ShopifyWebhook[] }> {
    const endpoint = 'webhooks.json';
    return this.makeRequest<{ webhooks: ShopifyWebhook[] }>(endpoint);
  }

  async deleteWebhook(webhookId: number): Promise<void> {
    const endpoint = `webhooks/${webhookId}.json`;
    await this.makeRequest(endpoint, { method: 'DELETE' });
  }

  // Bulk Operations
  async updateMultipleCustomerTags(operations: Array<{ customerId: number; tags: string }>): Promise<Array<{ success: boolean; customerId: number; error?: string }>> {
    const results = [];

    for (const operation of operations) {
      try {
        await this.updateCustomerTags(operation.customerId, operation.tags);
        results.push({
          success: true,
          customerId: operation.customerId
        });
      } catch (error) {
        results.push({
          success: false,
          customerId: operation.customerId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Rate limiting - Shopify allows 2 requests per second
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return results;
  }

  // Analytics and Reporting
  async getCustomerAnalytics(customerId: number): Promise<{
    totalSpent: number;
    orderCount: number;
    averageOrderValue: number;
    lastOrderDate?: string;
  }> {
    const ordersResponse = await this.getCustomerOrders(customerId, 250);
    const orders = ordersResponse.orders;

    const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total_price), 0);
    const orderCount = orders.length;
    const averageOrderValue = orderCount > 0 ? totalSpent / orderCount : 0;
    const lastOrderDate = orders.length > 0 ? orders[0].created_at : undefined;

    return {
      totalSpent,
      orderCount,
      averageOrderValue,
      lastOrderDate
    };
  }

  // Utility Methods
  parseTags(tagsString: string): string[] {
    if (!tagsString) return [];
    return tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  }

  formatTags(tags: string[]): string {
    return tags.filter(tag => tag.length > 0).join(', ');
  }

  addTagsToCustomer(existingTags: string, newTags: string[]): string {
    const existing = this.parseTags(existingTags);
    const unique = new Set([...existing, ...newTags]);
    return this.formatTags(Array.from(unique));
  }

  removeTagsFromCustomer(existingTags: string, tagsToRemove: string[]): string {
    const existing = this.parseTags(existingTags);
    const toRemove = new Set(tagsToRemove.map(tag => tag.toLowerCase()));
    const filtered = existing.filter(tag => !toRemove.has(tag.toLowerCase()));
    return this.formatTags(filtered);
  }
} 