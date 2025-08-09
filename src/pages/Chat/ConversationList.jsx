import React, { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import AddUser from "./AddUser";
import { useAuth } from "../../contexts/AuthContext";
import {
  onSnapshot,
  doc,
  query,
  collection,
  where,
  getDocs,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useChatStore } from "./libs/useChatStore";

const ConversationList = () => {
  const [chats, setChats] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const currentUserId = user?.id?.toString();
  const { chatId, changeChat } = useChatStore();

  console.log("Chat id from store:", chatId);

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

  useEffect(() => {
    const fetchAndListenChats = async () => {
      if (!user?.id) return;

      const firebaseUserId = await getFirebaseUserIdFromPostgresId(
        currentUserId
      );
      if (!firebaseUserId) return;
      // console.log("My id: " ,firebaseUserId)

      const unSub = onSnapshot(
        doc(db, "userchats", firebaseUserId),
        async (res) => {
          if (!res.exists()) {
            setChats([]);
            return;
          }

          const items = res.data().chats;

          const promises = items.map(async (item) => {
            if (item.receiverId) {
              // 1-on-1 chat
              const userDocRef = doc(db, "users", item.receiverId);
              const userDocSnap = await getDoc(userDocRef);
              const user = userDocSnap.data();

              return {
                ...item,
                user,
                isGroup: false,
              };
            } else {
              // Group chat
              const groupChatRef = doc(db, "groupChats", item.chatId);
              const groupSnap = await getDoc(groupChatRef);

              if (!groupSnap.exists()) return null;

              const groupData = groupSnap.data();

              // 💡 If I'm a shop member, show customer details instead of shop
              let displayUser = {
                username: groupData.shopName || "Group Chat",
                avatar: groupData.shopAvatar,
              };

              if (item.role === "shopMember" && groupData.customerId) {
                const customerRef = doc(db, "users", groupData.customerId);
                const customerSnap = await getDoc(customerRef);
                if (customerSnap.exists()) {
                  const customerData = customerSnap.data();
                  displayUser = {
                    username: customerData.username || "Customer",
                    avatar:
                      customerData.avatar ||
                      "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
                  };
                }
              }

              return {
                ...item,
                user: displayUser,
                isGroup: true,
              };
            }
          });

          const chatData = await Promise.all(promises);
          setChats(
            chatData
              .filter(Boolean)
              .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
          );
        }
      );

      return () => unSub();
    };

    fetchAndListenChats();
  }, [user?.id]);

  const handleSelect = async (chat) => {
    const userChats = chats.map((item) => {
      const { user, isGroup, ...rest } = item; // Exclude isGroup and user from Firebase update
      return rest;
    });

    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );

    userChats[chatIndex].isSeen = true;

    const firebaseUserId = await getFirebaseUserIdFromPostgresId(currentUserId);
    if (!firebaseUserId) return;

    const userChatsRef = doc(db, "userchats", firebaseUserId);

    try {
      await updateDoc(userChatsRef, {
        chats: userChats,
      });
    } catch (error) {
      console.log("Error updating chat:", error);
    }

    changeChat(chat.chatId, chat.user);
  };

  console.log("Chats:", chats);

  const filteredChats = chats.filter((chat) =>
    chat?.user?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-w-[180px] w-1/5 lg:w-1/4 flex flex-col bg-white rounded-l-xl shadow-sm border border-gray-100">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Messages</h2>
          <button
            className="p-2 rounded-full hover:bg-gray-100 transition"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-5 h-5 text-pink-500 hover:text-pink-600" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredChats.map((chat, index) => {
          const isUnread = chat?.lastMessage && !chat?.isSeen;
          const isSelected = chat.chatId === chatId;

          return (
            <div
              key={chat.chatId || chat.receiverId || index}
              className={`p-4 border-b border-gray-100 cursor-pointer h-auto
                ${isSelected ? "bg-pink-100" : isUnread ? "bg-pink-50" : ""}
              hover:bg-gray-50`}
              onClick={() => handleSelect(chat)}
            >
              <div className="flex items-center space-x-3">
                <img
                  src={
                    chat.user?.avatar ||
                    "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                  }
                  alt={chat.user?.username || "Chat"}
                  className="w-12 h-12 rounded-full"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate max-w-[150px]">
                        {chat.user?.username || "Chat"}
                      </h3>

                      {chat.role === "customer" && (
                        <span className="bg-pink-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          Shop
                        </span>
                      )}
                      {chat.role === "shopMember" && (
                        <span className="bg-pink-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          Customer
                        </span>
                      )}
                    </div>
                  </div>

                  <p
                    className={`text-sm truncate ${
                      isUnread ? "text-gray-900 font-medium" : "text-gray-600"
                    }`}
                  >
                    {chat.lastMessage}
                  </p>
                </div>

                {isUnread && (
                  <div className="bg-pink-500 text-white text-xs rounded-full w-2 h-2 ml-2" />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <AddUser isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default ConversationList;
