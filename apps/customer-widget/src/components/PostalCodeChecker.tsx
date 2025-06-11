import { useState, useRef, useCallback } from 'react';

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

type DeliveryAreaResponse = {
  id: number;
  name: string;
  deliveryFee: number;
  minimumOrder: number;
  estimatedDeliveryTime: string;
};

type PostalCodeValidationResponse = {
  postalCode: string;
  isValid: boolean;
  deliveryArea?: DeliveryAreaResponse;
  error?: string;
  suggestions?: string[];
};

interface PostalCodeCheckerProps {
  config: WidgetConfig;
  onValidation: (response: PostalCodeValidationResponse) => void;
}

export function PostalCodeChecker({ config, onValidation }: PostalCodeCheckerProps) {
  const [postalCode, setPostalCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<number>();

  const validatePostalCode = useCallback(async (code: string) => {
    if (!code || code.length < 6) {
      setError(null);
      setSuggestions([]);
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const response = await fetch(`${config.apiUrl}/postal-code/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postalCode: code,
          shopDomain: config.shopDomain
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const validationResponse: PostalCodeValidationResponse = {
          postalCode: code,
          isValid: data.data.isValid,
          deliveryArea: data.data.deliveryArea,
          error: data.data.error,
          suggestions: data.data.suggestions
        };
        
        onValidation(validationResponse);
        
        if (data.data.isValid) {
          setError(null);
          setSuggestions([]);
        } else {
          setError(data.data.error || 'Invalid postal code');
          setSuggestions(data.data.suggestions || []);
        }
      } else {
        setError(data.error || 'Validation failed');
        setSuggestions([]);
      }
    } catch (err) {
      setError('Network error during validation');
      setSuggestions([]);
    } finally {
      setIsValidating(false);
    }
  }, [config, onValidation]);

  const handlePostalCodeChange = useCallback((value: string) => {
    setPostalCode(value);
    setShowSuggestions(false);
    
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Debounce validation
    debounceRef.current = window.setTimeout(() => {
      validatePostalCode(value);
    }, config.postalCodeAutoCompleteDelay);
  }, [validatePostalCode, config.postalCodeAutoCompleteDelay]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setPostalCode(suggestion);
    setShowSuggestions(false);
    validatePostalCode(suggestion);
  }, [validatePostalCode]);

  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ 
        display: 'block', 
        marginBottom: '8px', 
        fontWeight: '500',
        color: '#374151'
      }}>
        Postal Code
      </label>
      
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={postalCode}
          onChange={(e) => handlePostalCodeChange(e.target.value)}
          placeholder="Enter your postal code"
          style={{
            width: '100%',
            padding: '8px 12px',
            border: error ? '1px solid #ef4444' : '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: '#fff'
          }}
          maxLength={6}
        />
        
        {isValidating && (
          <div style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#6b7280',
            fontSize: '12px'
          }}>
            Validating...
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          marginTop: '8px',
          color: '#ef4444',
          fontSize: '12px'
        }}>
          {error}
        </div>
      )}

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          zIndex: 10,
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                backgroundColor: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 