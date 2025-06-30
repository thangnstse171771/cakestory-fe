import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllUsers, deleteUser, fetchAllShops } from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import CakeLoader from "../cake-loader";
import useAdminLoader from "../hooks/useAdminLoader";

// Import components
import SearchForm from "./Admin/SearchForm";
import ViewControls from "./Admin/ViewControls";
import AccountsTable from "./Admin/AccountsTable";
import AccountDetailModal from "./Admin/AccountDetailModal";
import ConfirmDeleteModal from "./Admin/ConfirmDeleteModal";
import Pagination from "./Admin/Pagination";

// Import utils
import {
  getIsPremium,
  getIsBaker,
  getStatusValue,
  filterAccounts,
} from "./Admin/utils";

const AdminDashboard = () => {
  const [accounts, setAccounts] = useState([]);
  const [view, setView] = useState("all"); // all, premium, shops, admin
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const navigate = useNavigate();

  // Admin Loader hook
  const {
    isLoading,
    loadingText,
    progress,
    withLoadingAndProgress,
    deleteLoading,
    withDeleteLoading,
  } = useAdminLoader();

  // Search state
  const [search, setSearch] = useState({
    username: "",
    email: "",
    status: "",
    premium: "",
    shop: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [shops, setShops] = useState([]);

  // Fetch real data from API with loading and progress
  useEffect(() => {
    const fetchData = async () => {
      await withLoadingAndProgress(async () => {
        try {
          const [usersData, shopsData] = await Promise.all([
            fetchAllUsers(),
            fetchAllShops(),
          ]);

          setAccounts(usersData.users || []);
          setShops(shopsData.shops || []);
          console.log("All accounts data:", usersData.users || []);
          console.log("All shops data:", shopsData.shops || []);
        } catch (err) {
          console.error("Failed to fetch data:", err);
          toast.error("Không thể tải dữ liệu. Vui lòng thử lại!");
        }
      }, "Đang tải danh sách tài khoản và cửa hàng...");
    };

    fetchData();
  }, []); // chỉ chạy 1 lần khi mount

  const handleRemoveAccount = async (id) => {
    const account = accounts.find((acc) => acc.id === id);
    setAccountToDelete(account);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!accountToDelete) return;

    await withDeleteLoading(accountToDelete.id, async () => {
      const toastId = toast.loading("Đang xóa tài khoản...");
      try {
        await deleteUser(accountToDelete.id);
        setAccounts(
          accounts.filter((account) => account.id !== accountToDelete.id)
        );
        toast.success("Xóa tài khoản thành công!", { id: toastId });
      } catch (error) {
        console.error("Failed to delete user:", error);
        toast.error("Xóa tài khoản thất bại!", { id: toastId });
      } finally {
        setShowConfirmModal(false);
        setAccountToDelete(null);
      }
    });
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setAccountToDelete(null);
  };

  const handleToggleRestriction = (id) => {
    setAccounts(
      accounts.map((account) => {
        if (account.id === id) {
          const newStatus =
            account.status === "active" ? "restricted" : "active";
          return {
            ...account,
            status: newStatus,
          };
        }
        return account;
      })
    );
  };

  const handleViewDetails = (account) => {
    setShowModal(true);
    setModalLoading(true);
    setTimeout(() => {
      setSelectedAccount(account);
      setModalLoading(false);
    }, 600);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAccount(null);
  };

  // Map shop info vào account
  const accountsWithShop = accounts.map((acc) => {
    const shop = shops.find((s) => s.user_id === acc.id);
    return { ...acc, shopInfo: shop };
  });

  // Lọc theo search và view
  const filteredAccounts = filterAccounts(accountsWithShop, view, search);

  // Pagination logic
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const paginatedAccounts = filteredAccounts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-8 bg-pink-50 min-h-screen">
      <Toaster position="top-right" />

      {/* Cake Loader */}
      <CakeLoader
        isVisible={isLoading}
        loadingText={loadingText}
        externalProgress={progress}
        autoStart={false}
      />

      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-pink-600 mb-8">
          Bảng điều khiển Admin
        </h1>

        {/* Search Form */}
        <SearchForm search={search} setSearch={setSearch} />

        {/* View Controls */}
        <ViewControls view={view} setView={setView} />

        {/* Accounts Table */}
        <AccountsTable
          paginatedAccounts={paginatedAccounts}
          view={view}
          getStatusValue={getStatusValue}
          getIsPremium={getIsPremium}
          getIsBaker={getIsBaker}
          handleViewDetails={handleViewDetails}
          handleToggleRestriction={handleToggleRestriction}
          handleRemoveAccount={handleRemoveAccount}
          removeLoading={deleteLoading}
        />

        {/* Pagination controls */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />

        {/* Modal View Details */}
        <AccountDetailModal
          showModal={showModal}
          selectedAccount={selectedAccount}
          modalLoading={modalLoading}
          onClose={handleCloseModal}
          getStatusValue={getStatusValue}
          getIsPremium={getIsPremium}
          getIsBaker={getIsBaker}
        />

        {/* Confirm Delete Modal */}
        <ConfirmDeleteModal
          showConfirmModal={showConfirmModal}
          accountToDelete={accountToDelete}
          onCancel={cancelDelete}
          onConfirm={confirmDelete}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
