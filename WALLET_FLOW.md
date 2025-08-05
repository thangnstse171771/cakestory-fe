# Wallet Top-up Flow Implementation

## Tổng quan

Implementation của luồng nạp tiền vào ví (Wallet Top-up) sử dụng PayOS payment gateway.

## Flow nạp tiền

### 1. User tạo yêu cầu nạp tiền (Deposit Request)

**API:** `POST /api/wallet/deposit`

**Request Body:**

```json
{
  "amount": 200000
}
```

**Response:**

```json
{
  "payment_url": "https://payos.vn/payment/...",
  "order_code": "ORD123456",
  "checksum": "...",
  "amount": 200000,
  "description": "Nạp 200000 VNĐ"
}
```

### 2. User thực hiện thanh toán qua PayOS

- User được chuyển hướng đến PayOS Payment URL
- Thực hiện thanh toán qua các phương thức: Chuyển khoản/MoMo/ZaloPay
- PayOS xử lý giao dịch

### 3. PayOS gửi Webhook về kết quả (Backend processing)

**API:** `POST /api/wallet/payos-webhook`

**Headers:**

```
x-payos-signature: <HMAC_SHA256_SIGNATURE>
```

**Request Body:**

```json
{
  "data": {
    "orderCode": 12345,
    "status": "PAID",
    "amount": 200000,
    "description": "Nạp 200000 VNĐ",
    "transactionDateTime": "2024-01-15T10:30:02"
  }
}
```

**Backend xử lý:**

- Kiểm tra chữ ký hợp lệ
- Xác thực thông tin giao dịch
- Cập nhật số dư ví nếu `status === "PAID"`

### 4. Frontend polling status

**API:** `GET /api/wallet/payment-status/{orderId}`

**Response:**

```json
{
  "status": "PAID" | "PENDING" | "CANCELLED" | "FAILED",
  "amount": 200000,
  "orderCode": "ORD123456"
}
```

## Cấu trúc file

### API Services

- `src/api/wallet.js` - Wallet API services
- `src/api/axios.js` - Axios configuration và base APIs

### Components

- `src/pages/Wallet/UserWallet.jsx` - Main wallet component
- `src/components/PaymentModal.jsx` - Payment modal component
- `src/hooks/usePaymentStatus.js` - Payment status polling hook

### Key Features

#### 1. Real-time Status Updates

- Polling mỗi 5 giây để kiểm tra trạng thái thanh toán
- Tự động dừng polling khi có kết quả cuối cùng
- Timer countdown 5 phút cho mỗi giao dịch

#### 2. Error Handling

- Retry mechanism cho failed payments
- Timeout handling (auto-expire after 5 minutes)
- User-friendly error messages

#### 3. Payment Status Flow

```
PENDING -> PAID (Success)
        -> CANCELLED (User cancelled)
        -> FAILED (Payment failed)
        -> EXPIRED (Timeout)
```

#### 4. Security Features

- HMAC-SHA256 webhook signature verification
- Amount validation
- Duplicate payment prevention

## Usage Example

```jsx
import { walletAPI } from "./api/wallet";

// Tạo yêu cầu nạp tiền
const createPayment = async (amount) => {
  try {
    const result = await walletAPI.createDepositRequest(amount);
    window.open(result.payment_url, "_blank");
  } catch (error) {
    console.error("Payment creation failed:", error);
  }
};

// Kiểm tra trạng thái
const checkStatus = async (orderId) => {
  const status = await walletAPI.checkPaymentStatus(orderId);
  console.log("Payment status:", status);
};
```

## Environment Variables

```env
PAYOS_CLIENT_ID=your_client_id
PAYOS_API_KEY=your_api_key
PAYOS_CHECKSUM_KEY=your_checksum_key
PAYOS_WEBHOOK_URL=https://your-domain.com/api/wallet/payos-webhook
```

## Testing

- Sử dụng PayOS sandbox environment cho development
- Test webhook endpoint: `GET /api/wallet/payos-webhook`
- Verify webhook signature trong production

## Security Considerations

1. Luôn validate webhook signature
2. Kiểm tra amount và orderCode
3. Prevent duplicate processing
4. Log tất cả giao dịch
5. Rate limiting cho API endpoints
