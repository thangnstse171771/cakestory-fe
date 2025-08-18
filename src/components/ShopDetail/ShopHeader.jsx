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

      const customerFirebaseId = await getFirebaseUserIdFromPostgresId(user.id);

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
      {/* Shop Background */}
      <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden mb-8 shadow-lg">
        {shop.background_image ? (
          <>
            <img
              src={shop.background_image}
              alt="Shop Background"
              className="w-full h-full object-cover"
              style={{ filter: "brightness(0.85)" }}
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-pink-200 via-purple-200 to-pink-100">
            <svg
              className="w-24 h-24 text-pink-300 opacity-40"
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
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-pink-400 text-lg font-semibold opacity-70">
              No background image yet
            </span>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="relative bg-pink-100/90 backdrop-blur-sm rounded-2xl p-8 mb-8 shadow-lg border border-pink-300 hover:shadow-xl transition-all duration-300">
        {/* Chat Button - Top Right */}
        {!isOwner && (
          <button
            className="absolute top-4 right-4 flex items-center gap-2 bg-white border border-pink-300 text-pink-700 font-semibold px-4 py-2 rounded-full shadow hover:shadow-md transition-all duration-300 z-10"
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
            {loadingChat ? "Opening..." : "Nhắn tin"}
          </button>
        )}

        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-500"></div>
            <img
              src={shop.avatar || "/placeholder.svg"}
              alt="avatar"
              className="relative w-[120px] h-[120px] md:w-48 md:h-48 rounded-full object-cover border-4 border-white shadow-lg transform group-hover:scale-105 transition duration-300"
            />
          </div>
          <div className="flex-1 text-left space-y-4">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900">
                {shop.name}
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                {shop.bio}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
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
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span>{shop.phone_number}</span>
              </div>

              <div className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{shop.business_hours}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
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
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>{shop.delivery_area}</span>
              </div>
            </div>
          </div>
          {isOwner && (
            <div className="flex flex-col gap-3 ml-0 md:ml-6">
              <button
                className="group relative px-6 py-3 overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={onUpdateClick}
              >
                <div className="absolute inset-0 w-3 bg-gradient-to-r from-pink-200 to-purple-200 transition-all duration-300 ease-out group-hover:w-full"></div>
                <div className="relative flex items-center justify-center gap-2">
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  <span className="font-semibold">Chỉnh Sửa Shop</span>
                </div>
              </button>
              <button
                className="group relative px-6 py-3 overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={onCreateClick}
              >
                <div className="absolute inset-0 w-3 bg-gradient-to-r from-pink-200 to-purple-200 transition-all duration-300 ease-out group-hover:w-full"></div>
                <div className="relative flex items-center justify-center gap-2">
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span className="font-semibold">Tạo Sản Phẩm</span>
                </div>
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="bg-pink-200/90 backdrop-blur-sm rounded-lg shadow p-4 flex-1 min-w-[220px] border border-pink-300 hover:shadow-md transition-all duration-300">
            <div className="text-sm font-semibold mb-1 text-pink-700">
              Địa Chỉ
            </div>
            <div className="text-gray-800 text-sm">{shop.business_address}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShopHeader;
