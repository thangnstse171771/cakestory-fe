import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../../pages/Chat/libs/useChatStore";
import { useAuth } from "../../contexts/AuthContext";
import { authAPI } from "../../api/auth";
import { getOrCreateShopChat } from "../../pages/Chat/libs/shopChatUtils";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

const ShopHeader = ({ shop, isOwner, onUpdateClick, onCreateClick }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const setChatId = useChatStore((state) => state.changeChat);
  const customerFirebaseId = user?.firebase_uid;
  const getFirebaseUserIdFromPostgresId = useChatStore(
    (state) => state.getFirebaseUserIdFromPostgresId
  );
  const [loadingChat, setLoadingChat] = useState(false);

  const handleChatClick = async () => {
    try {
      setLoadingChat(true);
      const data = await authAPI.getShopMembersByShopId(shop.id);
      const active = data.members.filter((member) => member.is_active);

      // Get Firebase IDs for all shop Members
      let shopMemberFirebaseIds = await Promise.all(
        active.map((m) => getFirebaseUserIdFromPostgresId(m.user_id))
      );
      shopMemberFirebaseIds = shopMemberFirebaseIds.filter(Boolean);

      // Debug log
      // console.log("shopMemberFirebaseIds:", shopMemberFirebaseIds);

      const memberFirebaseIds = [
        customerFirebaseId,
        ...shopMemberFirebaseIds,
      ].filter(Boolean);

      const chatId = await getOrCreateShopChat(
        shop.id,
        memberFirebaseIds,
        shop.name,
        shop.avatar,
        customerFirebaseId,
        shopMemberFirebaseIds
      );

      // Fetch the group chat data to get the complete shop information
      const groupChatRef = doc(db, "groupChats", chatId);
      const groupChatSnap = await getDoc(groupChatRef);

      let shopUser = {
        id: shop.id,
        username: shop.name,
        avatar:
          shop.avatar ||
          "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
        isShop: true,
      };

      // If group chat exists, use its data
      if (groupChatSnap.exists()) {
        const groupData = groupChatSnap.data();
        console.log("🔍 Group chat data:", groupData);
        shopUser = {
          id: groupData.shopId || shop.id, // Use shopId from Firestore if available
          username: groupData.shopName || shop.name,
          avatar:
            groupData.shopAvatar ||
            shop.avatar ||
            "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
          isShop: true,
        };
        console.log("✅ Created shopUser object:", shopUser);
      }

      setChatId(chatId, shopUser);
      navigate("/chat");
    } catch (error) {
      console.error("Error fetching shop members or creating chat:", error);
    } finally {
      setLoadingChat(false); // Always stop loading
    }
  };

  return (
    <>
      {/* Hero / Background Section */}
      <div className="relative w-full h-64 md:h-80 rounded-3xl overflow-visible mb-24 shadow-xl ring-1 ring-pink-200/40">
        {shop.background_image ? (
          <img
            src={shop.background_image}
            alt="Ảnh nền shop"
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-pink-200 via-rose-100 to-purple-100">
            <svg
              className="w-20 h-20 text-pink-300/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="mt-3 text-pink-500 font-medium tracking-wide">
              Chưa có ảnh nền
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
        {/* Floating Avatar Card */}
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 md:-translate-x-0 md:left-16 flex flex-col items-center md:items-start z-20">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-tr from-pink-300 via-fuchsia-300 to-purple-300 rounded-full blur opacity-60 group-hover:opacity-90 transition duration-500"></div>
            <div className="relative p-1 bg-white rounded-full shadow-xl">
              <img
                src={shop.avatar || "/placeholder.svg"}
                alt={shop.name || "Shop avatar"}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover ring-4 ring-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Info Card */}
      <div className="relative -mt-8 md:-mt-20 bg-white/85 backdrop-blur-xl rounded-3xl px-6 md:px-10 pt-28 md:pt-16 pb-10 mb-10 shadow-lg border border-pink-100 hover:shadow-xl transition-all duration-300 z-10">
        {!isOwner && (
          <button
            className="absolute top-4 right-4 flex items-center gap-2 bg-gradient-to-r from-white to-pink-50 border border-pink-200 text-pink-700 font-medium px-4 py-2 rounded-full shadow-sm hover:shadow-md hover:from-pink-50 hover:to-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-300"
            onClick={handleChatClick}
            disabled={loadingChat}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8-1.44 0-2.794-.308-4-.855L3 21l1.405-4.215A7.963 7.963 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            {loadingChat ? "Đang mở..." : "Nhắn tin"}
          </button>
        )}

        <div className="flex flex-col md:flex-row md:items-start gap-10">
          <div className="flex-1 space-y-6">
            <div>
              <h1
                className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight break-words [text-wrap:balance]"
                style={{ WebkitTextStroke: "0.25px rgba(0,0,0,0.05)" }}
              >
                {shop.name || "Tên Shop"}
              </h1>
              {shop.bio && (
                <p className="mt-3 text-gray-600 leading-relaxed max-w-2xl">
                  {shop.bio}
                </p>
              )}
            </div>

            {/* Info Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoItem
                iconPath="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                label="Hotline"
                value={shop.phone_number || "—"}
              />
              <InfoItem
                iconPath="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                label="Giờ mở cửa"
                value={shop.business_hours || "—"}
              />
              <InfoItem
                iconPath="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                label="Khu vực giao"
                value={shop.delivery_area || "—"}
              />
              <InfoItem
                iconPath="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                label="Địa chỉ"
                value={shop.business_address || "—"}
              />
            </div>
          </div>

          {isOwner && (
            <div className="flex flex-col gap-4 w-full md:w-56">
              <OwnerActionButton
                onClick={onUpdateClick}
                iconPath="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                label="Chỉnh Sửa Shop"
              />
              <OwnerActionButton
                onClick={onCreateClick}
                iconPath="M12 6v6m0 0v6m0-6h6m-6 0H6"
                label="Tạo Sản Phẩm"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ShopHeader;

// Sub components (UI only) --------------------------------------------------
const InfoItem = ({ iconPath, label, value }) => (
  <div className="group relative bg-gradient-to-br from-pink-50 to-white border border-pink-100 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-all duration-300">
    <div className="flex items-start gap-3">
      <div className="mt-0.5 p-2 rounded-lg bg-white shadow-inner ring-1 ring-pink-100">
        <svg
          className="w-5 h-5 text-pink-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d={iconPath}
          />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs uppercase tracking-wide text-pink-600 font-semibold">
          {label}
        </div>
        <div
          className="mt-0.5 text-gray-800 text-sm font-medium truncate"
          title={value}
        >
          {value}
        </div>
      </div>
    </div>
  </div>
);

const OwnerActionButton = ({ iconPath, label, onClick }) => (
  <button
    onClick={onClick}
    className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white px-5 py-3 font-medium shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-400 transition-all duration-300"
  >
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.45),transparent_70%)] transition-opacity" />
    <span className="relative flex items-center gap-2 justify-center">
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d={iconPath}
        />
      </svg>
      {label}
    </span>
  </button>
);
