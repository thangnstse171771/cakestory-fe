import React from "react";
import { Card, Row, Col, Statistic, Divider } from "antd";
import {
  TrophyOutlined,
  RiseOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const ShopStatsCard = ({
  totalRevenue,
  totalOrders,
  totalCustomers,
  completionRate,
  totalProducts,
  loading,
}) => {
  const statsData = [
    {
      title: "Tổng doanh thu",
      value: totalRevenue,
      suffix: "VND",
      icon: <DollarOutlined style={{ color: "#52c41a" }} />,
      color: "#52c41a",
      formatter: (value) => `${parseFloat(value * 0.95 || 0).toLocaleString()}`,
    },
    {
      title: "Đơn hàng",
      value: totalOrders,
      suffix: "đơn",
      icon: <ShoppingCartOutlined style={{ color: "#1890ff" }} />,
      color: "#1890ff",
    },
    {
      title: "Khách hàng",
      value: totalCustomers,
      suffix: "người",
      icon: <UserOutlined style={{ color: "#722ed1" }} />,
      color: "#722ed1",
    },
    {
      title: "Tỉ lệ hoàn thành",
      value: completionRate,
      suffix: "%",
      icon: <CheckCircleOutlined style={{ color: "#f59e42" }} />,
      color: "#f59e42",
    },
  ];

  return (
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
                value={loading ? 0 : stat.value}
                suffix={stat.suffix}
                valueStyle={{
                  color: stat.color,
                  fontSize: "16px",
                  fontWeight: 600,
                }}
                loading={loading}
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
              {completionRate >= 80
                ? "Hiệu quả cao"
                : completionRate >= 60
                ? "Hiệu quả trung bình"
                : "Cần cải thiện"}
            </span>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default ShopStatsCard;
