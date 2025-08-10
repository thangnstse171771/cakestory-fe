#!/usr/bin/env node

/**
 * Terminal script để test withdraw endpoints
 * Chạy: node test-withdraw-endpoints.js
 */

const axios = require("axios");

const BASE_URL = "https://cakestory-be.onrender.com/api";
const TEST_TOKEN = ""; // Thay bằng token thực của bạn

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token if available
if (TEST_TOKEN) {
  api.defaults.headers.Authorization = `Bearer ${TEST_TOKEN}`;
}

const testWithdrawEndpoints = async () => {
  console.log("🧪 Testing Withdraw Management Endpoints...\n");
  console.log(`Base URL: ${BASE_URL}`);
  console.log(
    `Token: ${
      TEST_TOKEN ? "✅ Provided" : "❌ No token - will likely get 401"
    }\n`
  );

  const withdrawId = 1; // Test với withdraw ID = 1

  const endpoints = [
    // Confirm endpoints
    {
      method: "PUT",
      url: `/wallet/confirmRequestByAdmin/${withdrawId}`,
      name: "Confirm Withdraw (Original)",
    },
    {
      method: "PUT",
      url: `/wallet/confirm-withdraw/${withdrawId}`,
      name: "Confirm Withdraw (Alt 1)",
    },
    {
      method: "PUT",
      url: `/wallet/withdraw/confirm/${withdrawId}`,
      name: "Confirm Withdraw (Alt 2)",
    },
    {
      method: "PUT",
      url: `/admin/wallet/confirm/${withdrawId}`,
      name: "Confirm Withdraw (Admin path)",
    },
    {
      method: "PUT",
      url: `/wallet/admin/confirm/${withdrawId}`,
      name: "Confirm Withdraw (Wallet admin)",
    },
    {
      method: "POST",
      url: `/wallet/confirmRequestByAdmin/${withdrawId}`,
      name: "Confirm Withdraw (POST)",
    },
    {
      method: "PATCH",
      url: `/wallet/confirmRequestByAdmin/${withdrawId}`,
      name: "Confirm Withdraw (PATCH)",
    },

    // Cancel endpoints
    {
      method: "PUT",
      url: `/wallet/cancel-withdraw/${withdrawId}`,
      name: "Cancel Withdraw (Original)",
    },
    {
      method: "PUT",
      url: `/wallet/cancel/${withdrawId}`,
      name: "Cancel Withdraw (Alt 1)",
    },
    {
      method: "PUT",
      url: `/wallet/withdraw/cancel/${withdrawId}`,
      name: "Cancel Withdraw (Alt 2)",
    },
    {
      method: "PUT",
      url: `/admin/wallet/cancel/${withdrawId}`,
      name: "Cancel Withdraw (Admin path)",
    },
    {
      method: "PUT",
      url: `/wallet/admin/cancel/${withdrawId}`,
      name: "Cancel Withdraw (Wallet admin)",
    },
    {
      method: "PUT",
      url: `/wallet/cancelRequestByAdmin/${withdrawId}`,
      name: "Cancel Request by Admin",
    },
    {
      method: "POST",
      url: `/wallet/cancel-withdraw/${withdrawId}`,
      name: "Cancel Withdraw (POST)",
    },
    {
      method: "PATCH",
      url: `/wallet/cancel-withdraw/${withdrawId}`,
      name: "Cancel Withdraw (PATCH)",
    },

    // Status update endpoints (generic)
    {
      method: "PUT",
      url: `/wallet/withdraw/${withdrawId}/status`,
      name: "Update Withdraw Status",
    },
    {
      method: "PUT",
      url: `/wallet/withdraw/${withdrawId}`,
      name: "Update Withdraw (Generic)",
    },
    {
      method: "PATCH",
      url: `/wallet/withdraw/${withdrawId}`,
      name: "Patch Withdraw (Generic)",
    },
  ];

  const results = [];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n🔍 Testing: ${endpoint.method} ${endpoint.url}`);

      let response;
      const payload = {
        status: endpoint.url.includes("confirm") ? "completed" : "cancelled",
        action: endpoint.url.includes("confirm") ? "approve" : "cancel",
      };

      if (endpoint.method === "GET") {
        response = await api.get(endpoint.url);
      } else if (endpoint.method === "POST") {
        response = await api.post(endpoint.url, payload);
      } else if (endpoint.method === "PUT") {
        response = await api.put(endpoint.url, payload);
      } else if (endpoint.method === "PATCH") {
        response = await api.patch(endpoint.url, payload);
      }

      console.log(`✅ SUCCESS: ${endpoint.name}`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Data:`, response.data);

      results.push({
        ...endpoint,
        success: true,
        status: response.status,
        data: response.data,
      });
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      console.log(`❌ FAILED: ${endpoint.name}`);
      console.log(`   Status: ${status}`);
      console.log(`   Error:`, message);

      results.push({
        ...endpoint,
        success: false,
        status: status,
        error: message,
      });
    }

    // Delay để tránh rate limiting
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 SUMMARY");
  console.log("=".repeat(60));

  const successful = results.filter((r) => r.success);
  const failed404 = results.filter((r) => !r.success && r.status === 404);
  const failed401 = results.filter((r) => !r.success && r.status === 401);
  const failed403 = results.filter((r) => !r.success && r.status === 403);
  const other = results.filter(
    (r) => !r.success && ![404, 401, 403].includes(r.status)
  );

  console.log(`\n✅ Working endpoints (${successful.length}):`);
  successful.forEach((r) => console.log(`   ${r.method} ${r.url} - ${r.name}`));

  console.log(`\n❌ Not Found - 404 (${failed404.length}):`);
  failed404.forEach((r) => console.log(`   ${r.method} ${r.url} - ${r.name}`));

  console.log(`\n🔒 Unauthorized - 401 (${failed401.length}):`);
  failed401.forEach((r) => console.log(`   ${r.method} ${r.url} - ${r.name}`));

  console.log(`\n🚫 Forbidden - 403 (${failed403.length}):`);
  failed403.forEach((r) => console.log(`   ${r.method} ${r.url} - ${r.name}`));

  console.log(`\n❓ Other errors (${other.length}):`);
  other.forEach((r) =>
    console.log(`   ${r.method} ${r.url} - ${r.name} (${r.status})`)
  );

  if (successful.length > 0) {
    console.log(`\n🎉 Found ${successful.length} working endpoint(s)!`);
    console.log("You can use these in your frontend code.");
  } else if (failed401.length > 0 || failed403.length > 0) {
    console.log("\n⚠️  All endpoints require authentication.");
    console.log("Please set TEST_TOKEN variable with a valid admin token.");
  } else {
    console.log("\n💭 No working endpoints found.");
    console.log("Backend might not have implemented these endpoints yet.");
    console.log("Consider implementing them or using a different approach.");
  }
};

// Test with error handling
testWithdrawEndpoints().catch((error) => {
  console.error("❌ Test script failed:", error.message);
  process.exit(1);
});

module.exports = { testWithdrawEndpoints };
