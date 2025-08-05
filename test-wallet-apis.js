#!/usr/bin/env node

/**
 * Test script cho Wallet APIs
 * Chạy: node test-wallet-apis.js
 */

const axios = require("axios");

const BASE_URL = "https://cakestory-be.onrender.com/api";
const TEST_TOKEN = "your_test_token_here"; // Replace với token thực

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${TEST_TOKEN}`,
  },
});

const testWalletAPIs = async () => {
  console.log("🧪 Testing Wallet APIs...\n");

  try {
    // Test 1: Get Balance
    console.log("1️⃣ Testing GET /wallet/balance");
    const balanceResponse = await api.get("/wallet/balance");
    console.log("✅ Balance:", balanceResponse.data);
    console.log("");

    // Test 2: Create Deposit Request
    console.log("2️⃣ Testing POST /wallet/deposit");
    const depositResponse = await api.post("/wallet/deposit", {
      amount: 50000,
    });
    console.log("✅ Deposit created:", depositResponse.data);

    const orderId =
      depositResponse.data.order_code || depositResponse.data.orderCode;
    console.log("📝 Order ID:", orderId);
    console.log("");

    // Test 3: Check Payment Status
    if (orderId) {
      console.log("3️⃣ Testing GET /wallet/payment-status/:orderId");
      const statusResponse = await api.get(`/wallet/payment-status/${orderId}`);
      console.log("✅ Payment status:", statusResponse.data);
      console.log("");
    }

    // Test 4: Test Webhook Endpoint
    console.log("4️⃣ Testing GET /wallet/payos-webhook");
    const webhookResponse = await api.get("/wallet/payos-webhook");
    console.log("✅ Webhook test:", webhookResponse.data);
    console.log("");

    // Test 5: Simulate Webhook (if needed)
    console.log("5️⃣ Testing POST /wallet/payos-webhook (simulation)");
    const webhookSimulation = {
      data: {
        orderCode: orderId || 12345,
        status: "PAID",
        amount: 50000,
        description: "Test payment",
        transactionDateTime: new Date().toISOString(),
      },
    };

    try {
      const webhookResult = await api.post(
        "/wallet/payos-webhook",
        webhookSimulation,
        {
          headers: {
            "x-payos-signature": "test_signature",
          },
        }
      );
      console.log("✅ Webhook simulation:", webhookResult.data);
    } catch (webhookError) {
      console.log(
        "⚠️ Webhook simulation (expected to fail without valid signature):",
        webhookError.response?.data || webhookError.message
      );
    }

    console.log("\n🎉 All tests completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
};

// Utility functions
const printTestInfo = () => {
  console.log(`
🔧 Wallet APIs Test Suite
=========================

Testing the following endpoints:
• GET  /wallet/balance          - Lấy số dư ví
• POST /wallet/deposit          - Tạo yêu cầu nạp tiền  
• GET  /wallet/payment-status   - Kiểm tra trạng thái
• GET  /wallet/payos-webhook    - Test webhook endpoint
• POST /wallet/payos-webhook    - Nhận webhook từ PayOS

Base URL: ${BASE_URL}
Token: ${TEST_TOKEN ? "✅ Set" : "❌ Not set"}

`);
};

// Run tests
printTestInfo();
testWalletAPIs();

module.exports = {
  testWalletAPIs,
  BASE_URL,
};
