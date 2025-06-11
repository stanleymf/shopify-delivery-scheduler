import React from 'react';
import type { AvailabilityResponse } from '@delivery-scheduler/shared-types';

interface TimeSlotSelectorProps {
  availability: AvailabilityResponse;
  selectedTimeSlot: number | null;
  onTimeSlotSelect: (timeSlotId: number) => void;
  disabled?: boolean;
}

export function TimeSlotSelector({ 
  availability, 
  selectedTimeSlot, 
  onTimeSlotSelect, 
  disabled 
}: TimeSlotSelectorProps) {
  if (!availability.available) {
    return (
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151'
        }}>
          Delivery Time
        </label>
        <div style={{
          padding: '16px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          color: '#dc2626',
          fontSize: '14px'
        }}>
          {availability.reason || 'No delivery available for this date'}
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{
        display: 'block',
        marginBottom: '8px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151'
      }}>
        Select Delivery Time
      </label>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {availability.availableTimeslots.map((timeSlot) => {
          const isSelected = selectedTimeSlot === timeSlot.id;
          const isAvailable = timeSlot.availableSlots > 0;

          return (
            <button
              key={timeSlot.id}
              type="button"
              onClick={() => onTimeSlotSelect(timeSlot.id)}
              disabled={disabled || !isAvailable}
              style={{
                padding: '12px 16px',
                border: '1px solid',
                borderColor: isSelected ? '#2563eb' : isAvailable ? '#d1d5db' : '#e5e7eb',
                borderRadius: '6px',
                backgroundColor: isSelected ? '#2563eb' : isAvailable ? '#fff' : '#f9fafb',
                color: isSelected ? '#fff' : isAvailable ? '#111827' : '#9ca3af',
                cursor: disabled || !isAvailable ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                textAlign: 'left',
                transition: 'all 0.2s',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontWeight: '600' }}>
                  {timeSlot.start} - {timeSlot.end}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: isSelected ? 'rgba(255,255,255,0.8)' : '#6b7280',
                  marginTop: '2px'
                }}>
                  Cutoff: {timeSlot.cutoffTime}
                </div>
              </div>
              <div style={{
                fontSize: '12px',
                color: isSelected ? 'rgba(255,255,255,0.8)' : '#6b7280'
              }}>
                {isAvailable ? `${timeSlot.availableSlots} slots left` : 'Fully booked'}
              </div>
            </button>
          );
        })}
      </div>

      {availability.availableTimeslots.length === 0 && (
        <div style={{
          padding: '16px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          color: '#dc2626',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          No time slots available for this date
        </div>
      )}
    </div>
  );
} 