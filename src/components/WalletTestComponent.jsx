import React, { useState } from "react";
import { walletAPI } from "../api/wallet";

const WalletTestComponent = () => {
  const [amount, setAmount] = useState(10000);
  const [orderId, setOrderId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testCreateDeposit = async () => {
    setLoading(true);
    try {
      const response = await walletAPI.createDepositRequest(amount);
      setResult(response);
      setOrderId(response.order_code || response.orderCode);
      console.log("Deposit created:", response);
    } catch (error) {
      console.error("Error creating deposit:", error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testCheckStatus = async () => {
    if (!orderId) {
      alert("Vui lòng tạo deposit trước");
      return;
    }

    setLoading(true);
    try {
      const response = await walletAPI.checkPaymentStatus(orderId);
      setResult(response);
      console.log("Payment status:", response);
    } catch (error) {
      console.error("Error checking status:", error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testGetBalance = async () => {
    setLoading(true);
    try {
      const response = await walletAPI.getBalance();
      setResult(response);
      console.log("Balance:", response);
    } catch (error) {
      console.error("Error getting balance:", error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testWebhookEndpoint = async () => {
    setLoading(true);
    try {
      const response = await walletAPI.testWebhookEndpoint();
      setResult(response);
      console.log("Webhook test:", response);
    } catch (error) {
      console.error("Error testing webhook:", error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Wallet API Test</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Amount (VND):
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="border rounded px-3 py-2 w-full"
            min="10000"
            max="20000000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Order ID:</label>
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="border rounded px-3 py-2 w-full"
            placeholder="Sẽ được tự động điền sau khi tạo deposit"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={testCreateDeposit}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            1. Create Deposit
          </button>

          <button
            onClick={testCheckStatus}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            2. Check Status
          </button>

          <button
            onClick={testGetBalance}
            disabled={loading}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
          >
            3. Get Balance
          </button>

          <button
            onClick={testWebhookEndpoint}
            disabled={loading}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:opacity-50"
          >
            4. Test Webhook
          </button>
        </div>

        {result && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Result:</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-yellow-50 rounded">
        <h3 className="font-semibold mb-2">Test Flow:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Nhập amount và click "Create Deposit"</li>
          <li>Copy payment_url và mở trong tab mới để thanh toán</li>
          <li>Click "Check Status" để kiểm tra trạng thái</li>
          <li>Click "Get Balance" để xem số dư ví</li>
        </ol>
      </div>
    </div>
  );
};

export default WalletTestComponent;
