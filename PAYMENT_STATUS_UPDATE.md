# Payment Status System Update

## Changes Made

### Payment Status Workflow
**New Flow**: Pending → Paid → Done

- **Pending**: Payment created but not yet processed
- **Paid**: Admin marks payment as paid (money transferred)
- **Done**: Admin confirms payment is complete and closed
- **Failed**: Payment failed (can be changed back)
- **Cancelled**: Payment cancelled

### Admin Controls
- Admin can change payment status to ANY status (pending, paid, done, failed, cancelled)
- Confirmation dialog appears before status change
- Status changes are tracked with `paid_at` and `paid_by` fields

### Frontend Updates (`frontend/src/pages/Payments.jsx`)

**Status Colors**:
- Pending: Yellow
- Paid: Blue
- Done: Green
- Failed: Red
- Cancelled: Gray

**Dashboard Cards**: Now shows 4 cards
1. Total Records
2. Pending Count
3. Paid Count
4. Done Count

**Status Dropdown** (Admin only):
- Shows all 5 status options
- Confirmation dialog before change
- Displays paid date below dropdown

### Backend Updates

**`backend/controllers/paymentController.js`**:
- `updatePaymentStatus()` now accepts all 5 statuses
- Sets `paid_at` and `paid_by` when status changes to 'paid' or 'done'
- Resets `paid_at` when reverting to 'pending'
- Preserves `paid_at` when changing from 'paid' to 'done'

**`backend/controllers/dashboardController.js`**:
- Added separate counts for paid and done payments
- Dashboard stats now include `paid_payments` and `done_payments`

## Usage

### For Admin:
1. Payment created → Status: **Pending**
2. Admin transfers money → Change to **Paid**
3. Payment confirmed complete → Change to **Done**
4. If issue occurs → Change to **Failed** or **Cancelled**
5. Can revert to **Pending** if needed

### API Endpoint
```
PATCH /api/payments/:id/status
Body: { status: "paid" | "done" | "pending" | "failed" | "cancelled" }
```

### Testing
1. Restart backend: `cd backend && npm run dev`
2. Refresh frontend: http://localhost:3000
3. Go to Payments page
4. Admin will see dropdown with all status options
5. Change status and confirm
6. Dashboard will update counts automatically

## Database
No schema changes needed. The `payment_status` ENUM already supports all 5 values.
