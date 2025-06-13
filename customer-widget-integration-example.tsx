// Customer Widget Integration Example
// This demonstrates how to integrate advance order rules with the customer widget calendar

import React, { useState } from 'react';

interface CustomerWidgetProps {
  // These functions would be imported from the admin dashboard API
  isDateAvailable: (dateStr: string, deliveryType?: string, productName?: string) => boolean;
  getDateBlockingReason: (dateStr: string, deliveryType?: string, productName?: string) => string | null;
  getAvailableDatesInRange: (startDate: string, endDate: string, deliveryType?: string, productName?: string) => string[];
}

const CustomerWidget: React.FC<CustomerWidgetProps> = ({
  isDateAvailable,
  getDateBlockingReason,
  getAvailableDatesInRange
}) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [deliveryType, setDeliveryType] = useState('delivery');

  // Generate next 30 days
  const getNext30Days = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Delivery Date</h2>
      
      {/* Product Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">All Products</option>
          <option value="Valentine's Day Roses">Valentine's Day Roses</option>
          <option value="Christmas Collection">Christmas Collection</option>
          <option value="Regular Bouquet">Regular Bouquet</option>
        </select>
      </div>

      {/* Delivery Type Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Type</label>
        <select
          value={deliveryType}
          onChange={(e) => setDeliveryType(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="delivery">Standard Delivery</option>
          <option value="express">Express Delivery</option>
          <option value="collection">Store Collection</option>
        </select>
      </div>

      {/* Date Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Available Dates</label>
        <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
          {getNext30Days().map((dateStr) => {
            const available = isDateAvailable(dateStr, deliveryType, selectedProduct);
            const blockingReason = getDateBlockingReason(dateStr, deliveryType, selectedProduct);
            
            return (
              <button
                key={dateStr}
                onClick={() => available && setSelectedDate(dateStr)}
                disabled={!available}
                className={`
                  p-3 text-left rounded-lg border transition-colors
                  ${available 
                    ? 'border-green-300 bg-green-50 hover:bg-green-100 text-green-800' 
                    : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                  }
                  ${selectedDate === dateStr ? 'ring-2 ring-green-500' : ''}
                `}
                title={blockingReason || 'Available for delivery'}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{formatDate(dateStr)}</span>
                  {available ? (
                    <span className="text-green-600 text-sm">✓ Available</span>
                  ) : (
                    <span className="text-red-500 text-sm">✗ Blocked</span>
                  )}
                </div>
                {blockingReason && (
                  <div className="text-xs mt-1 text-gray-500">
                    {blockingReason}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Summary */}
      {selectedDate && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800">Selected Delivery Date</h3>
          <p className="text-green-700">{formatDate(selectedDate)}</p>
          <p className="text-sm text-green-600 mt-1">
            {selectedProduct ? `Product: ${selectedProduct}` : 'Any product'}
            {' • '}
            {deliveryType.charAt(0).toUpperCase() + deliveryType.slice(1)} delivery
          </p>
        </div>
      )}

      {/* Integration Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">🔗 Live Integration Active</h4>
        <div className="text-xs text-blue-700 space-y-1">
          <p>✅ Global advance order rules applied</p>
          <p>✅ Product-specific rules checked</p>
          <p>✅ Calendar blocking honored</p>
          <p>✅ Real-time availability updates</p>
        </div>
      </div>
    </div>
  );
};

// API Integration Functions that would be called from the admin dashboard
export const getAdvanceOrderRulesAPI = async () => {
  // This would fetch from your admin dashboard API
  const response = await fetch('/api/advance-order-rules');
  return response.json();
};

export const checkDateAvailability = async (dateStr: string, deliveryType?: string, productName?: string) => {
  // This would call the admin dashboard functions
  const rules = await getAdvanceOrderRulesAPI();
  
  // Apply the same logic as in the admin dashboard
  // isDateAvailable, getDateBlockingReason, etc.
  
  return {
    available: true, // Result from advance order rules check
    reason: null // Blocking reason if any
  };
};

export default CustomerWidget; 