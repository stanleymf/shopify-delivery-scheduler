import React, { useState, useMemo } from 'react';
import type { WidgetConfig } from '@delivery-scheduler/shared-types';

interface DateSelectorProps {
  config: WidgetConfig;
  selectedDate: string;
  onDateSelect: (date: string) => void;
  disabled?: boolean;
}

export function DateSelector({ config, selectedDate, onDateSelect, disabled }: DateSelectorProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Generate available dates
  const availableDates = useMemo(() => {
    const dates: Array<{ date: string; day: number; isToday: boolean; isPast: boolean; isTooFar: boolean }> = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const futureLimit = new Date();
    futureLimit.setDate(futureLimit.getDate() + config.maxFutureDays);

    const startDate = new Date(currentMonth);
    const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const isToday = d.getTime() === today.getTime();
      const isPast = d < today;
      const isTooFar = d > futureLimit;

      dates.push({
        date: dateStr,
        day: d.getDate(),
        isToday,
        isPast,
        isTooFar
      });
    }

    return dates;
  }, [currentMonth, config.maxFutureDays]);

  const handleDateClick = (date: string) => {
    if (!disabled) {
      onDateSelect(date);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{
        display: 'block',
        marginBottom: '8px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151'
      }}>
        Select Delivery Date
      </label>

      <div style={{
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        overflow: 'hidden'
      }}>
        {/* Month Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px',
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #d1d5db'
        }}>
          <button
            type="button"
            onClick={goToPreviousMonth}
            disabled={disabled}
            style={{
              background: 'none',
              border: 'none',
              cursor: disabled ? 'not-allowed' : 'pointer',
              padding: '4px 8px',
              color: disabled ? '#9ca3af' : '#374151'
            }}
          >
            ←
          </button>
          <span style={{ fontWeight: '600', fontSize: '16px' }}>
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button
            type="button"
            onClick={goToNextMonth}
            disabled={disabled}
            style={{
              background: 'none',
              border: 'none',
              cursor: disabled ? 'not-allowed' : 'pointer',
              padding: '4px 8px',
              color: disabled ? '#9ca3af' : '#374151'
            }}
          >
            →
          </button>
        </div>

        {/* Calendar Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '1px',
          backgroundColor: '#d1d5db'
        }}>
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} style={{
              padding: '8px',
              textAlign: 'center',
              backgroundColor: '#f9fafb',
              fontSize: '12px',
              fontWeight: '600',
              color: '#6b7280'
            }}>
              {day}
            </div>
          ))}

          {/* Date cells */}
          {availableDates.map(({ date, day, isToday, isPast, isTooFar }) => {
            const isSelected = date === selectedDate;
            const isDisabled = disabled || isPast || isTooFar;

            return (
              <button
                key={date}
                type="button"
                onClick={() => handleDateClick(date)}
                disabled={isDisabled}
                style={{
                  padding: '12px 8px',
                  border: 'none',
                  backgroundColor: isSelected ? '#2563eb' : '#fff',
                  color: isSelected ? '#fff' : isDisabled ? '#9ca3af' : '#111827',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: isToday ? '600' : '400',
                  position: 'relative'
                }}
              >
                {day}
                {isToday && !isSelected && (
                  <div style={{
                    position: 'absolute',
                    bottom: '2px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '4px',
                    height: '4px',
                    backgroundColor: '#2563eb',
                    borderRadius: '50%'
                  }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{
        marginTop: '12px',
        fontSize: '12px',
        color: '#6b7280',
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '4px', height: '4px', backgroundColor: '#2563eb', borderRadius: '50%' }} />
          Today
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#2563eb', borderRadius: '2px' }} />
          Selected
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#f3f4f6', borderRadius: '2px' }} />
          Available
        </div>
      </div>
    </div>
  );
} 