"use client";
// Đã loại bỏ các import không tồn tại, dùng thẻ div và TailwindCSS thay thế
import { useState } from "react";
import { ListOrdered, CalendarDays, User, Package } from "lucide-react";
import OrderTrackingForm from "./OrderTrackingForm";

const statusMap = {
  pending: { label: "Đang chờ xử lý", color: "bg-yellow-100 text-yellow-700" },
  processing: { label: "Đang chuẩn bị", color: "bg-blue-100 text-blue-700" },
  awaiting_shipment: {
    label: "Đợi vận chuyển",
    color: "bg-purple-100 text-purple-700",
  },
  shipping: {
    label: "Đang vận chuyển",
    color: "bg-orange-100 text-orange-700",
  },
  delivered: { label: "Đã giao hàng", color: "bg-green-100 text-green-700" },
  completed: { label: "Hoàn tất", color: "bg-emerald-100 text-emerald-700" },
};

export default function OrderTrackingList({ orders, onSelectOrder }) {
  // Fake data nếu không có orders truyền vào
  const fakeOrders = [
    {
      id: 1,
      orderNumber: "ORD-2024-001",
      placedDate: "2024-01-20T10:00:00Z",
      status: "awaiting_shipment",
      customerName: "Nguyễn Văn A",
      customerEmail: "vana@example.com",
      customerPhone: "0901234567",
      items: [
        { name: "Bánh kem dâu", quantity: 1, price: 250000 },
        { name: "Bánh su kem", quantity: 1, price: 180000 },
      ],
      total: 430000,
      history: [
        {
          date: "2024-01-20",
          time: "10:00",
          status: "pending",
          note: "Đơn hàng được tạo",
        },
        {
          date: "2024-01-20",
          time: "12:00",
          status: "awaiting_shipment",
          note: "Đợi vận chuyển",
        },
      ],
    },
    {
      id: 2,
      orderNumber: "ORD-2024-002",
      placedDate: "2024-01-22T14:30:00Z",
      status: "processing",
      customerName: "Trần Thị B",
      customerEmail: "thib@example.com",
      customerPhone: "0912345678",
      items: [{ name: "Bánh cupcake", quantity: 2, price: 50000 }],
      total: 100000,
      history: [
        {
          date: "2024-01-22",
          time: "14:30",
          status: "pending",
          note: "Đơn hàng được tạo",
        },
        {
          date: "2024-01-22",
          time: "15:00",
          status: "processing",
          note: "Đang chuẩn bị",
        },
      ],
    },
  ];
  const displayOrders =
    Array.isArray(orders) && orders.length > 0 ? orders : fakeOrders;
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Khi bấm vào xem chi tiết, show form luôn với dữ liệu đơn hàng
  const handleSelectOrder = (orderId) => {
    const order = displayOrders.find((o) => o.id === orderId);
    setSelectedOrder(order);
  };
  const handleBackToList = () => setSelectedOrder(null);
  // Dummy update status
  const handleUpdateStatus = () => {};

  if (selectedOrder) {
    return (
      <OrderTrackingForm
        order={selectedOrder}
        onUpdateStatus={handleUpdateStatus}
        onBackToList={handleBackToList}
      />
    );
  }

  return (
    <div className="p-8 bg-pink-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-pink-700 mb-6 flex items-center gap-3">
          <ListOrdered className="h-7 w-7" />
          Quản lý đơn hàng
        </h2>

        <div className="space-y-6">
          {displayOrders.map((order) => (
            <div
              key={order.id}
              className="p-6 shadow-lg rounded-xl border border-pink-100 hover:shadow-xl transition-shadow bg-white"
            >
              <div className="pb-4 flex flex-row items-center justify-between">
                <div>
                  <div className="text-xl font-bold text-pink-700">
                    Đơn hàng {order.orderNumber}
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <CalendarDays className="h-4 w-4" />
                    Đặt vào:{" "}
                    {new Date(order.placedDate).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <span
                  className={`$${
                    statusMap[order.status]?.color ||
                    "bg-gray-200 text-gray-700"
                  } text-sm px-3 py-1 rounded-lg font-semibold`}
                >
                  {statusMap[order.status]?.label || order.status}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{order.customerName}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Package className="h-4 w-4" />
                  <span className="font-medium">
                    {order.items.length} sản phẩm
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-pink-100">
                  <span className="text-lg font-bold text-pink-600">
                    Tổng cộng:
                  </span>
                  <span className="text-xl font-bold text-pink-600">
                    {order.total.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <button
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold px-4 py-2 rounded-lg mt-4"
                  onClick={() => handleSelectOrder(order.id)}
                >
                  Xem chi tiết đơn hàng
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
