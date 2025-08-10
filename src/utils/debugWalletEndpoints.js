/**
 * Script để kiểm tra các endpoint wallet có sẵn trên backend
 * Chạy này trong browser console hoặc tạo component để test
 */

import axiosInstance from "../api/axios";

export const debugWalletEndpoints = async () => {
  console.log("🔍 Debugging Wallet Endpoints...");

  const testEndpoints = [
    // Get endpoints (should work)
    {
      method: "GET",
      url: "/wallet/balance",
      description: "Get wallet balance",
    },
    {
      method: "GET",
      url: "/wallet/withdrawAll-historyAdmin",
      description: "Get all withdraw history",
    },
    {
      method: "GET",
      url: "/wallet/totalWithdrawUser",
      description: "Get total pending withdraw",
    },

    // Admin endpoints we're looking for
    {
      method: "PUT",
      url: "/wallet/confirmRequestByAdmin/1",
      description: "Confirm withdraw request",
    },
    {
      method: "PUT",
      url: "/wallet/cancel-withdraw/1",
      description: "Cancel withdraw request",
    },
    {
      method: "PUT",
      url: "/wallet/confirm-withdraw/1",
      description: "Alternative confirm endpoint",
    },
    {
      method: "PUT",
      url: "/wallet/withdraw/confirm/1",
      description: "Alternative confirm endpoint 2",
    },
    {
      method: "PUT",
      url: "/admin/wallet/confirm/1",
      description: "Admin confirm endpoint",
    },
    {
      method: "PUT",
      url: "/wallet/admin/confirm/1",
      description: "Wallet admin confirm endpoint",
    },
    {
      method: "PUT",
      url: "/wallet/cancel/1",
      description: "Alternative cancel endpoint",
    },
    {
      method: "PUT",
      url: "/wallet/withdraw/cancel/1",
      description: "Alternative cancel endpoint 2",
    },
    {
      method: "PUT",
      url: "/admin/wallet/cancel/1",
      description: "Admin cancel endpoint",
    },
    {
      method: "PUT",
      url: "/wallet/admin/cancel/1",
      description: "Wallet admin cancel endpoint",
    },
    {
      method: "PUT",
      url: "/wallet/cancelRequestByAdmin/1",
      description: "Cancel request by admin",
    },

    // Alternative methods
    {
      method: "POST",
      url: "/wallet/confirmRequestByAdmin/1",
      description: "POST Confirm withdraw request",
    },
    {
      method: "POST",
      url: "/wallet/cancel-withdraw/1",
      description: "POST Cancel withdraw request",
    },
    {
      method: "PATCH",
      url: "/wallet/confirmRequestByAdmin/1",
      description: "PATCH Confirm withdraw request",
    },
    {
      method: "PATCH",
      url: "/wallet/cancel-withdraw/1",
      description: "PATCH Cancel withdraw request",
    },
  ];

  const results = [];

  for (const endpoint of testEndpoints) {
    try {
      console.log(`Testing: ${endpoint.method} ${endpoint.url}`);

      let response;
      if (endpoint.method === "GET") {
        response = await axiosInstance.get(endpoint.url);
      } else if (endpoint.method === "POST") {
        response = await axiosInstance.post(endpoint.url, {});
      } else if (endpoint.method === "PUT") {
        response = await axiosInstance.put(endpoint.url, {});
      } else if (endpoint.method === "PATCH") {
        response = await axiosInstance.patch(endpoint.url, {});
      }

      results.push({
        ...endpoint,
        status: "SUCCESS",
        statusCode: response.status,
        data: response.data,
      });

      console.log(
        `✅ ${endpoint.method} ${endpoint.url} - SUCCESS (${response.status})`
      );
    } catch (error) {
      results.push({
        ...endpoint,
        status: "ERROR",
        statusCode: error.response?.status,
        error: error.response?.data || error.message,
      });

      const statusCode = error.response?.status;
      if (statusCode === 404) {
        console.log(`❌ ${endpoint.method} ${endpoint.url} - NOT FOUND (404)`);
      } else if (statusCode === 401) {
        console.log(
          `🔒 ${endpoint.method} ${endpoint.url} - UNAUTHORIZED (401)`
        );
      } else if (statusCode === 403) {
        console.log(`🚫 ${endpoint.method} ${endpoint.url} - FORBIDDEN (403)`);
      } else if (statusCode === 400) {
        console.log(
          `⚠️  ${endpoint.method} ${endpoint.url} - BAD REQUEST (400)`
        );
      } else if (statusCode === 500) {
        console.log(
          `💥 ${endpoint.method} ${endpoint.url} - SERVER ERROR (500)`
        );
      } else {
        console.log(
          `❓ ${endpoint.method} ${endpoint.url} - ERROR (${statusCode})`
        );
      }
    }

    // Add delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log("\n📊 Summary:");
  console.log("=".repeat(50));

  const successful = results.filter((r) => r.status === "SUCCESS");
  const notFound = results.filter((r) => r.statusCode === 404);
  const authErrors = results.filter(
    (r) => r.statusCode === 401 || r.statusCode === 403
  );
  const otherErrors = results.filter(
    (r) =>
      r.status === "ERROR" &&
      r.statusCode !== 404 &&
      r.statusCode !== 401 &&
      r.statusCode !== 403
  );

  console.log(`✅ Successful endpoints: ${successful.length}`);
  successful.forEach((r) => console.log(`   ${r.method} ${r.url}`));

  console.log(`❌ Not Found (404): ${notFound.length}`);
  notFound.forEach((r) => console.log(`   ${r.method} ${r.url}`));

  console.log(`🔒 Auth Errors (401/403): ${authErrors.length}`);
  authErrors.forEach((r) =>
    console.log(`   ${r.method} ${r.url} (${r.statusCode})`)
  );

  console.log(`❓ Other Errors: ${otherErrors.length}`);
  otherErrors.forEach((r) =>
    console.log(`   ${r.method} ${r.url} (${r.statusCode})`)
  );

  return results;
};

// Component để chạy debug trong UI
export const WalletEndpointDebugger = () => {
  const [results, setResults] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const runDebug = async () => {
    setLoading(true);
    try {
      const debugResults = await debugWalletEndpoints();
      setResults(debugResults);
    } catch (error) {
      console.error("Debug error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Wallet Endpoint Debugger</h2>

      <button
        onClick={runDebug}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Running Debug..." : "Debug Wallet Endpoints"}
      </button>

      {results && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Results:</h3>
          <div className="space-y-2">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-2 rounded ${
                  result.status === "SUCCESS"
                    ? "bg-green-100 border-green-300"
                    : result.statusCode === 404
                    ? "bg-red-100 border-red-300"
                    : result.statusCode === 401 || result.statusCode === 403
                    ? "bg-yellow-100 border-yellow-300"
                    : "bg-gray-100 border-gray-300"
                } border`}
              >
                <div className="font-mono text-sm">
                  {result.method} {result.url}
                </div>
                <div className="text-xs text-gray-600">
                  {result.status === "SUCCESS"
                    ? `✅ ${result.statusCode}`
                    : `❌ ${result.statusCode} - ${
                        result.error?.message || "Error"
                      }`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default debugWalletEndpoints;
