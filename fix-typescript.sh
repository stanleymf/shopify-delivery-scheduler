#!/bin/bash

# Fix TypeScript errors in admin dashboard
echo "🔧 Fixing TypeScript errors..."

# Fix the OrderTag type (comment it out)
sed -i '' 's/^type OrderTag = {/\/\/ type OrderTag = {/' apps/admin-dashboard/src/App.tsx
sed -i '' 's/^};$/\/\/ };/' apps/admin-dashboard/src/App.tsx

# Fix the unused orders parameter in AvailabilityCalendar
sed -i '' 's/^    orders,$/\/\/     orders,/' apps/admin-dashboard/src/App.tsx
sed -i '' 's/^    orders: ShopifyOrder\[\];$/\/\/     orders: ShopifyOrder\[\];/' apps/admin-dashboard/src/App.tsx

# Fix the unused handleEdit function in HolidayManagement
sed -i '' 's/^  const handleEdit = (holiday: Holiday) => {/\/\/   const handleEdit = (holiday: Holiday) => {/' apps/admin-dashboard/src/App.tsx
sed -i '' 's/^  };/\/\/   };/' apps/admin-dashboard/src/App.tsx

# Fix the unused applyTagsToOrder function in OrderManagement
sed -i '' 's/^  const applyTagsToOrder = (orderId: number, tags: string\[\]) => {/\/\/   const applyTagsToOrder = (orderId: number, tags: string\[\]) => {/' apps/admin-dashboard/src/App.tsx
sed -i '' 's/^  };/\/\/   };/' apps/admin-dashboard/src/App.tsx

echo "✅ TypeScript errors fixed!" 