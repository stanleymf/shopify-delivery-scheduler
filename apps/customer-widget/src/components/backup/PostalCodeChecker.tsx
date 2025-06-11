import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { 
  WidgetConfig, 
  PostalCodeValidationResponse,
  PostalCodeAutoCompleteResponse 
} from '@delivery-scheduler/shared-types';

interface PostalCodeCheckerProps {
  config: WidgetConfig;
  onValidation: (response: PostalCodeValidationResponse) => void;
}

export function PostalCodeChecker({ config, onValidation }: PostalCodeCheckerProps) {
  const [postalCode, setPostalCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [suggestions, setSuggestions] = useState<PostalCodeAutoCompleteResponse['suggestions']>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [lastValidation, setLastValidation] = useState<PostalCodeValidationResponse | null>(null);
  
  const debounceRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced auto-complete search
  const searchSuggestions = useCallback(async (partialCode: string) => {
    if (!config.enablePostalCodeAutoComplete || partialCode.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(`${config.apiUrl}/postal-code/autocomplete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partialCode,
          shopDomain: config.shopDomain,
          limit: config.maxPostalCodeSuggestions
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuggestions(data.data.suggestions);
        setShowSuggestions(data.data.suggestions.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Auto-complete error:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [config]);

  // Validate postal code
  const validatePostalCode = useCallback(async (code: string) => {
    if (!code.trim()) {
      setLastValidation(null);
      return;
    }

    setIsValidating(true);
    setShowSuggestions(false);

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
        const validationResponse: PostalCodeValidationResponse = data.data;
        setLastValidation(validationResponse);
        onValidation(validationResponse);
      } else {
        const errorResponse: PostalCodeValidationResponse = {
          postalCode: code,
          isValid: false,
          error: data.error || 'Validation failed'
        };
        setLastValidation(errorResponse);
        onValidation(errorResponse);
      }
    } catch (error) {
      const errorResponse: PostalCodeValidationResponse = {
        postalCode: code,
        isValid: false,
        error: 'Network error during validation'
      };
      setLastValidation(errorResponse);
      onValidation(errorResponse);
    } finally {
      setIsValidating(false);
    }
  }, [config, onValidation]);

  // Handle input change with debounced auto-complete
  const handleInputChange = useCallback((value: string) => {
    setPostalCode(value);
    
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounce for auto-complete
    if (config.enablePostalCodeAutoComplete) {
      debounceRef.current = setTimeout(() => {
        searchSuggestions(value);
      }, config.postalCodeAutoCompleteDelay);
    }

    // Clear suggestions if input is too short
    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [config, searchSuggestions]);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: PostalCodeAutoCompleteResponse['suggestions'][0]) => {
    setPostalCode(suggestion.postalCode);
    setSuggestions([]);
    setShowSuggestions(false);
    validatePostalCode(suggestion.postalCode);
  }, [validatePostalCode]);

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    validatePostalCode(postalCode);
  }, [postalCode, validatePostalCode]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{
        display: 'block',
        marginBottom: '8px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151'
      }}>
        Postal Code
      </label>
      
      <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          value={postalCode}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Enter your postal code"
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '16px',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
        />
        
        {isValidating && (
          <div style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#6b7280'
          }}>
            Validating...
          </div>
        )}

        {/* Validation Status */}
        {lastValidation && !isValidating && (
          <div style={{
            marginTop: '8px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {lastValidation.isValid ? (
              <>
                <span style={{ color: '#059669' }}>✓</span>
                <span style={{ color: '#059669' }}>
                  Valid - {lastValidation.deliveryArea?.name}
                  {lastValidation.deliveryArea && ` ($${lastValidation.deliveryArea.deliveryFee} delivery)`}
                </span>
              </>
            ) : (
              <>
                <span style={{ color: '#dc2626' }}>✗</span>
                <span style={{ color: '#dc2626' }}>
                  {lastValidation.error || 'Invalid postal code'}
                </span>
              </>
            )}
          </div>
        )}

        {/* Auto-complete Suggestions */}
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
            zIndex: 1000,
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionSelect(suggestion)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  borderBottom: index < suggestions.length - 1 ? '1px solid #f3f4f6' : 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ fontWeight: '500' }}>
                  {suggestion.postalCode}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {suggestion.city}, {suggestion.province}
                  {suggestion.deliveryArea && ` - $${suggestion.deliveryArea.deliveryFee} delivery`}
                </div>
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
} 