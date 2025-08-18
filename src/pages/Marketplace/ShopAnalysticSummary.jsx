import React, { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, Progress, Divider, Spin } from "antd";
import {
  ShoppingCartOutlined,
  TrophyOutlined,
  RiseOutlined,
  UserOutlined,
  DollarOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import {
  fetchShopCustomers,
  fetchShopOrderStats,
  fetchShopRevenue,
  fetchShopMonthlyRevenue,
} from "../../api/shopStats";
import { fetchAllShops, fetchMarketplacePosts } from "../../api/axios";

const ShopAnalysticSummary = () => {
  const [shopStats, setShopStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    completionRate: 0,
  });
  const [monthlyRevenue, setMonthlyRevenue] = useState({
    current: 0,
    month: null,
  });
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

        // Fetch dữ liệu từ các API
        try {
          // 1. Fetch customer statistics
          const customerData = await fetchShopCustomers(currentShopId);
          const totalCustomers = customerData.data?.total_unique_customers || 0;

          // 2. Fetch order statistics
          const orderStatsResponse = await fetchShopOrderStats(currentShopId);
          const orderStats = orderStatsResponse.data?.order_statistics || {};

          const totalOrders = Object.values(orderStats).reduce(
            (sum, count) => sum + (count || 0),
            0
          );
          const completedOrders = orderStats.completed_orders || 0;
          const completionRate =
            totalOrders > 0
              ? Math.round((completedOrders / totalOrders) * 100)
              : 0;

          // 3. Fetch revenue statistics
          const revenueResponse = await fetchShopRevenue(currentShopId);
          const financialSummary =
            revenueResponse.data?.financial_summary || {};
          const totalRevenue = parseFloat(
            financialSummary.completed_money || 0
          );

          // 4. Fetch monthly revenue
          const monthlyRevenueResponse = await fetchShopMonthlyRevenue(
            currentShopId
          );
          const monthlyData = monthlyRevenueResponse.data || {};

          // 5. Fetch products count
          const postsData = await fetchMarketplacePosts();
          const shopProducts = (postsData.posts || []).filter(
            (p) => p.shop_id === currentShopId
          );
          const totalProducts = shopProducts.length;

          setShopStats({
            totalOrders,
            totalProducts,
            totalRevenue,
            totalCustomers,
            completionRate,
          });

          setMonthlyRevenue({
            current: parseFloat(monthlyData.total_revenue || 0),
            month:
              monthlyData.month ||
              new Date().toLocaleDateString("vi-VN", { month: "long" }),
          });
        } catch (apiError) {
          console.error("Error fetching shop stats:", apiError);
          // Keep default values if API fails
        }
      }
    } catch (error) {
      console.error("Error fetching shop data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopData();
  }, []);

  const statsData = [
    {
      title: "Tổng doanh thu",
      value: loading ? 0 : shopStats.totalRevenue,
      suffix: "VND",
      icon: <DollarOutlined style={{ color: "#52c41a" }} />,
      color: "#52c41a",
      formatter: (value) => `${parseFloat(value || 0).toLocaleString()}`,
    },
    {
      title: "Đơn hàng",
      value: loading ? 0 : shopStats.totalOrders,
      suffix: "đơn",
      icon: <ShoppingCartOutlined style={{ color: "#1890ff" }} />,
      color: "#1890ff",
    },
    {
      title: "Khách hàng",
      value: loading ? 0 : shopStats.totalCustomers,
      suffix: "người",
      icon: <UserOutlined style={{ color: "#722ed1" }} />,
      color: "#722ed1",
    },
    {
      title: "Tỉ lệ hoàn thành",
      value: loading ? 0 : shopStats.completionRate,
      suffix: "%",
      icon: <CheckCircleOutlined style={{ color: "#f59e42" }} />,
      color: "#f59e42",
    },
  ];

  if (loading) {
    return (
      <div className="shop-analysic-summary">
        <Card style={{ textAlign: "center", minHeight: 200 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Đang tải dữ liệu phân tích...</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="shop-analysic-summary">
      <Card
        title={
          <span>
            <TrophyOutlined style={{ color: "#fadb14", marginRight: 8 }} />
            Thống kê tổng quan
          </span>
        }
        style={{
          marginBottom: 24,
          borderRadius: 12,
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        }}
      >
        <Row gutter={[24, 16]}>
          {statsData.map((stat, index) => (
            <Col xs={12} sm={12} md={6} key={index}>
              <div
                style={{
                  textAlign: "center",
                  padding: "16px 12px",
                  background: "#ffffff",
                  borderRadius: 8,
                  border: `1px solid ${stat.color}20`,
                  boxShadow: `0 2px 8px ${stat.color}10`,
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>{stat.icon}</div>
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  suffix={stat.suffix}
                  valueStyle={{
                    color: stat.color,
                    fontSize: "16px",
                    fontWeight: 600,
                  }}
                  formatter={stat.formatter}
                />
              </div>
            </Col>
          ))}
        </Row>

        <Divider style={{ margin: "16px 0" }} />

        <Row justify="center">
          <Col>
            <div style={{ textAlign: "center" }}>
              <RiseOutlined
                style={{ color: "#52c41a", fontSize: 20, marginRight: 8 }}
              />
              <span style={{ color: "#52c41a", fontWeight: 600, fontSize: 16 }}>
                {shopStats.completionRate >= 80
                  ? "Hiệu quả cao"
                  : shopStats.completionRate >= 60
                  ? "Hiệu quả trung bình"
                  : "Cần cải thiện"}
              </span>
            </div>
          </Col>
        </Row>
      </Card>

      <Row gutter={24}>
        <Col span={12}>
          <Card
            size="small"
            style={{
              background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
              border: "1px solid #0ea5e9",
            }}
          >
            <Statistic
              title={`📈 Doanh thu ${monthlyRevenue.month || "tháng này"}`}
              value={monthlyRevenue.current}
              suffix="VND"
              valueStyle={{
                color: "#0369a1",
                fontSize: "18px",
                fontWeight: 600,
              }}
              formatter={(value) =>
                `${parseFloat(value || 0).toLocaleString()}`
              }
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card
            size="small"
            style={{
              background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
              border: "1px solid #f59e0b",
            }}
          >
            <Statistic
              title="📊 Sản phẩm hiện có"
              value={shopStats.totalProducts}
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

      <Row gutter={24} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="📈 Hiệu suất hoạt động" variant={false}>
            <div style={{ padding: "20px 0" }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>
                  Hiệu quả hoàn thành đơn hàng ({shopStats.completionRate}%)
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
                  Mức độ phổ biến - Khách hàng ({shopStats.totalCustomers}/200)
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
                  percent={Math.min((shopStats.totalProducts / 50) * 100, 100)}
                  strokeColor="#722ed1"
                  trailColor="#f5f5f5"
                />
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ShopAnalysticSummary;
