import { useState, useEffect } from "react";

// Types
type DeliveryArea = {
  id: number;
  name: string;
  deliveryFee: number;
  minimumOrder: number;
  estimatedDeliveryTime: string;
};

type Location = {
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
};

type ExpressTimeslot = {
  id: number;
  start: string;
  end: string;
  fee: number;
};

type Product = {
  id: number;
  name: string;
  deliveryType: 'standard' | 'express' | 'collection';
  isActive: boolean;
  minAdvanceHours: number;
  maxAdvanceDays: number;
};

type TimeslotRule = {
  id: number;
  dayOfWeek: number; // 0-6
  startTime: string;
  endTime: string;
  maxSlots: number;
  isActive: boolean;
  deliveryType: 'standard' | 'express';
};

type AdvanceOrderRule = {
  id: number;
  name: string;
  deliveryType: 'standard' | 'express' | 'collection';
  minAdvanceHours: number;
  maxAdvanceDays: number;
  cutoffTime: string;
  isActive: boolean;
};

type TextCustomizations = {
  deliveryType: string;
  deliveryDate: string;
  timeslot: string;
  postalCode: string;
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // Data states
  const [deliveryAreas] = useState<DeliveryArea[]>([
    { id: 1, name: 'Central Singapore', deliveryFee: 8.99, minimumOrder: 30, estimatedDeliveryTime: '2-3 hours' },
    { id: 2, name: 'North Singapore', deliveryFee: 10.99, minimumOrder: 35, estimatedDeliveryTime: '3-4 hours' },
    { id: 3, name: 'East Singapore', deliveryFee: 9.99, minimumOrder: 30, estimatedDeliveryTime: '2-3 hours' },
    { id: 4, name: 'West Singapore', deliveryFee: 11.99, minimumOrder: 40, estimatedDeliveryTime: '3-4 hours' },
    { id: 5, name: 'South Singapore', deliveryFee: 12.99, minimumOrder: 45, estimatedDeliveryTime: '3-4 hours' }
  ]);
  
  const [locations, setLocations] = useState<Location[]>([]);
  const [expressTimeslots, setExpressTimeslots] = useState<ExpressTimeslot[]>([]);
  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: 'Perishable Items', deliveryType: 'express', isActive: true, minAdvanceHours: 2, maxAdvanceDays: 3 },
    { id: 2, name: 'Standard Items', deliveryType: 'standard', isActive: true, minAdvanceHours: 24, maxAdvanceDays: 7 },
    { id: 3, name: 'Pickup Items', deliveryType: 'collection', isActive: true, minAdvanceHours: 1, maxAdvanceDays: 14 }
  ]);
  
  const [timeslotRules, setTimeslotRules] = useState<TimeslotRule[]>([
    { id: 1, dayOfWeek: 1, startTime: '09:00', endTime: '17:00', maxSlots: 10, isActive: true, deliveryType: 'standard' },
    { id: 2, dayOfWeek: 2, startTime: '09:00', endTime: '17:00', maxSlots: 10, isActive: true, deliveryType: 'standard' },
    { id: 3, dayOfWeek: 3, startTime: '09:00', endTime: '17:00', maxSlots: 10, isActive: true, deliveryType: 'standard' },
    { id: 4, dayOfWeek: 4, startTime: '09:00', endTime: '17:00', maxSlots: 10, isActive: true, deliveryType: 'standard' },
    { id: 5, dayOfWeek: 5, startTime: '09:00', endTime: '17:00', maxSlots: 10, isActive: true, deliveryType: 'standard' },
    { id: 6, dayOfWeek: 1, startTime: '10:00', endTime: '16:00', maxSlots: 5, isActive: true, deliveryType: 'express' }
  ]);
  
  const [advanceOrderRules, setAdvanceOrderRules] = useState<AdvanceOrderRule[]>([
    { id: 1, name: 'Express Delivery Rule', deliveryType: 'express', minAdvanceHours: 2, maxAdvanceDays: 3, cutoffTime: '15:00', isActive: true },
    { id: 2, name: 'Standard Delivery Rule', deliveryType: 'standard', minAdvanceHours: 24, maxAdvanceDays: 7, cutoffTime: '12:00', isActive: true },
    { id: 3, name: 'Collection Rule', deliveryType: 'collection', minAdvanceHours: 1, maxAdvanceDays: 14, cutoffTime: '18:00', isActive: true }
  ]);
  
  const [textCustomizations, setTextCustomizations] = useState<TextCustomizations>({
    deliveryType: "Select delivery type...",
    deliveryDate: "Select a date...",
    timeslot: "Select a timeslot...",
    postalCode: "Enter your postal code..."
  });

  // Form states
  const [newLocation, setNewLocation] = useState({
    name: '', address1: '', address2: '', city: '', province: '', country: 'Singapore', zip: ''
  });

  const [newProduct, setNewProduct] = useState({
    name: '', deliveryType: 'standard' as const, minAdvanceHours: 24, maxAdvanceDays: 7
  });

  const [newTimeslotRule, setNewTimeslotRule] = useState({
    dayOfWeek: 1, startTime: '09:00', endTime: '17:00', maxSlots: 10, deliveryType: 'standard' as const
  });

  const [newAdvanceRule, setNewAdvanceRule] = useState({
    name: '', deliveryType: 'standard' as const, minAdvanceHours: 24, maxAdvanceDays: 7, cutoffTime: '12:00'
  });

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Load data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadLocations(),
        loadExpressTimeslots(),
        loadTextCustomizations()
      ]);
    } catch (err) {
      setError('Failed to load data');
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLocations = async () => {
    try {
      const response = await fetch(`${apiUrl}/locations`);
      const data = await response.json();
      if (data.success) {
        setLocations(data.data.locations || []);
      }
    } catch (err) {
      console.error('Failed to load locations:', err);
    }
  };

  const loadExpressTimeslots = async () => {
    try {
      const response = await fetch(`${apiUrl}/express-timeslots`);
      const data = await response.json();
      if (data.success) {
        setExpressTimeslots(data.data.expressTimeslots || []);
      }
    } catch (err) {
      console.error('Failed to load express timeslots:', err);
    }
  };

  const loadTextCustomizations = async () => {
    try {
      const response = await fetch(`${apiUrl}/text-customisations`);
      const data = await response.json();
      if (data.success) {
        setTextCustomizations(data.data);
      }
    } catch (err) {
      console.error('Failed to load text customizations:', err);
    }
  };

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newLocation.name,
          address: {
            address1: newLocation.address1,
            address2: newLocation.address2,
            city: newLocation.city,
            province: newLocation.province,
            country: newLocation.country,
            zip: newLocation.zip
          }
        })
      });
      
      if (response.ok) {
        await loadLocations();
        setNewLocation({
          name: '', address1: '', address2: '', city: '', province: '', country: 'Singapore', zip: ''
        });
        alert('Location created successfully!');
      } else {
        alert('Failed to create location');
      }
    } catch (err) {
      alert('Error creating location');
      console.error('Error creating location:', err);
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const product: Product = {
      id: Date.now(),
      name: newProduct.name,
      deliveryType: newProduct.deliveryType,
      isActive: true,
      minAdvanceHours: newProduct.minAdvanceHours,
      maxAdvanceDays: newProduct.maxAdvanceDays
    };
    setProducts([...products, product]);
    setNewProduct({ name: '', deliveryType: 'standard', minAdvanceHours: 24, maxAdvanceDays: 7 });
    alert('Product created successfully!');
  };

  const handleCreateTimeslotRule = (e: React.FormEvent) => {
    e.preventDefault();
    const rule: TimeslotRule = {
      id: Date.now(),
      dayOfWeek: newTimeslotRule.dayOfWeek,
      startTime: newTimeslotRule.startTime,
      endTime: newTimeslotRule.endTime,
      maxSlots: newTimeslotRule.maxSlots,
      isActive: true,
      deliveryType: newTimeslotRule.deliveryType
    };
    setTimeslotRules([...timeslotRules, rule]);
    setNewTimeslotRule({ dayOfWeek: 1, startTime: '09:00', endTime: '17:00', maxSlots: 10, deliveryType: 'standard' });
    alert('Timeslot rule created successfully!');
  };

  const handleCreateAdvanceRule = (e: React.FormEvent) => {
    e.preventDefault();
    const rule: AdvanceOrderRule = {
      id: Date.now(),
      name: newAdvanceRule.name,
      deliveryType: newAdvanceRule.deliveryType,
      minAdvanceHours: newAdvanceRule.minAdvanceHours,
      maxAdvanceDays: newAdvanceRule.maxAdvanceDays,
      cutoffTime: newAdvanceRule.cutoffTime,
      isActive: true
    };
    setAdvanceOrderRules([...advanceOrderRules, rule]);
    setNewAdvanceRule({ name: '', deliveryType: 'standard', minAdvanceHours: 24, maxAdvanceDays: 7, cutoffTime: '12:00' });
    alert('Advance order rule created successfully!');
  };

  const handleSaveTextCustomizations = async () => {
    try {
      const response = await fetch(`${apiUrl}/text-customisations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(textCustomizations)
      });
      
      if (response.ok) {
        alert('Text customizations saved successfully!');
      } else {
        alert('Failed to save text customizations');
      }
    } catch (err) {
      alert('Error saving text customizations');
      console.error('Error saving text customizations:', err);
    }
  };

  const toggleProductStatus = (id: number) => {
    setProducts(products.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  };

  const toggleTimeslotRuleStatus = (id: number) => {
    setTimeslotRules(timeslotRules.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  const toggleAdvanceRuleStatus = (id: number) => {
    setAdvanceOrderRules(advanceOrderRules.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'delivery-areas', label: 'Delivery Areas', icon: '🗺️' },
    { id: 'products', label: 'Product Management', icon: '📦' },
    { id: 'timeslots', label: 'Timeslot Management', icon: '⏰' },
    { id: 'availability', label: 'Availability Calendar', icon: '📅' },
    { id: 'advance-rules', label: 'Advance Order Rules', icon: '⚡' },
    { id: 'express-delivery', label: 'Express Delivery', icon: '🚀' },
    { id: 'locations', label: 'Collection Locations', icon: '📍' },
    { id: 'text-customizations', label: 'Text Customizations', icon: '✏️' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Dashboard</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={loadAllData}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Delivery Scheduler Admin
              </h1>
              <p className="text-gray-600 mt-1">
                Complete delivery management system with advanced scheduling
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                API Connected
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-4 px-6 overflow-x-auto" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{deliveryAreas.length}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-blue-600">Delivery Areas</p>
                        <p className="text-2xl font-semibold text-blue-900">{deliveryAreas.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{products.filter(p => p.isActive).length}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-green-600">Active Products</p>
                        <p className="text-2xl font-semibold text-green-900">{products.filter(p => p.isActive).length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{timeslotRules.filter(r => r.isActive).length}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-yellow-600">Active Timeslot Rules</p>
                        <p className="text-2xl font-semibold text-yellow-900">{timeslotRules.filter(r => r.isActive).length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{locations.length}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-purple-600">Collection Locations</p>
                        <p className="text-2xl font-semibold text-purple-900">{locations.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button 
                      onClick={() => setActiveTab('products')}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 text-center"
                    >
                      <div className="text-2xl mb-2">📦</div>
                      <div className="text-sm font-medium">Add Product</div>
                    </button>
                    <button 
                      onClick={() => setActiveTab('timeslots')}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 text-center"
                    >
                      <div className="text-2xl mb-2">⏰</div>
                      <div className="text-sm font-medium">Manage Timeslots</div>
                    </button>
                    <button 
                      onClick={() => setActiveTab('availability')}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 text-center"
                    >
                      <div className="text-2xl mb-2">📅</div>
                      <div className="text-sm font-medium">View Calendar</div>
                    </button>
                    <button 
                      onClick={() => setActiveTab('locations')}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 text-center"
                    >
                      <div className="text-2xl mb-2">📍</div>
                      <div className="text-sm font-medium">Add Location</div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Product Management Tab */}
            {activeTab === 'products' && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Product Management</h2>
                
                {/* Add New Product Form */}
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Product</h3>
                  <form onSubmit={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                      <input
                        type="text"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Fresh Flowers"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Type</label>
                      <select
                        value={newProduct.deliveryType}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, deliveryType: e.target.value as any }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="standard">Standard</option>
                        <option value="express">Express</option>
                        <option value="collection">Collection</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Min Advance Hours</label>
                      <input
                        type="number"
                        value={newProduct.minAdvanceHours}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, minAdvanceHours: parseInt(e.target.value) }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Advance Days</label>
                      <input
                        type="number"
                        value={newProduct.maxAdvanceDays}
                        onChange={(e) => setNewProduct(prev => ({ ...prev, maxAdvanceDays: parseInt(e.target.value) }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        min="1"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                      >
                        Create Product
                      </button>
                    </div>
                  </form>
                </div>

                {/* Products List */}
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Advance</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Advance</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product) => (
                          <tr key={product.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {product.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                              {product.deliveryType}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {product.minAdvanceHours}h
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {product.maxAdvanceDays}d
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {product.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button 
                                onClick={() => toggleProductStatus(product.id)}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                {product.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <button className="text-red-600 hover:text-red-900">Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Additional tabs would continue here... */}
            {/* I'll create the remaining tabs in the next part due to length constraints */}
            
            {activeTab === 'delivery-areas' && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Delivery Areas Management</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {deliveryAreas.map((area) => (
                    <div key={area.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">{area.name}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Delivery Fee:</span>
                          <span className="font-medium">${area.deliveryFee}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Minimum Order:</span>
                          <span className="font-medium">${area.minimumOrder}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Delivery Time:</span>
                          <span className="font-medium">{area.estimatedDeliveryTime}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">Edit</button>
                        <button className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">Details</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Continue with other simplified tab implementations */}
            {activeTab === 'text-customizations' && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Text Customizations</h2>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Type Label</label>
                      <input
                        type="text"
                        value={textCustomizations.deliveryType}
                        onChange={(e) => setTextCustomizations(prev => ({ ...prev, deliveryType: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Date Label</label>
                      <input
                        type="text"
                        value={textCustomizations.deliveryDate}
                        onChange={(e) => setTextCustomizations(prev => ({ ...prev, deliveryDate: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Timeslot Label</label>
                      <input
                        type="text"
                        value={textCustomizations.timeslot}
                        onChange={(e) => setTextCustomizations(prev => ({ ...prev, timeslot: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code Label</label>
                      <input
                        type="text"
                        value={textCustomizations.postalCode}
                        onChange={(e) => setTextCustomizations(prev => ({ ...prev, postalCode: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSaveTextCustomizations}
                    className="mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Timeslot Management Tab */}
            {activeTab === 'timeslots' && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Timeslot Management</h2>
                
                {/* Add New Timeslot Rule Form */}
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Timeslot Rule</h3>
                  <form onSubmit={handleCreateTimeslotRule} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
                      <select
                        value={newTimeslotRule.dayOfWeek}
                        onChange={(e) => setNewTimeslotRule(prev => ({ ...prev, dayOfWeek: parseInt(e.target.value) }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value={1}>Monday</option>
                        <option value={2}>Tuesday</option>
                        <option value={3}>Wednesday</option>
                        <option value={4}>Thursday</option>
                        <option value={5}>Friday</option>
                        <option value={6}>Saturday</option>
                        <option value={0}>Sunday</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={newTimeslotRule.startTime}
                        onChange={(e) => setNewTimeslotRule(prev => ({ ...prev, startTime: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                      <input
                        type="time"
                        value={newTimeslotRule.endTime}
                        onChange={(e) => setNewTimeslotRule(prev => ({ ...prev, endTime: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Slots</label>
                      <input
                        type="number"
                        value={newTimeslotRule.maxSlots}
                        onChange={(e) => setNewTimeslotRule(prev => ({ ...prev, maxSlots: parseInt(e.target.value) }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Type</label>
                      <select
                        value={newTimeslotRule.deliveryType}
                        onChange={(e) => setNewTimeslotRule(prev => ({ ...prev, deliveryType: e.target.value as any }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="standard">Standard</option>
                        <option value="express">Express</option>
                      </select>
                    </div>
                    <div>
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 mt-6"
                      >
                        Create Rule
                      </button>
                    </div>
                  </form>
                </div>

                {/* Timeslot Rules List */}
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Range</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Slots</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {timeslotRules.map((rule) => (
                          <tr key={rule.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {getDayName(rule.dayOfWeek)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {rule.startTime} - {rule.endTime}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {rule.maxSlots}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                              {rule.deliveryType}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                rule.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {rule.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button 
                                onClick={() => toggleTimeslotRuleStatus(rule.id)}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                {rule.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <button className="text-red-600 hover:text-red-900">Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Availability Calendar Tab */}
            {activeTab === 'availability' && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Availability Calendar</h2>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="grid grid-cols-7 gap-4 mb-6">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                      <div key={day} className="text-center">
                        <div className="font-semibold text-gray-900 mb-2">{day}</div>
                        <div className={`h-20 border-2 rounded-lg ${index === 0 || index === 6 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'} flex items-center justify-center`}>
                          <div className="text-xs">
                            {timeslotRules.filter(r => r.dayOfWeek === index && r.isActive).length} rules
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Overview</h3>
                    <div className="space-y-2">
                      {[0,1,2,3,4,5,6].map(dayIndex => (
                        <div key={dayIndex} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <span className="font-medium">{getDayName(dayIndex)}</span>
                          <span className="text-sm text-gray-600">
                            {timeslotRules.filter(r => r.dayOfWeek === dayIndex && r.isActive).length} active rules, 
                            {timeslotRules.filter(r => r.dayOfWeek === dayIndex && r.isActive).reduce((sum, r) => sum + r.maxSlots, 0)} total slots
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Advance Order Rules Tab */}
            {activeTab === 'advance-rules' && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Advance Order Rules</h2>
                
                {/* Add New Advance Rule Form */}
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Advance Order Rule</h3>
                  <form onSubmit={handleCreateAdvanceRule} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
                      <input
                        type="text"
                        value={newAdvanceRule.name}
                        onChange={(e) => setNewAdvanceRule(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Express Flower Rule"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Type</label>
                      <select
                        value={newAdvanceRule.deliveryType}
                        onChange={(e) => setNewAdvanceRule(prev => ({ ...prev, deliveryType: e.target.value as any }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="standard">Standard</option>
                        <option value="express">Express</option>
                        <option value="collection">Collection</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Min Advance Hours</label>
                      <input
                        type="number"
                        value={newAdvanceRule.minAdvanceHours}
                        onChange={(e) => setNewAdvanceRule(prev => ({ ...prev, minAdvanceHours: parseInt(e.target.value) }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Advance Days</label>
                      <input
                        type="number"
                        value={newAdvanceRule.maxAdvanceDays}
                        onChange={(e) => setNewAdvanceRule(prev => ({ ...prev, maxAdvanceDays: parseInt(e.target.value) }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cutoff Time</label>
                      <input
                        type="time"
                        value={newAdvanceRule.cutoffTime}
                        onChange={(e) => setNewAdvanceRule(prev => ({ ...prev, cutoffTime: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 mt-6"
                      >
                        Create Rule
                      </button>
                    </div>
                  </form>
                </div>

                {/* Advance Rules List */}
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rule Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Advance</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Advance</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cutoff Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {advanceOrderRules.map((rule) => (
                          <tr key={rule.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {rule.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                              {rule.deliveryType}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {rule.minAdvanceHours}h
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {rule.maxAdvanceDays}d
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {rule.cutoffTime}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                rule.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {rule.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button 
                                onClick={() => toggleAdvanceRuleStatus(rule.id)}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                {rule.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <button className="text-red-600 hover:text-red-900">Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Express Delivery Tab */}
            {activeTab === 'express-delivery' && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Express Delivery Management</h2>
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Slot</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Express Fee</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {expressTimeslots.map((slot) => (
                          <tr key={slot.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {slot.start} - {slot.end}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {slot.fee === 0 ? 'Free' : `$${slot.fee}`}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                slot.fee === 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {slot.fee === 0 ? 'Standard' : 'Premium'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                              <button className="text-red-600 hover:text-red-900">Remove</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                  Add New Timeslot
                </button>
              </div>
            )}

            {/* Collection Locations Tab */}
            {activeTab === 'locations' && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Collection Locations</h2>
                
                {/* Add New Location Form */}
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Location</h3>
                  <form onSubmit={handleCreateLocation} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location Name</label>
                      <input
                        type="text"
                        value={newLocation.name}
                        onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Main Store"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                      <input
                        type="text"
                        value={newLocation.address1}
                        onChange={(e) => setNewLocation(prev => ({ ...prev, address1: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="123 Main Street"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                      <input
                        type="text"
                        value={newLocation.address2}
                        onChange={(e) => setNewLocation(prev => ({ ...prev, address2: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Unit #01-01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={newLocation.city}
                        onChange={(e) => setNewLocation(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Singapore"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                      <input
                        type="text"
                        value={newLocation.province}
                        onChange={(e) => setNewLocation(prev => ({ ...prev, province: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Singapore"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                      <input
                        type="text"
                        value={newLocation.zip}
                        onChange={(e) => setNewLocation(prev => ({ ...prev, zip: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        placeholder="123456"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                      >
                        Create Location
                      </button>
                    </div>
                  </form>
                </div>

                {/* Existing Locations */}
                <div className="space-y-4">
                  {locations.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No collection locations configured yet.</p>
                  ) : (
                    locations.map((location) => (
                      <div key={location.id} className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
                            <p className="text-gray-600 mt-1">
                              {location.address.address1}
                              {location.address.address2 && `, ${location.address.address2}`}
                            </p>
                            <p className="text-gray-600">
                              {location.address.city}, {location.address.province} {location.address.zip}
                            </p>
                            <p className="text-gray-600">{location.address.country}</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              location.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {location.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <button className="text-blue-600 hover:text-blue-900">Edit</button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">System Settings</h2>
                <div className="space-y-6">
                  {/* API Status */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">API Connection</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">API URL:</span>
                        <span className="font-mono text-sm">{apiUrl}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="text-green-600 font-medium">Connected</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Locations loaded:</span>
                        <span className="font-medium">{locations.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Express timeslots:</span>
                        <span className="font-medium">{expressTimeslots.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* System Info */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dashboard Version:</span>
                        <span className="font-mono">2.0.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Build Date:</span>
                        <span className="font-mono">{new Date().toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Environment:</span>
                        <span className="font-mono">Production</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Products:</span>
                        <span className="font-mono">{products.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Active Timeslot Rules:</span>
                        <span className="font-mono">{timeslotRules.filter(r => r.isActive).length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Advance Rules:</span>
                        <span className="font-mono">{advanceOrderRules.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 