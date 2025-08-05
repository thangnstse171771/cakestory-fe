import React, { useState, useEffect } from "react";
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
  ExclamationCircleOutlined,
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
import {
  fetchShopMembers,
  fetchAllActiveUsers,
  addMemberToShop,
  deleteMemberFromShop,
} from "../../api/shopMembers";

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

const ShopAnalystic = ({ onBack }) => {
  const [tab, setTab] = useState("overview");
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [addingUserId, setAddingUserId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [deletingMember, setDeletingMember] = useState(false);

  // Hàm hiển thị modal xác nhận xóa
  const showDeleteConfirm = (record) => {
    setMemberToDelete(record);
    setShowDeleteModal(true);
  };

  // Hàm xử lý xóa thành viên
  const handleDeleteMember = async () => {
    if (!memberToDelete) return;

    setDeletingMember(true);
    try {
      await deleteMemberFromShop(memberToDelete.id);
      // Refresh members list
      const data = await fetchShopMembers();
      setMembers(
        data.members.map((m) => ({
          id: m.user_id,
          name: m.User?.username || "",
          role: m.is_admin ? "Owner" : "Staff",
          avatar: "",
          joined: m.joined_at ? new Date(m.joined_at).toLocaleDateString() : "",
          status: m.is_active ? "active" : "pending",
          is_active: m.is_active,
        }))
      );
      setShowDeleteModal(false);
      setMemberToDelete(null);
    } catch (error) {
      console.error("Error deleting member:", error);
    } finally {
      setDeletingMember(false);
    }
  };

  const memberColumns = [
    {
      title: "Avatar",
      dataIndex: "avatar",
      key: "avatar",
      render: (_, record) => <Avatar icon={<UserOutlined />} />,
      width: 60,
    },
    { title: "Name", dataIndex: "name", key: "name", width: 160 },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag color={role === "Owner" ? "gold" : "blue"}>{role}</Tag>
      ),
      width: 100,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status, record) => {
        if (!record.is_active) {
          return <Tag color="orange">Đang chờ chấp nhận</Tag>;
        }
        return <Tag color="green">Đã là thành viên</Tag>;
      },
      width: 150,
    },
    { title: "Joined", dataIndex: "joined", key: "joined", width: 120 },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      render: (_, record) =>
        record.role !== "Owner" ? (
          <Button
            danger
            type="primary"
            style={{
              background: "#ff7875",
              borderColor: "#ff7875",
              color: "#fff",
              borderRadius: 8,
            }}
            onClick={() => showDeleteConfirm(record)}
          >
            Xóa
          </Button>
        ) : (
          <Tag color="gold">Chủ shop</Tag>
        ),
    },
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

  const handleOpenAddModal = () => {
    setShowAddModal(true);
    setLoadingUsers(true);
    fetchAllActiveUsers()
      .then((users) => setActiveUsers(users))
      .catch(() => setActiveUsers([]))
      .finally(() => setLoadingUsers(false));
  };

  const handleAddMember = async (userId) => {
    setAddingUserId(userId);
    try {
      await addMemberToShop(userId);
      // Refresh members list
      fetchShopMembers().then((data) => {
        setMembers(
          data.members.map((m) => ({
            id: m.user_id,
            name: m.User?.username || "",
            role: m.is_admin ? "Owner" : "Staff",
            avatar: "",
            joined: m.joined_at
              ? new Date(m.joined_at).toLocaleDateString()
              : "",
            status: m.is_active ? "active" : "pending",
            is_active: m.is_active,
          }))
        );
      });
    } finally {
      setAddingUserId(null);
    }
  };

  useEffect(() => {
    if (tab === "members") {
      setLoadingMembers(true);
      fetchShopMembers()
        .then((data) => {
          setMembers(
            data.members.map((m) => ({
              id: m.user_id,
              name: m.User?.username || "",
              role: m.is_admin ? "Owner" : "Staff",
              avatar: "",
              joined: m.joined_at
                ? new Date(m.joined_at).toLocaleDateString()
                : "",
              status: m.is_active ? "active" : "pending",
              is_active: m.is_active,
            }))
          );
        })
        .catch(() => setMembers([]))
        .finally(() => setLoadingMembers(false));
    }
  }, [tab]);

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
              <>
                <Button
                  type="primary"
                  style={{ marginBottom: 16 }}
                  onClick={handleOpenAddModal}
                >
                  Thêm thành viên
                </Button>
                <Table
                  columns={memberColumns}
                  dataSource={members}
                  rowKey="id"
                  loading={loadingMembers}
                  pagination={false}
                  className="fade-in-table"
                />
                {showAddModal && (
                  <div
                    className="add-member-modal-overlay"
                    style={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      width: "100vw",
                      height: "100vh",
                      background: "rgba(245,158,66,0.08)",
                      zIndex: 1000,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        background: "#fff",
                        padding: 56,
                        minWidth: 700,
                        maxWidth: 1100,
                        width: "98%",
                        borderRadius: 24,
                        boxShadow: "0 6px 40px rgba(245,158,66,0.18)",
                        border: "2px solid #f59e42",
                        position: "relative",
                      }}
                    >
                      <Button
                        type="text"
                        onClick={() => setShowAddModal(false)}
                        style={{
                          position: "absolute",
                          top: 18,
                          right: 18,
                          fontSize: 22,
                          color: "#f59e42",
                          fontWeight: 700,
                        }}
                      >
                        ×
                      </Button>
                      <h2
                        style={{
                          marginBottom: 32,
                          textAlign: "center",
                          color: "#f59e42",
                          fontWeight: 700,
                          fontSize: 28,
                        }}
                      >
                        Thêm thành viên vào shop
                      </h2>
                      <Table
                        columns={[
                          {
                            title: "Avatar",
                            dataIndex: "avatar",
                            key: "avatar",
                            render: (avatar) => (
                              <Avatar
                                src={avatar}
                                icon={<UserOutlined />}
                                size={48}
                                style={{ background: "#f59e42" }}
                              />
                            ),
                            width: 80,
                          },
                          {
                            title: "Tên",
                            dataIndex: "full_name",
                            key: "full_name",
                            render: (v, r) => v || r.username,
                            width: 180,
                          },
                          {
                            title: "Email",
                            dataIndex: "email",
                            key: "email",
                            width: 220,
                          },
                          {
                            title: "Vai trò",
                            dataIndex: "role",
                            key: "role",
                            render: (role) => {
                              let color = "#f59e42";
                              if (role === "admin") color = "#fadb14";
                              if (role === "user") color = "#1890ff";
                              if (role === "account_staff") color = "#52c41a";
                              if (role === "complaint_handler")
                                color = "#ff7875";
                              return (
                                <Tag
                                  style={{
                                    background: color,
                                    color: "#fff",
                                    borderRadius: 8,
                                    fontWeight: 500,
                                  }}
                                >
                                  {role}
                                </Tag>
                              );
                            },
                            width: 140,
                          },
                          {
                            title: "Thao tác",
                            key: "action",
                            width: 160,
                            render: (_, record) =>
                              members.some(
                                (m) => m.name === record.username
                              ) ? (
                                <Tag
                                  style={{
                                    background: "#52c41a",
                                    color: "#fff",
                                    borderRadius: 8,
                                  }}
                                >
                                  Đã là thành viên
                                </Tag>
                              ) : (
                                <Button
                                  type="primary"
                                  style={{
                                    background: "#f59e42",
                                    borderColor: "#f59e42",
                                    color: "#fff",
                                    fontWeight: 600,
                                    borderRadius: 8,
                                  }}
                                  loading={addingUserId === record.id}
                                  onClick={() => handleAddMember(record.id)}
                                  onMouseOver={(e) =>
                                    (e.currentTarget.style.background =
                                      "#d9822b")
                                  }
                                  onMouseOut={(e) =>
                                    (e.currentTarget.style.background =
                                      "#f59e42")
                                  }
                                >
                                  Thêm vào shop
                                </Button>
                              ),
                          },
                        ]}
                        dataSource={activeUsers}
                        rowKey="id"
                        loading={loadingUsers}
                        pagination={{ pageSize: 8 }}
                        style={{ marginTop: 8 }}
                        scroll={{ y: 700 }}
                      />
                    </div>
                  </div>
                )}

                {/* Custom Delete Confirmation Modal */}
                {showDeleteModal && (
                  <div
                    className="delete-modal-overlay"
                    style={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      width: "100vw",
                      height: "100vh",
                      background: "rgba(0, 0, 0, 0.5)",
                      zIndex: 1001,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        background: "#fff",
                        padding: 32,
                        borderRadius: 12,
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                        minWidth: 400,
                        maxWidth: 500,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: 16,
                        }}
                      >
                        <ExclamationCircleOutlined
                          style={{
                            color: "#ff7875",
                            fontSize: 24,
                            marginRight: 12,
                          }}
                        />
                        <h3
                          style={{ margin: 0, fontSize: 18, fontWeight: 600 }}
                        >
                          Xác nhận xóa thành viên
                        </h3>
                      </div>

                      <div style={{ marginBottom: 24 }}>
                        <p style={{ margin: 0, marginBottom: 8 }}>
                          Bạn có chắc chắn muốn xóa thành viên{" "}
                          <strong>{memberToDelete?.name}</strong> khỏi shop
                          không?
                        </p>
                        <p
                          style={{
                            color: "#ff7875",
                            fontSize: "14px",
                            margin: 0,
                            fontStyle: "italic",
                          }}
                        >
                          Hành động này không thể hoàn tác.
                        </p>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 12,
                        }}
                      >
                        <Button
                          onClick={() => {
                            setShowDeleteModal(false);
                            setMemberToDelete(null);
                          }}
                          disabled={deletingMember}
                        >
                          Hủy
                        </Button>
                        <Button
                          type="primary"
                          danger
                          loading={deletingMember}
                          onClick={handleDeleteMember}
                        >
                          Xóa
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
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
