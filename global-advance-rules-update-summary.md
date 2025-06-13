# 🔄 Global Advance Order Rules: NEW "+ Function" Logic

## ✅ **Logic Change Implemented**

The global advance order rules now work as a **"+ function"** instead of advance notice required.

---

## 🆕 **New Logic**

### **Before (Old Logic)**
- **Rule**: 14 days advance required
- **Result**: Blocks dates less than 14 days from today
- **Example**: If today is Jan 1, blocks Jan 1-14, allows Jan 15+

### **After (New Logic)**  
- **Rule**: 120 days future booking
- **Result**: Only allows dates 120+ days from today
- **Example**: If today is Jan 1, blocks Jan 1-Apr 30, allows May 1+ (Jan 1 + 120 days)

---

## 🔧 **Updated Components**

### **1. Calendar Integration Logic**
```typescript
// NEW LOGIC: Block if date is BEFORE (current date + globalAdvanceDays)
if (daysDifference < rule.globalAdvanceDays) {
  return true; // Block if date is before (today + X days)
}
```

### **2. Blocking Reason Messages**
```typescript
// Shows available from date instead of advance required
const availableDate = new Date(today);
availableDate.setDate(today.getDate() + rule.globalAdvanceDays);
return `Available from ${availableDateStr} onwards (${rule.name}: +${rule.globalAdvanceDays} days)`;
```

### **3. Updated UI Labels**
- **Form Field**: "Future Days Required" 
- **Help Text**: "Days to add to current date (e.g., 120 = available from today +120 days)"
- **Display Text**: "120 days to add (current + 120 days = available)"

### **4. Updated Sample Data**
- **Standard Future Booking**: 120 days (+4 months)
- **Express Future Booking**: 90 days (+3 months)

---

## 📊 **Example Scenarios**

### **Scenario 1: 120-Day Rule**
- **Today**: January 1, 2025
- **Rule**: 120 days future booking
- **Available From**: May 1, 2025 (Jan 1 + 120 days)
- **Blocked**: Jan 1 - Apr 30
- **Message**: "Available from 2025-05-01 onwards (Standard Future Booking: +120 days)"

### **Scenario 2: 90-Day Express Rule**
- **Today**: January 1, 2025  
- **Rule**: 90 days express future booking
- **Available From**: April 1, 2025 (Jan 1 + 90 days)
- **Blocked**: Jan 1 - Mar 31
- **Message**: "Available from 2025-04-01 onwards (Express Future Booking: +90 days)"

---

## 🎯 **Calendar Visual Impact**

### **Before**
- **Red dates**: Calendar blocked
- **Orange dates**: Less than X days advance (blocked)
- **Available**: X+ days from today

### **After** 
- **Red dates**: Calendar blocked
- **Orange dates**: Less than X days in future (blocked)
- **Available**: X+ days from today *(same result, different reasoning)*

---

## 💡 **Business Use Cases**

### **Perfect For**
- **Seasonal Products**: "Christmas flowers available from September onwards"
- **Event Planning**: "Wedding bookings open 6 months in advance"
- **High-Demand Periods**: "Valentine's orders start 4 months early"
- **Inventory Planning**: "Special collections available far in advance"

### **Example Rules**
- **Wedding Flowers**: 180 days (+6 months booking window)
- **Holiday Collections**: 120 days (+4 months for planning) 
- **Corporate Events**: 90 days (+3 months advance booking)
- **Standard Deliveries**: 30 days (+1 month future window)

---

## 🚀 **Implementation Status**

✅ **Core Logic Updated**: `isDateBlockedByAdvanceRules`  
✅ **Blocking Messages Updated**: `getDateBlockingReason`  
✅ **UI Labels Updated**: Form fields and help text  
✅ **Sample Data Updated**: 120 and 90 day examples  
✅ **Calendar Integration**: Orange dates show + function blocks  
✅ **Tooltip Messages**: Show "Available from X onwards"  

---

## 🧪 **Testing the New Logic**

### **Test Steps**
1. **Create Rule**: "Summer Booking" with 90 days
2. **Check Calendar**: Dates within 90 days should be orange
3. **Hover Orange Date**: Should show "Available from [date +90 days] onwards"
4. **Verify Logic**: Only dates 90+ days from today should be selectable

### **Expected Results**
- **Today**: December 1, 2024
- **90-Day Rule**: Available from March 1, 2025+
- **Calendar**: Dec 1 - Feb 28 = Orange (blocked)
- **Calendar**: March 1+ = Available (green/white)

---

## ✨ **Ready for Production!**

The global advance order rules now work as a **"+ function"** where:
- **120 days** = Available from today +120 days onwards
- **Perfect for long-term booking windows**
- **Ideal for seasonal/event-based products**
- **Maintains all existing calendar integration**

🎯 **New Logic: Current Date + X Days = Available!** 🚀 