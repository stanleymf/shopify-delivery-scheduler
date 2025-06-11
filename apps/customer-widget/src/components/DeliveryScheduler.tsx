import { useState, useEffect, useCallback } from 'react';
import { PostalCodeChecker } from './PostalCodeChecker';

// Type definitions
type WidgetConfig = {
  apiUrl: string;
  shopDomain: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  currency: string;
  timezone: string;
  showProductAvailability: boolean;
  allowExpressDelivery: boolean;
  maxFutureDays: number;
  enablePostalCodeValidation: boolean;
  enablePostalCodeAutoComplete: boolean;
  postalCodeAutoCompleteDelay: number;
  showPostalCodeSuggestions: boolean;
  maxPostalCodeSuggestions: number;
};

type WidgetEvent = {
  type: 'DELIVERY_TYPE_SELECTED' | 'POSTAL_CODE_VALIDATED' | 'AVAILABILITY_CHECKED' | 'DELIVERY_DATE_SELECTED';
  payload: any;
};

type DeliveryAreaResponse = {
  id: number;
  name: string;
  deliveryFee: number;
  minimumOrder: number;
  estimatedDeliveryTime: string;
};

type AvailabilityResponse = {
  date: string;
  available: boolean;
  availableTimeslots: Array<{
    id: number;
    start: string;
    end: string;
    availableSlots: number;
    cutoffTime: string;
    fee?: number;
  }>;
};

type PostalCodeValidationResponse = {
  postalCode: string;
  isValid: boolean;
  deliveryArea?: DeliveryAreaResponse;
  error?: string;
  suggestions?: string[];
};

type LocationAddress = {
  address1: string;
  address2?: string;
  city: string;
  province: string;
  country: string;
  zip: string;
};

type Location = {
  id: number;
  name: string;
  address: LocationAddress;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type DeliveryType = 'standard' | 'express' | 'collection';

type ExpressTimeslot = {
  id: number;
  start: string;
  end: string;
  fee: number;
};

interface DeliverySchedulerProps {
  config: WidgetConfig;
  onEvent?: (event: WidgetEvent) => void;
}

export function DeliveryScheduler({ config, onEvent }: DeliverySchedulerProps) {
  const [deliveryType, setDeliveryType] = useState<DeliveryType | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<number | null>(null);
  const [selectedDeliveryArea, setSelectedDeliveryArea] = useState<DeliveryAreaResponse | null>(null);
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [expressTimeslots, setExpressTimeslots] = useState<ExpressTimeslot[]>([]);
  const [textCustomisations, setTextCustomisations] = useState({
    deliveryType: "Select delivery type...",
    deliveryDate: "Select a date...",
    timeslot: "Select a timeslot...",
    postalCode: "Enter your postal code..."
  });
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load collection locations, text customisations, and express timeslots
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load locations
        const locationsResponse = await fetch(`${config.apiUrl}/locations`);
        const locationsData = await locationsResponse.json();
        if (locationsData.success) {
          setLocations(locationsData.data.locations || []);
        }

        // Load text customisations
        const textResponse = await fetch(`${config.apiUrl}/text-customisations`);
        const textData = await textResponse.json();
        if (textData.success) {
          setTextCustomisations(textData.data);
        }

        // Load express timeslots
        const expressResponse = await fetch(`${config.apiUrl}/express-timeslots`);
        const expressData = await expressResponse.json();
        if (expressData.success) {
          setExpressTimeslots(expressData.data.expressTimeslots || []);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      }
    };
    loadData();
  }, [config.apiUrl]);

  // Handle delivery type selection
  const handleDeliveryTypeSelect = useCallback((type: DeliveryType) => {
    setDeliveryType(type);
    setSelectedDate('');
    setSelectedTimeSlot(null);
    setSelectedDeliveryArea(null);
    setAvailability(null);
    setSelectedLocation(null);
    setDeliveryNotes('');
    setError(null);
    
    onEvent?.({
      type: 'DELIVERY_TYPE_SELECTED',
      payload: { deliveryType: type }
    });
  }, [onEvent]);

  // Handle postal code validation
  const handlePostalCodeValidation = useCallback((response: PostalCodeValidationResponse) => {
    if (response.isValid && response.deliveryArea) {
      setSelectedDeliveryArea(response.deliveryArea);
      setError(null);
      onEvent?.({
        type: 'POSTAL_CODE_VALIDATED',
        payload: {
          postalCode: response.postalCode,
          isValid: true,
          area: response.deliveryArea
        }
      });
    } else {
      setSelectedDeliveryArea(null);
      setError(response.error || 'Invalid postal code');
      onEvent?.({
        type: 'POSTAL_CODE_VALIDATED',
        payload: {
          postalCode: response.postalCode,
          isValid: false
        }
      });
    }
  }, [onEvent]);

  // Check availability for selected date
  const checkAvailability = useCallback(async (date: string) => {
    if (deliveryType === 'collection') {
      // For collection, we don't need delivery area validation
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${config.apiUrl}/availability`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date,
            deliveryAreaId: 0, // Collection doesn't need delivery area
            shopDomain: config.shopDomain
          })
        });

        const data = await response.json();
        
        if (data.success) {
          setAvailability(data.data);
          onEvent?.({
            type: 'AVAILABILITY_CHECKED',
            payload: {
              date,
              available: data.data.available
            }
          });
        } else {
          setError(data.error || 'Failed to check availability');
        }
      } catch (err) {
        setError('Network error while checking availability');
      } finally {
        setIsLoading(false);
      }
    } else if (selectedDeliveryArea) {
      // For delivery, we need delivery area validation
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${config.apiUrl}/availability`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date,
            deliveryAreaId: selectedDeliveryArea.id,
            shopDomain: config.shopDomain
          })
        });

        const data = await response.json();
        
        if (data.success) {
          setAvailability(data.data);
          onEvent?.({
            type: 'AVAILABILITY_CHECKED',
            payload: {
              date,
              available: data.data.available
            }
          });
        } else {
          setError(data.error || 'Failed to check availability');
        }
      } catch (err) {
        setError('Network error while checking availability');
      } finally {
        setIsLoading(false);
      }
    }
  }, [config, selectedDeliveryArea, deliveryType, onEvent]);

  // Handle date selection
  const handleDateSelect = useCallback((date: string) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
    checkAvailability(date);
  }, [checkAvailability]);

  // Handle time slot selection
  const handleTimeSlotSelect = useCallback((timeSlotId: number, fee: number = 0) => {
    setSelectedTimeSlot(timeSlotId);
    onEvent?.({
      type: 'DELIVERY_DATE_SELECTED',
      payload: {
        date: selectedDate,
        timeslotId: timeSlotId,
        deliveryType,
        location: selectedLocation,
        expressFee: deliveryType === 'express' ? fee : 0,
        deliveryNotes
      }
    });
  }, [selectedDate, deliveryType, selectedLocation, deliveryNotes, onEvent]);

  // Handle location selection for collection
  const handleLocationSelect = useCallback((location: Location) => {
    setSelectedLocation(location);
  }, []);

  // Reset when delivery area changes
  useEffect(() => {
    if (selectedDate && selectedDeliveryArea && deliveryType !== 'collection') {
      checkAvailability(selectedDate);
    }
  }, [selectedDeliveryArea, deliveryType, checkAvailability]);

  return (
    <div className="delivery-scheduler" style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '400px',
      margin: '0 auto',
      padding: '20px',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      backgroundColor: '#fff'
    }}>
      <h3 style={{
        margin: '0 0 20px 0',
        fontSize: '18px',
        fontWeight: '600',
        color: '#111827'
      }}>
        Delivery Options
      </h3>

      {/* Selected Delivery Type Display */}
      {deliveryType && (
        <div style={{
          marginBottom: '20px',
          padding: '12px',
          backgroundColor: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '6px'
        }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#0c4a6e', marginBottom: '4px' }}>
            Selected: {deliveryType === 'collection' ? 'Collection' : deliveryType === 'express' ? 'Express Delivery' : 'Standard Delivery'}
          </div>
          <button
            onClick={() => {
              setDeliveryType(null);
              setSelectedDate('');
              setSelectedTimeSlot(null);
              setSelectedDeliveryArea(null);
              setAvailability(null);
              setSelectedLocation(null);
              setDeliveryNotes('');
              setError(null);
            }}
            style={{
              padding: '4px 8px',
              background: '#6b7280',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontWeight: '500',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Change
          </button>
        </div>
      )}

      {/* Delivery Type Selection */}
      {!deliveryType && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500' }}>
            {textCustomisations.deliveryType}:
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => handleDeliveryTypeSelect('standard')}
              style={{
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: '#fff',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '14px'
              }}
            >
              <div style={{ fontWeight: '500' }}>Standard Delivery</div>
              <div style={{ color: '#6b7280', fontSize: '12px' }}>
                Delivery to your address
              </div>
            </button>
            {config.allowExpressDelivery && (
              <button
                onClick={() => handleDeliveryTypeSelect('express')}
                style={{
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '14px'
                }}
              >
                <div style={{ fontWeight: '500' }}>Express Delivery</div>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>
                  Faster delivery with premium fee
                </div>
              </button>
            )}
            <button
              onClick={() => handleDeliveryTypeSelect('collection')}
              style={{
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: '#fff',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '14px'
              }}
            >
              <div style={{ fontWeight: '500' }}>Collection</div>
              <div style={{ color: '#6b7280', fontSize: '12px' }}>
                Pick up from our store
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Collection Location Selection */}
      {deliveryType === 'collection' && locations.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500' }}>
            Collection Location:
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {locations.map((location) => (
              <button
                key={location.id}
                onClick={() => handleLocationSelect(location)}
                style={{
                  padding: '12px',
                  border: selectedLocation?.id === location.id ? '2px solid #2563eb' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: selectedLocation?.id === location.id ? '#eff6ff' : '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '14px'
                }}
              >
                <div style={{ fontWeight: '500' }}>{location.name}</div>
                <div style={{ color: '#6b7280', fontSize: '12px' }}>
                  {location.address.address1}
                  {location.address.address2 && <>, {location.address.address2}</>}
                  <br />
                  {location.address.city}, {location.address.province} {location.address.zip}
                  <br />
                  {location.address.country}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Postal Code Checker for Delivery */}
      {deliveryType && deliveryType !== 'collection' && config.enablePostalCodeValidation && (
        <PostalCodeChecker
          config={config}
          onValidation={handlePostalCodeValidation}
        />
      )}

      {/* Error Display */}
      {error && (
        <div style={{
          padding: '12px',
          marginBottom: '16px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          color: '#dc2626',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {/* Date Selector */}
      {deliveryType && (
        deliveryType === 'collection' ? 
          selectedLocation && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                {textCustomisations.deliveryDate}:
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateSelect(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          ) : 
          selectedDeliveryArea && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                {textCustomisations.deliveryDate}:
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateSelect(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          )
      )}

      {/* Time Slot Selector */}
      {selectedDate && (
        deliveryType === 'express' ? 
          expressTimeslots.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                {textCustomisations.timeslot}:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {expressTimeslots.map((timeSlot) => (
                  <button
                    key={timeSlot.id}
                    onClick={() => handleTimeSlotSelect(timeSlot.id, timeSlot.fee)}
                    style={{
                      padding: '12px',
                      border: selectedTimeSlot === timeSlot.id ? '2px solid #2563eb' : '1px solid #d1d5db',
                      borderRadius: '6px',
                      backgroundColor: selectedTimeSlot === timeSlot.id ? '#eff6ff' : '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '14px'
                    }}
                  >
                    <div style={{ fontWeight: '500' }}>
                      {timeSlot.start} - {timeSlot.end}
                      {timeSlot.fee > 0 && (
                        <span style={{ color: '#dc2626', marginLeft: '8px' }}>
                          +${timeSlot.fee} express fee
                        </span>
                      )}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '12px' }}>
                      Express delivery • Cutoff: 06:00 AM
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) :
          availability && availability.available && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                {textCustomisations.timeslot}:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {availability.availableTimeslots.map((timeSlot) => (
                  <button
                    key={timeSlot.id}
                    onClick={() => handleTimeSlotSelect(timeSlot.id, timeSlot.fee)}
                    style={{
                      padding: '12px',
                      border: selectedTimeSlot === timeSlot.id ? '2px solid #2563eb' : '1px solid #d1d5db',
                      borderRadius: '6px',
                      backgroundColor: selectedTimeSlot === timeSlot.id ? '#eff6ff' : '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '14px'
                    }}
                  >
                    <div style={{ fontWeight: '500' }}>
                      {timeSlot.start} - {timeSlot.end}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '12px' }}>
                      {timeSlot.availableSlots} slots available • Cutoff: {timeSlot.cutoffTime}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )
      )}

      {/* Loading State */}
      {isLoading && (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          color: '#6b7280'
        }}>
          Checking availability...
        </div>
      )}

      {/* Delivery Notes */}
      {selectedDate && selectedTimeSlot && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Delivery Notes (Optional):
          </label>
          <textarea
            value={deliveryNotes}
            onChange={(e) => setDeliveryNotes(e.target.value)}
            placeholder="Add any special instructions for delivery..."
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        </div>
      )}

      {/* Summary */}
      {selectedDate && selectedTimeSlot && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '6px'
        }}>
          <h4 style={{
            margin: '0 0 8px 0',
            fontSize: '14px',
            fontWeight: '600',
            color: '#0c4a6e'
          }}>
            {deliveryType === 'collection' ? 'Collection' : 'Delivery'} Summary
          </h4>
          <div style={{ fontSize: '14px', color: '#0c4a6e' }}>
            <div>Type: {deliveryType === 'collection' ? 'Collection' : deliveryType === 'express' ? 'Express Delivery' : 'Standard Delivery'}</div>
            <div>Date: {new Date(selectedDate).toLocaleDateString()}</div>
            {deliveryType === 'collection' && selectedLocation && (
              <div>Location: {selectedLocation.name}</div>
            )}
            {deliveryType !== 'collection' && selectedDeliveryArea && (
              <>
                <div>Area: {selectedDeliveryArea.name}</div>
                <div>Delivery Fee: ${selectedDeliveryArea.deliveryFee}</div>
              </>
            )}
            {deliveryType === 'express' && selectedTimeSlot && (
              (() => {
                const selectedExpressSlot = expressTimeslots.find(slot => slot.id === selectedTimeSlot);
                return selectedExpressSlot && selectedExpressSlot.fee > 0 ? (
                  <div style={{ color: '#dc2626', fontWeight: '600' }}>
                    Express Fee: +${selectedExpressSlot.fee}
                  </div>
                ) : null;
              })()
            )}
            {deliveryNotes && (
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                <div style={{ fontWeight: '500', marginBottom: '4px' }}>Delivery Notes:</div>
                <div style={{ fontSize: '13px', color: '#374151', fontStyle: 'italic' }}>
                  {deliveryNotes}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 