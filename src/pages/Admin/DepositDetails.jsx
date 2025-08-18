import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchAllDepositsAdmin } from "../../api/axios";

export default function DepositDetails() {
	const { id } = useParams();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [deposit, setDeposit] = useState(null);

	useEffect(() => {
		const load = async () => {
			try {
				setLoading(true);
				setError(null);
				// There is no dedicated fetch-deposit-by-id API in axios.js; fetch all and pick by id
				const res = await fetchAllDepositsAdmin();
				let list = [];
				if (Array.isArray(res)) list = res;
				else if (Array.isArray(res?.data?.deposits)) list = res.data.deposits;
				else if (Array.isArray(res?.deposits)) list = res.deposits;
				else if (Array.isArray(res?.data)) list = res.data;
				const found = list.find((d) => String(d.id) === String(id));
				if (!found) throw new Error("Không tìm thấy giao dịch nạp tiền");
				setDeposit(found);
			} catch (e) {
				setError(e.message || "Lỗi tải chi tiết deposit");
			} finally {
				setLoading(false);
			}
		};
		load();
	}, [id]);

	if (loading) return <div className="p-8">Đang tải chi tiết...</div>;
	if (error)
		return <div className="p-8 text-red-600">Lỗi: {String(error)}</div>;
	if (!deposit) return <div className="p-8">Không có dữ liệu</div>;

	const formatCurrency = (amount) =>
		new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
			Number(deposit.amount || 0)
		);

	return (
		<div className="p-8 bg-pink-50 min-h-screen">
			<div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
				<div className="flex items-center justify-between mb-4">
					<h1 className="text-2xl font-bold text-gray-800">
						Chi tiết giao dịch nạp #{deposit.id}
					</h1>
					<button
						className="px-4 py-2 rounded-lg bg-pink-500 text-white hover:bg-pink-600"
						onClick={() => navigate(-1)}
					>
						Quay lại
					</button>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<div className="text-gray-600">Người dùng</div>
						<div className="font-semibold">
							{deposit.user?.username || deposit.user?.full_name || deposit.user_id}
						</div>
					</div>
					<div>
						<div className="text-gray-600">Số tiền</div>
						<div className="font-semibold">{formatCurrency(deposit.amount)}</div>
					</div>
					<div>
						<div className="text-gray-600">Trạng thái</div>
						<div className="font-semibold capitalize">{deposit.status}</div>
					</div>
					<div>
						<div className="text-gray-600">Thời gian</div>
						<div className="font-semibold">
							{new Date(deposit.created_at || deposit.createdAt).toLocaleString(
								"vi-VN"
							)}
						</div>
					</div>
					{deposit.description && (
						<div className="md:col-span-2">
							<div className="text-gray-600">Mô tả</div>
							<div className="font-medium">{deposit.description}</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
