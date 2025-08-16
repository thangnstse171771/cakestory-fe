import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Wallet,
  DollarSign,
  CreditCard,
  Building,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Search,
  Info,
  History,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { createWithdrawRequest, fetchWalletBalance } from "../../api/axios";
import { useNavigate } from "react-router-dom";

const SUPPORTED_BANKS = [
  {
    code: "VCB",
    name: "Vietcombank",
    fullName: "Ngân hàng TMCP Ngoại thương Việt Nam",
    logo: "https://api.vietqr.io/img/VCB.png",
    color: "#007A33",
  },
  {
    code: "TCB",
    name: "Techcombank",
    fullName: "Ngân hàng TMCP Kỹ thương Việt Nam",
    logo: "https://api.vietqr.io/img/TCB.png",
    color: "#E31E24",
  },
  {
    code: "VTB",
    name: "Vietinbank",
    fullName: "Ngân hàng TMCP Công thương Việt Nam",
    logo: "https://img.vietqr.io/image/vietinbank-113366668888-compact.jpg",
    color: "#003594",
  },
  {
    code: "BIDV",
    name: "BIDV",
    fullName: "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam",
    logo: "https://api.vietqr.io/img/BIDV.png",
    color: "#005580",
  },
  {
    code: "AGB",
    name: "Agribank",
    fullName: "Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam",
    logo: "https://www.inlogo.vn/wp-content/uploads/2023/04/logo-agribank.png",
    color: "#1B5E20",
  },
  {
    code: "ACB",
    name: "ACB",
    fullName: "Ngân hàng TMCP Á Châu",
    logo: "https://api.vietqr.io/img/ACB.png",
    color: "#1E88E5",
  },
  {
    code: "TPB",
    name: "TPBank",
    fullName: "Ngân hàng TMCP Tiên Phong",
    logo: "https://api.vietqr.io/img/TPB.png",
    color: "#FFB400",
  },
  {
    code: "MB",
    name: "MBBank",
    fullName: "Ngân hàng TMCP Quân đội",
    logo: "https://api.vietqr.io/img/MB.png",
    color: "#D32F2F",
  },
  {
    code: "STB",
    name: "Sacombank",
    fullName: "Ngân hàng TMCP Sài Gòn Thương tín",
    logo: "https://api.vietqr.io/img/STB.png",
    color: "#1976D2",
  },
  {
    code: "VPB",
    name: "VPBank",
    fullName: "Ngân hàng TMCP Việt Nam Thịnh vượng",
    logo: "https://api.vietqr.io/img/VPB.png",
    color: "#4CAF50",
  },
  {
    code: "OCB",
    name: "OCB",
    fullName: "Ngân hàng TMCP Phương Đông",
    logo: "https://api.vietqr.io/img/OCB.png",
    color: "#FF5722",
  },
  {
    code: "SHB",
    name: "SHB",
    fullName: "Ngân hàng TMCP Sài Gòn - Hà Nội",
    logo: "https://api.vietqr.io/img/SHB.png",
    color: "#1565C0",
  },
  {
    code: "EIB",
    name: "Eximbank",
    fullName: "Ngân hàng TMCP Xuất nhập khẩu Việt Nam",
    logo: "https://api.vietqr.io/img/EIB.png",
    color: "#2E7D32",
  },
  {
    code: "MSB",
    name: "MSB",
    fullName: "Ngân hàng TMCP Hàng Hải",
    logo: "https://api.vietqr.io/img/MSB.png",
    color: "#FF9800",
  },
  {
    code: "VAB",
    name: "VietABank",
    fullName: "Ngân hàng TMCP Việt Á",
    logo: "https://api.vietqr.io/img/VAB.png",
    color: "#673AB7",
  },
  {
    code: "NAB",
    name: "NamABank",
    fullName: "Ngân hàng TMCP Nam Á",
    logo: "https://api.vietqr.io/img/NAB.png",
    color: "#009688",
  },
  {
    code: "IVB",
    name: "IndovinaBank",
    fullName: "Ngân hàng TNHH Indovina",
    logo: "https://api.vietqr.io/img/IVB.png",
    color: "#795548",
  },
  {
    code: "SCB",
    name: "SCB",
    fullName: "Ngân hàng TMCP Sài Gòn",
    logo: "https://api.vietqr.io/img/SCB.png",
    color: "#E91E63",
  },
  {
    code: "VIB",
    name: "VIB",
    fullName: "Ngân hàng TMCP Quốc tế Việt Nam",
    logo: "https://api.vietqr.io/img/VIB.png",
    color: "#9C27B0",
  },
  {
    code: "SEA",
    name: "SeABank",
    fullName: "Ngân hàng TMCP Đông Nam Á",
    logo: "https://api.vietqr.io/img/SEAB.png",
    color: "#3F51B5",
  },
  {
    code: "HDBank",
    name: "HDBank",
    fullName: "Ngân hàng TMCP Phát triển Thành phố Hồ Chí Minh",
    logo: "https://api.vietqr.io/img/HDB.png",
    color: "#FF5722",
  },
  {
    code: "LPB",
    name: "LienVietPostBank",
    fullName: "Ngân hàng TMCP Bưu điện Liên Việt",
    logo: "https://api.vietqr.io/img/LPB.png",
    color: "#FF6F00",
  },
  {
    code: "KLB",
    name: "KienLongBank",
    fullName: "Ngân hàng TMCP Kiên Long",
    logo: "https://api.vietqr.io/img/KLB.png",
    color: "#388E3C",
  },
  {
    code: "ABB",
    name: "ABBANK",
    fullName: "Ngân hàng TMCP An Bình",
    logo: "https://api.vietqr.io/img/ABB.png",
    color: "#1976D2",
  },
  {
    code: "BAB",
    name: "BacABank",
    fullName: "Ngân hàng TMCP Bắc Á",
    logo: "https://api.vietqr.io/img/BAB.png",
    color: "#7B1FA2",
  },
  {
    code: "PGB",
    name: "PGBank",
    fullName: "Ngân hàng TMCP Xăng dầu Petrolimex",
    logo: "https://api.vietqr.io/img/PGB.png",
    color: "#F57C00",
  },
  {
    code: "CAKE",
    name: "CAKE by VPBank",
    fullName: "Ngân hàng số CAKE by VPBank",
    logo: "https://api.vietqr.io/img/CAKE.png",
    color: "#E91E63",
  },
  {
    code: "Ubank",
    name: "Ubank by VPBank",
    fullName: "Ngân hàng số Ubank by VPBank",
    logo: "https://api.vietqr.io/img/UBANK.png",
    color: "#9C27B0",
  },
  {
    code: "TIMO",
    name: "Timo by VPBank",
    fullName: "Ngân hàng số Timo by VPBank",
    logo: "https://api.vietqr.io/img/TIMO.png",
    color: "#FF5722",
  },
];

const MIN_WITHDRAW = 50000; // 50k VND
const MAX_WITHDRAW = 5000000; // 5M VND

export default function WithdrawRequest() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [withdrawData, setWithdrawData] = useState(null);
  const [bankSearch, setBankSearch] = useState("");

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const res = await fetchWalletBalance();
      let balanceValue = 0;

      if (res?.wallet?.balance !== undefined) {
        balanceValue =
          typeof res.wallet.balance === "string"
            ? parseFloat(res.wallet.balance)
            : res.wallet.balance;
      } else if (res?.balance !== undefined) {
        balanceValue =
          typeof res.balance === "string"
            ? parseFloat(res.balance)
            : res.balance;
      } else if (res?.data?.balance !== undefined) {
        balanceValue =
          typeof res.data.balance === "string"
            ? parseFloat(res.data.balance)
            : res.data.balance;
      }

      setBalance(balanceValue);
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance(0);
    }
  };

  const handleAmountChange = (e) => {
    let value = e.target.value.replace(/[^\d]/g, "");

    if (value === "") {
      setAmount("");
      setError("");
      return;
    }

    const numericValue = Number(value);

    if (numericValue > MAX_WITHDRAW) {
      value = MAX_WITHDRAW.toString();
    }

    setAmount(value);

    const finalValue = Number(value);
    if (finalValue < MIN_WITHDRAW) {
      setError(`Số tiền rút tối thiểu là ${MIN_WITHDRAW.toLocaleString()} VND`);
    } else if (finalValue > MAX_WITHDRAW) {
      setError(`Số tiền rút tối đa là ${MAX_WITHDRAW.toLocaleString()} VND`);
    } else if (finalValue > balance) {
      setError("Số tiền rút vượt quá số dư hiện có");
    } else {
      setError("");
    }
  };

  const handleAccountNumberChange = (e) => {
    // Chỉ cho phép số
    const value = e.target.value.replace(/[^\d]/g, "");
    if (value.length <= 20) {
      // Giới hạn 20 số
      setAccountNumber(value);
    }
  };

  const isFormValid = () => {
    const amountValue = Number(amount);
    return (
      amountValue >= MIN_WITHDRAW &&
      amountValue <= MAX_WITHDRAW &&
      amountValue <= balance &&
      selectedBank &&
      accountNumber.length >= 8 && // Số tài khoản ít nhất 8 số
      accountNumber.length <= 20
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      setError("Vui lòng kiểm tra lại thông tin");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const selectedBankInfo = SUPPORTED_BANKS.find(
        (bank) => bank.code === selectedBank
      );
      const response = await createWithdrawRequest(
        Number(amount),
        selectedBankInfo.name,
        accountNumber
      );

      setWithdrawData(response);
      setSuccess(true);

      // Refresh balance after successful request
      await fetchBalance();
    } catch (error) {
      console.error("Withdraw request error:", error);
      setError(
        error?.response?.data?.message ||
          "Có lỗi xảy ra khi tạo yêu cầu rút tiền. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success && withdrawData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Yêu cầu rút tiền thành công!
            </h2>
            <p className="text-gray-600">
              Yêu cầu của bạn đã được gửi và đang chờ xử lý
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-green-800 mb-3">
              Thông tin yêu cầu:
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Số tiền:</span>
                <span className="font-medium text-green-700">
                  {Number(amount).toLocaleString()} VND
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ngân hàng:</span>
                <span className="font-medium">
                  {
                    SUPPORTED_BANKS.find((bank) => bank.code === selectedBank)
                      ?.name
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Số tài khoản:</span>
                <span className="font-medium">
                  ***{accountNumber.slice(-4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Trạng thái:</span>
                <span className="font-medium text-yellow-600">Đang xử lý</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">
                Chính sách rút tiền
              </span>
            </div>
            <div className="text-blue-700 text-sm space-y-1 items-start">
              <p>• Lệnh duyệt: Ngày 1-5 hàng tháng</p>
              <p>• Chuyển tiền: 3-5 ngày (trong nước), 5-7 ngày (quốc tế)</p>
              <p>• Không bao gồm ngày nghỉ, lễ</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/wallet")}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Về ví
            </button>
            <button
              onClick={() => {
                setSuccess(false);
                setAmount("");
                setSelectedBank("");
                setAccountNumber("");
                setBankSearch("");
                setWithdrawData(null);
              }}
              className="flex-1 bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600 transition-colors"
            >
              Tạo yêu cầu mới
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/wallet")}
              className="p-2 rounded-full hover:bg-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Rút tiền</h1>
              <p className="text-gray-600">
                Tạo yêu cầu rút tiền từ ví về tài khoản ngân hàng
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/withdraw-history")}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-pink-300"
          >
            <History className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Lịch sử</span>
          </button>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="w-6 h-6" />
            <span className="text-pink-100">Số dư hiện tại</span>
          </div>
          <div className="text-3xl font-bold">
            {balance.toLocaleString()} VND
          </div>
          <p className="text-pink-100 text-sm mt-2">
            Số tiền có thể rút: {balance.toLocaleString()} VND
          </p>
        </div>

        {/* Withdraw Form */}
        <div className="bg-white rounded-2xl shadow p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số tiền muốn rút *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={amount ? Number(amount).toLocaleString() : ""}
                  onChange={handleAmountChange}
                  placeholder={`Nhập số tiền (${MIN_WITHDRAW.toLocaleString()} - ${MAX_WITHDRAW.toLocaleString()} VND)`}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-colors"
                />
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Số tiền rút tối thiểu: {MIN_WITHDRAW.toLocaleString()} VND
                <br />
                Số tiền rút tối đa: {MAX_WITHDRAW.toLocaleString()} VND
              </div>
            </div>

            {/* Bank Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Chọn ngân hàng *
              </label>

              {/* Selected Bank Display */}
              {selectedBank && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        SUPPORTED_BANKS.find(
                          (bank) => bank.code === selectedBank
                        )?.logo
                      }
                      alt={
                        SUPPORTED_BANKS.find(
                          (bank) => bank.code === selectedBank
                        )?.name
                      }
                      className="w-12 h-12 object-contain bg-white rounded-lg p-1 border"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    <div>
                      <div className="font-semibold text-gray-800">
                        {
                          SUPPORTED_BANKS.find(
                            (bank) => bank.code === selectedBank
                          )?.name
                        }
                      </div>
                      <div className="text-sm text-gray-600">
                        {
                          SUPPORTED_BANKS.find(
                            (bank) => bank.code === selectedBank
                          )?.fullName
                        }
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Search Input */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm ngân hàng..."
                  value={bankSearch}
                  onChange={(e) => setBankSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-colors text-sm"
                />
              </div>

              {/* Bank Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
                {SUPPORTED_BANKS.filter(
                  (bank) =>
                    bank.name
                      .toLowerCase()
                      .includes(bankSearch.toLowerCase()) ||
                    bank.fullName
                      .toLowerCase()
                      .includes(bankSearch.toLowerCase()) ||
                    bank.code.toLowerCase().includes(bankSearch.toLowerCase())
                ).map((bank) => (
                  <button
                    key={bank.code}
                    type="button"
                    onClick={() => {
                      setSelectedBank(bank.code);
                      setBankSearch("");
                      // Reset verification khi thay đổi ngân hàng
                      setAccountVerified(false);
                      setAccountInfo(null);
                    }}
                    className={`p-3 rounded-lg border-2 transition-all hover:shadow-md ${
                      selectedBank === bank.code
                        ? "border-pink-500 bg-pink-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src={bank.logo}
                        alt={bank.name}
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold hidden"
                        style={{ backgroundColor: bank.color }}
                      >
                        {bank.code.slice(0, 2)}
                      </div>
                      <span className="text-xs font-medium text-gray-700 text-center leading-tight">
                        {bank.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="text-xs text-gray-500 mt-2">
                {
                  SUPPORTED_BANKS.filter(
                    (bank) =>
                      bank.name
                        .toLowerCase()
                        .includes(bankSearch.toLowerCase()) ||
                      bank.fullName
                        .toLowerCase()
                        .includes(bankSearch.toLowerCase()) ||
                      bank.code.toLowerCase().includes(bankSearch.toLowerCase())
                  ).length
                }{" "}
                ngân hàng được hỗ trợ
              </div>
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số tài khoản *
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={accountNumber}
                  onChange={handleAccountNumberChange}
                  placeholder="Nhập số tài khoản ngân hàng"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-colors"
                />
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Số tài khoản phải từ 8-20 chữ số
              </div>
            </div>

            {/* Withdrawal Policy */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">
                    Chính sách rút tiền
                  </h4>
                  <ul className="text-blue-700 text-sm space-y-1">
                    {/* <li>
                      • Yêu cầu rút tiền sẽ được xử lý trong 1-3 ngày làm việc
                    </li> */}
                    <li>
                      • Vui lòng kiểm tra kỹ thông tin ngân hàng trước khi gửi
                    </li>
                    <li>• Lệnh duyệt được thực hiện vào ngày 1-5 hàng tháng</li>
                    <li>
                      • Thời gian chuyển tiền: 3-5 ngày (trong nước), 5-7 ngày
                      (quốc tế)
                    </li>
                    <li>• Không bao gồm ngày nghỉ, lễ</li>
                    <li>
                      • Sau khi gửi yêu cầu, bạn không thể hủy hoặc chỉnh sửa
                    </li>
                    <li>• Số tiền sẽ được trừ khỏi ví ngay khi tạo yêu cầu</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-700 font-medium">Lỗi</span>
                </div>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg text-lg transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Đang xử lý...
                </div>
              ) : (
                "Tạo yêu cầu rút tiền"
              )}
            </button>

            {/* Summary */}
            {amount && isFormValid() && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">
                  Tóm tắt giao dịch
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số tiền rút:</span>
                    <span className="font-medium">
                      {Number(amount).toLocaleString()} VND
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí giao dịch:</span>
                    <span className="font-medium text-green-600">Miễn phí</span>
                  </div>
                  <div className="flex justify-between border-t border-green-200 pt-1 mt-2">
                    <span className="text-gray-600">Số tiền nhận được:</span>
                    <span className="font-bold text-green-700">
                      {Number(amount).toLocaleString()} VND
                    </span>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
