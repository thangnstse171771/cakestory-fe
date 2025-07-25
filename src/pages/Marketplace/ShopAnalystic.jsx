import React, { useState } from "react";
import {
  Card,
  Tabs,
  Table,
  Button,
  Avatar,
  Statistic,
  Row,
  Col,
  Tag,
  Progress,
  Tooltip,
} from "antd";
import {
  ShopOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  ArrowLeftOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import "./ShopAnalystic.css";
import { Star } from "lucide-react";

const fakeShopInfo = {
  name: "Sweet Cake Shop",
  owner: "Nguyen Van A",
  members: [
    {
      id: 1,
      name: "Nguyen Van A",
      role: "Owner",
      avatar: "",
      joined: "2023-01-01",
    },
    {
      id: 2,
      name: "Tran Thi B",
      role: "Staff",
      avatar: "",
      joined: "2023-03-15",
    },
    {
      id: 3,
      name: "Le Van C",
      role: "Staff",
      avatar: "",
      joined: "2024-02-10",
    },
  ],
  orders: [
    {
      id: 101,
      customer: "Pham D",
      date: "2025-07-20",
      status: "Completed",
      total: 350000,
    },
    {
      id: 102,
      customer: "Nguyen E",
      date: "2025-07-21",
      status: "Pending",
      total: 120000,
    },
    {
      id: 103,
      customer: "Le F",
      date: "2025-07-22",
      status: "Cancelled",
      total: 0,
    },
  ],
  revenue: 12000000,
  totalOrders: 320,
  rating: 4.8,
  products: 25,
};

// Dữ liệu ảo cho biểu đồ
const revenueData = [
  { month: "T1", revenue: 2000000 },
  { month: "T2", revenue: 2500000 },
  { month: "T3", revenue: 1800000 },
  { month: "T4", revenue: 3000000 },
  { month: "T5", revenue: 2200000 },
  { month: "T6", revenue: 2700000 },
  { month: "T7", revenue: 1200000 },
];
const orderData = [
  { name: "Đã hoàn thành", value: 220 },
  { name: "Đang xử lý", value: 70 },
  { name: "Đã hủy", value: 30 },
];
const ratingData = [
  { name: "5★", value: 180 },
  { name: "4★", value: 90 },
  { name: "3★", value: 30 },
  { name: "2★", value: 10 },
  { name: "1★", value: 10 },
];
const productData = [
  { name: "Bánh kem", value: 10 },
  { name: "Bánh sinh nhật", value: 8 },
  { name: "Bánh cupcake", value: 7 },
];
const COLORS = ["#f59e42", "#52c41a", "#ff7875", "#1890ff", "#fadb14"];

const memberColumns = [
  {
    title: "Avatar",
    dataIndex: "avatar",
    key: "avatar",
    render: (_, record) => <Avatar icon={<UserOutlined />} />,
  },
  { title: "Name", dataIndex: "name", key: "name" },
  {
    title: "Role",
    dataIndex: "role",
    key: "role",
    render: (role) => (
      <Tag color={role === "Owner" ? "gold" : "blue"}>{role}</Tag>
    ),
  },
  { title: "Joined", dataIndex: "joined", key: "joined" },
];

const orderColumns = [
  { title: "Order ID", dataIndex: "id", key: "id" },
  { title: "Customer", dataIndex: "customer", key: "customer" },
  { title: "Date", dataIndex: "date", key: "date" },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status) => {
      let color = "green";
      if (status === "Pending") color = "orange";
      if (status === "Cancelled") color = "red";
      return <Tag color={color}>{status}</Tag>;
    },
  },
  {
    title: "Total (VND)",
    dataIndex: "total",
    key: "total",
    render: (total) => total.toLocaleString(),
  },
];

const ShopAnalysic = ({ onBack }) => {
  const [tab, setTab] = useState("overview");

  return (
    <div className="shop-analysic-container">
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={onBack}
        className="back-btn"
      >
        Quay lại My Shop
      </Button>
      <Card className="shop-header" variant={false}>
        <Row gutter={24} align="middle">
          <Col>
            <Avatar
              size={64}
              icon={<ShopOutlined />}
              style={{ background: "#f59e42" }}
            />
          </Col>
          <Col flex="auto">
            <h2>{fakeShopInfo.name}</h2>
            <div>
              Chủ shop: <b>{fakeShopInfo.owner}</b>
            </div>
          </Col>
        </Row>
      </Card>
      <Tabs
        activeKey={tab}
        onChange={setTab}
        className="shop-tabs"
        items={[
          {
            key: "overview",
            label: (
              <span>
                <BarChartOutlined /> Tổng quan
              </span>
            ),
            children: (
              <>
                <Row gutter={24} className="overview-row">
                  <Col span={6}>
                    <Statistic
                      title="Doanh thu"
                      value={fakeShopInfo.revenue}
                      suffix="VND"
                      valueStyle={{ color: "#52c41a" }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Đơn hàng"
                      value={fakeShopInfo.totalOrders}
                      prefix={<ShoppingCartOutlined />}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic title="Sản phẩm" value={fakeShopInfo.products} />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Đánh giá"
                      value={fakeShopInfo.rating}
                      suffix="★"
                      valueStyle={{ color: "#fadb14" }}
                    />
                  </Col>
                </Row>
                <Row gutter={24} style={{ marginTop: 32 }}>
                  <Col span={12}>
                    <Card
                      title={
                        <span>
                          <LineChartOutlined /> Doanh thu 7 tháng gần nhất
                        </span>
                      }
                      variant={false}
                      style={{ minHeight: 320 }}
                    >
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart
                          data={revenueData}
                          margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <RTooltip formatter={(v) => v.toLocaleString()} />
                          <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#f59e42"
                            strokeWidth={3}
                            dot={{ r: 5 }}
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card
                      title={
                        <span>
                          <PieChartOutlined /> Tỉ lệ trạng thái đơn hàng
                        </span>
                      }
                      variant={false}
                      style={{ minHeight: 320 }}
                    >
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={orderData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={70}
                            label
                          >
                            {orderData.map((entry, idx) => (
                              <Cell
                                key={`cell-${idx}`}
                                fill={COLORS[idx % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Legend />
                          <RTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Card>
                  </Col>
                </Row>
                <Row gutter={24} style={{ marginTop: 32 }}>
                  <Col span={12}>
                    <Card
                      title={
                        <span>
                          <BarChartOutlined /> Phân loại sản phẩm
                        </span>
                      }
                      variant={false}
                      style={{ minHeight: 320 }}
                    >
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={productData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Bar dataKey="value" fill="#52c41a">
                            {productData.map((entry, idx) => (
                              <Cell
                                key={`cell-bar-${idx}`}
                                fill={COLORS[idx % COLORS.length]}
                              />
                            ))}
                          </Bar>
                          <RTooltip />
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card
                      title={
                        <span>
                          <Star style={{ color: "#fadb14" }} /> Phân bố đánh giá
                        </span>
                      }
                      variant={false}
                      style={{ minHeight: 320 }}
                    >
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={ratingData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Bar dataKey="value" fill="#fadb14">
                            {ratingData.map((entry, idx) => (
                              <Cell
                                key={`cell-rating-${idx}`}
                                fill={COLORS[idx % COLORS.length]}
                              />
                            ))}
                          </Bar>
                          <RTooltip />
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                  </Col>
                </Row>
              </>
            ),
          },
          {
            key: "members",
            label: (
              <span>
                <UserOutlined /> Thành viên
              </span>
            ),
            children: (
              <Table
                columns={memberColumns}
                dataSource={fakeShopInfo.members}
                rowKey="id"
                pagination={false}
                className="fade-in-table"
              />
            ),
          },
          {
            key: "orders",
            label: (
              <span>
                <ShoppingCartOutlined /> Đơn hàng
              </span>
            ),
            children: (
              <Table
                columns={orderColumns}
                dataSource={fakeShopInfo.orders}
                rowKey="id"
                className="fade-in-table"
              />
            ),
          },
        ]}
      />
      <div className="shop-progress-section">
        <h3>Tiến độ hoàn thành mục tiêu tháng</h3>
        <Progress percent={75} status="active" strokeColor="#f59e42" />
      </div>
    </div>
  );
};

export default ShopAnalystic;
