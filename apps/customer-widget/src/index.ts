import React from 'react';
import { createRoot } from 'react-dom/client';
import { DeliveryScheduler } from './components/DeliveryScheduler';

// Type definitions
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

// Global widget instance
let widgetInstance: any = null;

// Initialize the widget
export function initDeliveryScheduler(
  containerId: string,
  config: WidgetConfig,
  onEvent?: (event: any) => void
) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Container with id "${containerId}" not found`);
    return;
  }

  // Clean up existing instance
  if (widgetInstance) {
    widgetInstance.unmount();
  }

  const root = createRoot(container);
  widgetInstance = root;

  root.render(
    React.createElement(DeliveryScheduler, {
      config: config,
      onEvent: onEvent
    })
  );

  return {
    destroy: () => {
      root.unmount();
      widgetInstance = null;
    },
    updateConfig: (newConfig: Partial<WidgetConfig>) => {
      root.render(
        React.createElement(DeliveryScheduler, {
          config: { ...config, ...newConfig },
          onEvent: onEvent
        })
      );
    }
  };
}

// Auto-initialize if data attributes are present
document.addEventListener('DOMContentLoaded', () => {
  const script = document.currentScript;
  if (script) {
    const containerId = script.getAttribute('data-container');
    const configStr = script.getAttribute('data-config');
    
    if (containerId && configStr) {
      try {
        const config = JSON.parse(configStr);
        initDeliveryScheduler(containerId, config);
      } catch (error) {
        console.error('Failed to parse widget config:', error);
      }
    }
  }
});

// Export for manual initialization
export { DeliveryScheduler };

// Global exports for IIFE build
if (typeof window !== 'undefined') {
  (window as any).DeliveryScheduler = {
    init: initDeliveryScheduler,
    DeliveryScheduler: DeliveryScheduler
  };
} 