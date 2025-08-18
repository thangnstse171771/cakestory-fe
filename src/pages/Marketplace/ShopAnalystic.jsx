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
  PieChartOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {
  Tooltip as RTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import "./ShopAnalystic.css";
import { Star } from "lucide-react";
import OrderTrackingList from "../OrderTrackingForm/OrderTrackingList";
import ShopStatsCard from "./ShopStatsCard";
import {
  fetchShopMembers,
  fetchAllActiveUsers,
  addMemberToShop,
  deleteMemberFromShop,
} from "../../api/shopMembers";
import {
  fetchAllShops,
  fetchShopOrders,
  fetchMarketplacePosts,
} from "../../api/axios";
import { collection, getDocs, query, where } from "firebase/firestore";
import { removeUserFromGroupChatByShopId } from "../Chat/libs/shopChatUtils";
import { db } from "../../firebase";
import {
  fetchShopCustomers,
  fetchShopOrderStats,
  fetchShopRevenue,
  fetchShopMonthlyRevenue,
} from "../../api/shopStats";

// Dữ liệu dự phòng cho biểu đồ đơn hàng (sử dụng khi API lỗi)
const orderData = [
  { name: "Đã hoàn thành", value: 0, color: "#52c41a" },
  { name: "Đang xử lý", value: 0, color: "#1890ff" },
  { name: "Đã hủy", value: 0, color: "#ff7875" },
];
const COLORS = [
  "#52c41a",
  "#1890ff",
  "#ff7875",
  "#722ed1",
  "#fadb14",
  "#f59e42",
];

const ShopAnalystic = ({ onBack }) => {
  const [tab, setTab] = useState("overview");
  const [members, setMembers] = useState([]);
  const [shopId, setShopId] = useState(null);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [addingUserId, setAddingUserId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [deletingMember, setDeletingMember] = useState(false);

  // State cho dữ liệu shop thật
  const [shopInfo, setShopInfo] = useState({
    name: "Đang tải...",
    owner: "Đang tải...",
    business_name: "",
    phone_number: "",
    business_address: "",
  });
  const [shopStats, setShopStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    completionRate: 0,
  });
  const [orderStatsData, setOrderStatsData] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch dữ liệu shop thật
  const fetchShopData = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      // Fetch shop info
      const shopsData = await fetchAllShops();
      const userShop = (shopsData.shops || []).find(
        (shop) => shop.user_id === user.id
      );

      if (userShop) {
        const currentShopId = userShop.shop_id || userShop.id;

        setShopInfo({
          name: userShop.business_name || userShop.name || "Chưa có tên shop",
          owner: user.full_name || user.username || "Chủ shop",
          business_name: userShop.business_name || "",
          phone_number: userShop.phone_number || "",
          business_address: userShop.business_address || "",
        });
        setShopId(currentShopId);

        // Fetch dữ liệu từ 4 API mới
        try {
          // 1. Fetch customer statistics
          const customerData = await fetchShopCustomers(currentShopId);
          const totalCustomers = customerData.data?.total_unique_customers || 0;

          // 2. Fetch order statistics
          const orderStatsResponse = await fetchShopOrderStats(currentShopId);
          const orderStats = orderStatsResponse.data?.order_statistics || {};

          // Chuyển đổi dữ liệu order stats cho biểu đồ
          const orderChartData = [
            {
              name: "Đã hoàn thành",
              value: orderStats.completed_orders || 0,
              color: "#52c41a",
            },
            {
              name: "Đã đặt hàng",
              value: orderStats.ordered_orders || 0,
              color: "#1890ff",
            },
            {
              name: "Đã giao",
              value: orderStats.shipped_orders || 0,
              color: "#722ed1",
            },
            {
              name: "Đang chờ",
              value: orderStats.pending_orders || 0,
              color: "#fadb14",
            },
            {
              name: "Đã hủy",
              value: orderStats.cancelled_orders || 0,
              color: "#ff7875",
            },
            {
              name: "Khiếu nại",
              value: orderStats.complaining_orders || 0,
              color: "#ff4d4f",
            },
          ].filter((item) => item.value > 0); // Chỉ hiển thị những trạng thái có giá trị > 0

          setOrderStatsData(orderChartData);

          // 3. Fetch revenue statistics
          const revenueResponse = await fetchShopRevenue(currentShopId);
          const financialSummary =
            revenueResponse.data?.financial_summary || {};

          const totalRevenue = parseFloat(
            financialSummary.completed_money || 0
          );

          // 4. Fetch monthly revenue for progress
          const monthlyRevenueResponse = await fetchShopMonthlyRevenue(
            currentShopId
          );
          const monthlyFinancial =
            monthlyRevenueResponse.data?.financial_summary || {};
          const monthlyTotal = parseFloat(
            monthlyFinancial.completed_money || 0
          );

          setMonthlyRevenue({
            current: monthlyTotal,
            month:
              monthlyRevenueResponse.data?.month_info?.current_month ||
              "Tháng hiện tại",
          });

          // Cập nhật shop stats
          setShopStats({
            totalOrders: orderStats.total_orders || 0,
            totalRevenue: totalRevenue,
            totalCustomers: totalCustomers,
            completionRate: parseFloat(
              orderStatsResponse.data?.completion_rate || 0
            ),
            totalProducts: 0, // Sẽ fetch từ marketplace posts
          });
        } catch (apiError) {
          console.error("Error fetching shop statistics:", apiError);
          // Fallback với dữ liệu cũ nếu API mới lỗi
          setShopStats((prev) => ({
            ...prev,
            totalOrders: 0,
            totalRevenue: 0,
            totalCustomers: 0,
            completionRate: 0,
          }));
        }

        // Fetch products count từ marketplace posts
        try {
          const postsData = await fetchMarketplacePosts();
          const userPosts = (postsData.marketplacePosts || []).filter(
            (post) => post.shop_id === currentShopId
          );
          setShopStats((prev) => ({
            ...prev,
            totalProducts: userPosts.length,
          }));
        } catch (postError) {
          console.error("Error fetching posts:", postError);
          setShopStats((prev) => ({ ...prev, totalProducts: 0 }));
        }
      }
    } catch (error) {
      console.error("Error fetching shop data:", error);
      setShopInfo({
        name: "Lỗi tải dữ liệu",
        owner: "Không xác định",
        business_name: "",
        phone_number: "",
        business_address: "",
      });
    } finally {
      setLoading(false);
    }
  };

  // Hàm hiển thị modal xác nhận xóa
  const showDeleteConfirm = (record) => {
    setMemberToDelete(record);
    setShowDeleteModal(true);
  };

  //hàm xử lý so sánh userId với firebaseId
  const getFirebaseUserIdFromPostgresId = async (postgresId) => {
    const q = query(
      collection(db, "users"),
      where("postgresId", "==", Number(postgresId)) // ensure type matches Firestore field
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id; // Firestore doc ID
    }

    return null; // not found
  };

  // Hàm xử lý xóa thành viên
  const handleDeleteMember = async () => {
    if (!memberToDelete) return;

    setDeletingMember(true);
    try {
      //gọi hàm so sánh id trên firebase
      const firebaseUid = await getFirebaseUserIdFromPostgresId(
        memberToDelete.id
      );

      // Step 2: Delete user from your own database
      await deleteMemberFromShop(memberToDelete.id);

      // Step 3: xóa khỏi nhóm chat
      if (firebaseUid && shopId) {
        await removeUserFromGroupChatByShopId({
          firebaseUid,
          shopId,
        });
      } else {
        console.warn(
          "Could not remove from Firebase group chat: missing UID or shopId"
        );
      }

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
    fetchShopData();
  }, []);

  useEffect(() => {
    if (tab === "members") {
      setLoadingMembers(true);
      fetchShopMembers()
        .then((data) => {
          setMembers(
            data.members.map((m) => ({
              shop_id: m.shop_id,
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
          setShopId(data.members[0]?.shop_id);
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
            <h2>{loading ? "Đang tải..." : shopInfo.name}</h2>
            <div>
              Chủ shop: <b>{loading ? "Đang tải..." : shopInfo.owner}</b>
            </div>
            {shopInfo.phone_number && (
              <div
                style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}
              >
                📞 {shopInfo.phone_number}
              </div>
            )}
            {shopInfo.business_address && (
              <div style={{ color: "#666", fontSize: "14px" }}>
                📍 {shopInfo.business_address}
              </div>
            )}
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
                <ShopStatsCard
                  totalRevenue={shopStats.totalRevenue}
                  totalOrders={shopStats.totalOrders}
                  totalCustomers={shopStats.totalCustomers}
                  completionRate={shopStats.completionRate}
                  totalProducts={shopStats.totalProducts}
                  loading={loading}
                />

                <Row gutter={24} style={{ marginBottom: 24 }}>
                  <Col span={12}>
                    <Card
                      size="small"
                      style={{
                        background:
                          "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                        border: "1px solid #0ea5e9",
                      }}
                    >
                      <Statistic
                        title={`📈 Doanh thu ${
                          monthlyRevenue.month || "tháng này"
                        }`}
                        value={monthlyRevenue.current || 0}
                        suffix="VND"
                        valueStyle={{
                          color: "#0369a1",
                          fontSize: "18px",
                          fontWeight: 600,
                        }}
                        formatter={(value) =>
                          `${parseFloat(value).toLocaleString()}`
                        }
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card
                      size="small"
                      style={{
                        background:
                          "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                        border: "1px solid #f59e0b",
                      }}
                    >
                      <Statistic
                        title="📊 Sản phẩm hiện có"
                        value={loading ? 0 : shopStats.totalProducts}
                        suffix="sản phẩm"
                        valueStyle={{
                          color: "#d97706",
                          fontSize: "18px",
                          fontWeight: 600,
                        }}
                        loading={loading}
                      />
                    </Card>
                  </Col>
                </Row>
                <Row gutter={24} style={{ marginTop: 32 }}>
                  <Col span={12}>
                    <Card
                      title={
                        <span>
                          <BarChartOutlined /> Hiệu suất hoạt động
                        </span>
                      }
                      variant={false}
                      style={{ minHeight: 320 }}
                    >
                      <div style={{ padding: "20px 0" }}>
                        <div style={{ marginBottom: 24 }}>
                          <div style={{ marginBottom: 8, fontWeight: 500 }}>
                            Hiệu quả hoàn thành đơn hàng (
                            {shopStats.completionRate}%)
                          </div>
                          <Progress
                            percent={shopStats.completionRate}
                            strokeColor={{
                              "0%": "#ff7875",
                              "50%": "#fadb14",
                              "100%": "#52c41a",
                            }}
                            trailColor="#f5f5f5"
                          />
                        </div>

                        <div style={{ marginBottom: 24 }}>
                          <div style={{ marginBottom: 8, fontWeight: 500 }}>
                            Mức độ phổ biến - Khách hàng (
                            {shopStats.totalCustomers}/200)
                          </div>
                          <Progress
                            percent={Math.min(
                              (shopStats.totalCustomers / 200) * 100,
                              100
                            )}
                            strokeColor="#1890ff"
                            trailColor="#f5f5f5"
                          />
                        </div>

                        <div>
                          <div style={{ marginBottom: 8, fontWeight: 500 }}>
                            Đa dạng sản phẩm ({shopStats.totalProducts}/50)
                          </div>
                          <Progress
                            percent={Math.min(
                              (shopStats.totalProducts / 50) * 100,
                              100
                            )}
                            strokeColor="#722ed1"
                            trailColor="#f5f5f5"
                          />
                        </div>
                      </div>
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
                            data={
                              orderStatsData.length > 0
                                ? orderStatsData
                                : orderData
                            }
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={70}
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {(orderStatsData.length > 0
                              ? orderStatsData
                              : orderData
                            ).map((entry, idx) => (
                              <Cell
                                key={`cell-${idx}`}
                                fill={
                                  entry.color || COLORS[idx % COLORS.length]
                                }
                              />
                            ))}
                          </Pie>
                          <Legend />
                          <RTooltip
                            formatter={(value, name) => [`${value} đơn`, name]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </Card>
                  </Col>
                </Row>
                <Row gutter={24} style={{ marginTop: 32 }}>
                  <Col span={12}>
                    <Card
                      title={<span>💰 Thống kê doanh thu</span>}
                      variant={false}
                      style={{ minHeight: 320 }}
                    >
                      <div style={{ padding: "20px 0" }}>
                        <Row gutter={16}>
                          <Col span={12}>
                            <Statistic
                              title="Doanh thu đã hoàn thành"
                              value={loading ? 0 : shopStats.totalRevenue}
                              suffix="VND"
                              valueStyle={{
                                color: "#52c41a",
                                fontSize: "16px",
                              }}
                              formatter={(value) =>
                                `${parseFloat(value).toLocaleString()}`
                              }
                            />
                          </Col>
                          <Col span={12}>
                            <Statistic
                              title="Tỉ lệ hoàn thành đơn hàng"
                              value={loading ? 0 : shopStats.completionRate}
                              suffix="%"
                              valueStyle={{
                                color: "#1890ff",
                                fontSize: "16px",
                              }}
                            />
                          </Col>
                        </Row>
                        <Row gutter={16} style={{ marginTop: 24 }}>
                          <Col span={12}>
                            <Statistic
                              title="Tổng số khách hàng"
                              value={loading ? 0 : shopStats.totalCustomers}
                              valueStyle={{
                                color: "#722ed1",
                                fontSize: "16px",
                              }}
                            />
                          </Col>
                          <Col span={12}>
                            <Statistic
                              title="Tổng sản phẩm"
                              value={loading ? 0 : shopStats.totalProducts}
                              valueStyle={{
                                color: "#f59e42",
                                fontSize: "16px",
                              }}
                            />
                          </Col>
                        </Row>
                      </div>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card
                      title={<span>📊 Phân tích hiệu quả</span>}
                      variant={false}
                      style={{ minHeight: 320 }}
                    >
                      <div style={{ padding: "20px 0" }}>
                        <div style={{ marginBottom: 24 }}>
                          <div style={{ marginBottom: 8, fontWeight: 500 }}>
                            Hiệu quả hoàn thành đơn hàng
                          </div>
                          <Progress
                            percent={shopStats.completionRate || 0}
                            strokeColor={{
                              "0%": "#ff7875",
                              "50%": "#fadb14",
                              "100%": "#52c41a",
                            }}
                            trailColor="#f5f5f5"
                          />
                        </div>

                        <div style={{ marginBottom: 24 }}>
                          <div style={{ marginBottom: 8, fontWeight: 500 }}>
                            Mức độ phổ biến (số khách hàng)
                          </div>
                          <Progress
                            percent={Math.min(
                              (shopStats.totalCustomers / 100) * 100,
                              100
                            )}
                            strokeColor="#1890ff"
                            trailColor="#f5f5f5"
                          />
                        </div>

                        <div>
                          <div style={{ marginBottom: 8, fontWeight: 500 }}>
                            Đa dạng sản phẩm
                          </div>
                          <Progress
                            percent={Math.min(
                              (shopStats.totalProducts / 50) * 100,
                              100
                            )}
                            strokeColor="#722ed1"
                            trailColor="#f5f5f5"
                          />
                        </div>
                      </div>
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
                    className="add-member-modal-overlay responsive-modal"
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
                      overflowY: "auto",
                      padding: "16px",
                    }}
                  >
                    <div
                      className="responsive-modal-content"
                      style={{
                        background: "#fff",
                        padding: "2vw 1vw",
                        minWidth: "500px",
                        maxWidth: "1100px",
                        width: "100%",
                        borderRadius: 24,
                        boxShadow: "0 6px 40px rgba(245,158,66,0.18)",
                        border: "2px solid #f59e42",
                        position: "relative",
                        maxHeight: "90vh",
                        overflowY: "auto",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
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
                          zIndex: 2,
                        }}
                      >
                        ×
                      </Button>
                      <h2
                        style={{
                          marginBottom: "2vw",
                          textAlign: "center",
                          color: "#f59e42",
                          fontWeight: 700,
                          fontSize: "max(20px,2vw)",
                          wordBreak: "break-word",
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
                        style={{ marginTop: 8, width: "100%", minWidth: 240 }}
                        scroll={{ y: 400 }}
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
              <div style={{ margin: "-24px" }}>
                <OrderTrackingList />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

export default ShopAnalystic;
