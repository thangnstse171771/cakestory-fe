import React from "react";
import { Card, Row, Col, Statistic, Progress } from "antd";
import { ShoppingCartOutlined, StarFilled } from "@ant-design/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

const revenueData = [
  { month: "T1", revenue: 2000000 },
  { month: "T2", revenue: 2500000 },
  { month: "T3", revenue: 1800000 },
  { month: "T4", revenue: 3000000 },
  { month: "T5", revenue: 2200000 },
  { month: "T6", revenue: 2700000 },
  { month: "T7", revenue: 1200000 },
];
const COLORS = ["#f59e42", "#f472b6", "#f9a8d4", "#ec4899", "#eab308"];

const ShopAnalysticSummary = () => (
  <div className="shop-analysic-summary">
    <Row gutter={24}>
      <Col span={6}>
        <Statistic
          title="Doanh thu"
          value={12000000}
          suffix="VND"
          valueStyle={{ color: "#f59e42" }}
        />
      </Col>
      <Col span={6}>
        <Statistic
          title="Đơn hàng"
          value={320}
          prefix={<ShoppingCartOutlined />}
        />
      </Col>
      <Col span={6}>
        <Statistic title="Sản phẩm" value={25} />
      </Col>
      <Col span={6}>
        <Statistic
          title="Đánh giá"
          value={4.8}
          suffix={<StarFilled style={{ color: "#fadb14" }} />}
          valueStyle={{ color: "#fadb14" }}
        />
      </Col>
    </Row>
    <Row gutter={24} style={{ marginTop: 24 }}>
      <Col span={16}>
        <Card title="Doanh thu 7 tháng gần nhất" variant={false}>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(v) => v.toLocaleString()} />
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
      <Col span={8}>
        <Card title="Tiến độ mục tiêu tháng" variant={false}>
          <Progress percent={75} status="active" strokeColor="#f472b6" />
        </Card>
      </Col>
    </Row>
  </div>
);

export default ShopAnalysticSummary;
