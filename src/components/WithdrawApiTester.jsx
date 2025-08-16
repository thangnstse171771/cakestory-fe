import React, { useState } from "react";
import { confirmWithdrawRequest, cancelWithdrawRequest } from "../api/axios";

const WithdrawApiTester = () => {
  const [withdrawId, setWithdrawId] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const testConfirmAPI = async () => {
    if (!withdrawId) {
      setResult("Please enter a withdraw ID");
      return;
    }

    setLoading(true);
    setResult("Testing confirm API...");

    try {
      const response = await confirmWithdrawRequest(withdrawId);
      setResult(`✅ Confirm API Success: ${JSON.stringify(response, null, 2)}`);
    } catch (error) {
      setResult(`❌ Confirm API Error: 
        Status: ${error.response?.status}
        Message: ${error.response?.data?.message || error.message}
        URL: ${error.config?.url}
        Full Error: ${JSON.stringify(error.response?.data, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  const testCancelAPI = async () => {
    if (!withdrawId) {
      setResult("Please enter a withdraw ID");
      return;
    }

    setLoading(true);
    setResult("Testing cancel API...");

    try {
      const response = await cancelWithdrawRequest(withdrawId);
      setResult(`✅ Cancel API Success: ${JSON.stringify(response, null, 2)}`);
    } catch (error) {
      setResult(`❌ Cancel API Error: 
        Status: ${error.response?.status}
        Message: ${error.response?.data?.message || error.message}
        URL: ${error.config?.url}
        Full Error: ${JSON.stringify(error.response?.data, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Withdraw API Tester</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Withdraw ID:</label>
        <input
          type="text"
          value={withdrawId}
          onChange={(e) => setWithdrawId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter withdraw ID (e.g., 1, 2, 3)"
        />
      </div>

      <div className="flex gap-4 mb-4">
        <button
          onClick={testConfirmAPI}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Confirm API"}
        </button>

        <button
          onClick={testCancelAPI}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Cancel API"}
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded-md">
        <h3 className="font-medium mb-2">Result:</h3>
        <pre className="whitespace-pre-wrap text-sm">
          {result || "No test run yet"}
        </pre>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>
          <strong>Expected endpoints:</strong>
        </p>
        <p>• Confirm: PUT /api/wallet/confirmRequestByAdmin/{"{id}"}</p>
        <p>• Cancel: PUT /api/wallet/cancel-withdraw/{"{id}"}</p>
      </div>
    </div>
  );
};

export default WithdrawApiTester;
