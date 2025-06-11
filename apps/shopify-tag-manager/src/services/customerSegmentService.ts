import { ShopifyCustomer, CustomerSegmentRule, SegmentCondition, TagOperation, TagSyncResult } from '../types/index.js';
import { ShopifyApiService } from './shopifyApi.js';

export class CustomerSegmentService {
  private shopifyApi: ShopifyApiService;

  constructor(shopifyApi: ShopifyApiService) {
    this.shopifyApi = shopifyApi;
  }

  // Evaluate a customer against segment conditions
  evaluateCustomer(customer: ShopifyCustomer, rule: CustomerSegmentRule): boolean {
    if (!rule.enabled) return false;

    return rule.conditions.every(condition => 
      this.evaluateCondition(customer, condition)
    );
  }

  // Evaluate a single condition against customer data
  private evaluateCondition(customer: ShopifyCustomer, condition: SegmentCondition): boolean {
    const { field, operator, value } = condition;
    const customerValue = this.getCustomerFieldValue(customer, field);

    switch (operator) {
      case 'equals':
        return customerValue === value;
      
      case 'not_equals':
        return customerValue !== value;
      
      case 'greater_than':
        return this.compareNumbers(customerValue, value) > 0;
      
      case 'less_than':
        return this.compareNumbers(customerValue, value) < 0;
      
      case 'greater_than_or_equal':
        return this.compareNumbers(customerValue, value) >= 0;
      
      case 'less_than_or_equal':
        return this.compareNumbers(customerValue, value) <= 0;
      
      case 'contains':
        return String(customerValue).toLowerCase().includes(String(value).toLowerCase());
      
      case 'not_contains':
        return !String(customerValue).toLowerCase().includes(String(value).toLowerCase());
      
      case 'starts_with':
        return String(customerValue).toLowerCase().startsWith(String(value).toLowerCase());
      
      case 'ends_with':
        return String(customerValue).toLowerCase().endsWith(String(value).toLowerCase());
      
      case 'older_than_days':
        return this.isOlderThanDays(customerValue, Number(value));
      
      case 'newer_than_days':
        return this.isNewerThanDays(customerValue, Number(value));
      
      case 'in':
        const valueArray = Array.isArray(value) ? value : [value];
        return valueArray.includes(customerValue);
      
      case 'not_in':
        const notInArray = Array.isArray(value) ? value : [value];
        return !notInArray.includes(customerValue);
      
      default:
        return false;
    }
  }

  // Get customer field value based on field name
  private getCustomerFieldValue(customer: ShopifyCustomer, field: string): any {
    switch (field) {
      case 'total_spent':
        return parseFloat(customer.total_spent) || 0;
      
      case 'orders_count':
        return customer.orders_count || 0;
      
      case 'last_order_date':
        return customer.last_order_date;
      
      case 'created_at':
        return customer.created_at;
      
      case 'tags':
        return customer.tags;
      
      case 'email':
        return customer.email;
      
      case 'first_name':
        return customer.first_name;
      
      case 'last_name':
        return customer.last_name;
      
      case 'accepts_marketing':
        return customer.accepts_marketing;
      
      case 'verified_email':
        return customer.verified_email;
      
      default:
        return null;
    }
  }

  // Compare numbers, handling string conversion
  private compareNumbers(a: any, b: any): number {
    const numA = typeof a === 'number' ? a : parseFloat(String(a)) || 0;
    const numB = typeof b === 'number' ? b : parseFloat(String(b)) || 0;
    return numA - numB;
  }

  // Check if date is older than specified days
  private isOlderThanDays(dateValue: any, days: number): boolean {
    if (!dateValue) return false;
    
    const date = new Date(dateValue);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return date < cutoffDate;
  }

  // Check if date is newer than specified days
  private isNewerThanDays(dateValue: any, days: number): boolean {
    if (!dateValue) return false;
    
    const date = new Date(dateValue);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return date > cutoffDate;
  }

  // Generate tag operations for a customer based on segment rules
  async generateTagOperations(customer: ShopifyCustomer, rules: CustomerSegmentRule[]): Promise<TagOperation[]> {
    const operations: TagOperation[] = [];
    const sortedRules = rules.sort((a, b) => b.priority - a.priority);

    for (const rule of sortedRules) {
      if (this.evaluateCustomer(customer, rule)) {
        const operation: TagOperation = {
          customerId: customer.id,
          addTags: rule.tags,
          removeTags: rule.remove_tags,
          reason: `Matched segment rule: ${rule.name}`,
          segmentRule: rule.name
        };
        operations.push(operation);
      }
    }

    return operations;
  }

  // Apply tag operations to a customer
  async applyTagOperations(customer: ShopifyCustomer, operations: TagOperation[]): Promise<TagSyncResult> {
    const result: TagSyncResult = {
      success: false,
      customerId: customer.id,
      operations: [],
      errors: [],
      timestamp: new Date().toISOString()
    };

    try {
      let currentTags = customer.tags || '';

      for (const operation of operations) {
        try {
          // Remove tags first
          if (operation.removeTags.length > 0) {
            currentTags = this.shopifyApi.removeTagsFromCustomer(currentTags, operation.removeTags);
          }

          // Add new tags
          if (operation.addTags.length > 0) {
            currentTags = this.shopifyApi.addTagsToCustomer(currentTags, operation.addTags);
          }

          result.operations.push(operation);
        } catch (error) {
          result.errors.push(`Error applying operation for rule ${operation.segmentRule}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Update customer tags in Shopify
      if (currentTags !== customer.tags) {
        await this.shopifyApi.updateCustomerTags(customer.id, currentTags);
      }

      result.success = result.errors.length === 0;
    } catch (error) {
      result.errors.push(`Failed to update customer tags: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  // Process all customers against segment rules
  async processAllCustomers(rules: CustomerSegmentRule[], batchSize: number = 50): Promise<TagSyncResult[]> {
    const results: TagSyncResult[] = [];
    let page = 1;
    let hasMoreCustomers = true;

    while (hasMoreCustomers) {
      try {
        const response = await this.shopifyApi.getCustomers(batchSize, page);
        const customers = response.customers;

        if (customers.length === 0) {
          hasMoreCustomers = false;
          break;
        }

        for (const customer of customers) {
          try {
            const operations = await this.generateTagOperations(customer, rules);
            
            if (operations.length > 0) {
              const result = await this.applyTagOperations(customer, operations);
              results.push(result);
            }
          } catch (error) {
            results.push({
              success: false,
              customerId: customer.id,
              operations: [],
              errors: [`Error processing customer: ${error instanceof Error ? error.message : 'Unknown error'}`],
              timestamp: new Date().toISOString()
            });
          }

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        page++;
      } catch (error) {
        console.error(`Error fetching customers page ${page}:`, error);
        hasMoreCustomers = false;
      }
    }

    return results;
  }

  // Get customers that match a specific segment rule
  async getCustomersForSegment(rule: CustomerSegmentRule, limit: number = 50): Promise<ShopifyCustomer[]> {
    const matchingCustomers: ShopifyCustomer[] = [];
    let page = 1;
    let hasMoreCustomers = true;

    while (hasMoreCustomers && matchingCustomers.length < limit) {
      try {
        const response = await this.shopifyApi.getCustomers(50, page);
        const customers = response.customers;

        if (customers.length === 0) {
          hasMoreCustomers = false;
          break;
        }

        for (const customer of customers) {
          if (this.evaluateCustomer(customer, rule)) {
            matchingCustomers.push(customer);
            
            if (matchingCustomers.length >= limit) {
              break;
            }
          }
        }

        page++;
      } catch (error) {
        console.error(`Error fetching customers for segment:`, error);
        hasMoreCustomers = false;
      }
    }

    return matchingCustomers;
  }

  // Validate segment rule configuration
  validateSegmentRule(rule: CustomerSegmentRule): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!rule.name || rule.name.trim().length === 0) {
      errors.push('Rule name is required');
    }

    if (!rule.conditions || rule.conditions.length === 0) {
      errors.push('At least one condition is required');
    }

    if (rule.conditions) {
      rule.conditions.forEach((condition, index) => {
        if (!condition.field) {
          errors.push(`Condition ${index + 1}: Field is required`);
        }
        if (!condition.operator) {
          errors.push(`Condition ${index + 1}: Operator is required`);
        }
        if (condition.value === undefined || condition.value === null) {
          errors.push(`Condition ${index + 1}: Value is required`);
        }
      });
    }

    if (!rule.tags || rule.tags.length === 0) {
      errors.push('At least one tag to add is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
} 