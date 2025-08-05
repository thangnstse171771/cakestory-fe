import { Image, Info, Send, SendHorizonal, X } from "lucide-react";
import React, { use, useEffect, useRef, useState } from "react";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useChatStore } from "./libs/useChatStore";
import { getOrCreateShopChat } from "./libs/shopChatUtils";
import ChatInfo from "./ChatInfo";
import { message } from "antd";
import { useAuth } from "../../contexts/AuthContext";
import dayjs from "dayjs";
import upload from "./libs/upload";

const OPPOSING_USER = {
  avatar:
    "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
  name: "Sarah Baker",
  images: [
    "https://assets.epicurious.com/photos/65ca8c02e09b10a92f8e7775/4:3/w_5132,h_3849,c_limit/Swiss-Meringue-Buttercream_RECIPE.jpg",
  ],
};

const ChatArea = () => {
  const [text, setText] = useState("");
  const [chat, setChat] = useState();
  const { user: curentUser } = useAuth();
  const currentUserId = curentUser?.id?.toString();
  const [showUserInfo, setShowUserInfo] = useState(false);
  const { chatId, user } = useChatStore();
  const endRef = useRef(null);
  const [firebaseUserId, setFirebaseUserId] = useState(null);
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);
  const [isSending, setIsSending] = useState(false);
  const [currentUserChatEntry, setCurrentUserChatEntry] = useState(null);

  console.log("check user", user);

  useEffect(() => {
    const fetchCurrentUserChatEntry = async () => {
      if (!firebaseUserId || !chatId) return;

      const userChatsRef = doc(db, "userchats", firebaseUserId);
      const userChatsSnapshot = await getDoc(userChatsRef);

      if (userChatsSnapshot.exists()) {
        const chats = userChatsSnapshot.data().chats || [];
        const entry = chats.find((c) => c.chatId === chatId);
        setCurrentUserChatEntry(entry);
      }
    };

    fetchCurrentUserChatEntry();
  }, [firebaseUserId, chatId]);

  useEffect(() => {
    const fetchFirebaseId = async () => {
      const id = await getFirebaseUserIdFromPostgresId(currentUserId);
      setFirebaseUserId(id);
    };

    if (currentUserId) {
      fetchFirebaseId();
    }
  }, [currentUserId]);

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
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  useEffect(() => {
    if (!chatId) return;
    const chatIdStr = String(chatId);

    const unsub = onSnapshot(doc(db, "chats", chatIdStr), async (res) => {
      const chatData = res.data();
      if (!chatData) return;

      const groupChatDoc = await getDoc(doc(db, "groupChats", chatIdStr));
      chatData.isGroup = groupChatDoc.exists();

      if (chatData.isGroup) {
        const groupChatData = groupChatDoc.data();

        chatData.shopMemberIds = groupChatData.shopMemberIds || [];
        chatData.customerId = groupChatData.customerId || null;
        chatData.members = groupChatData.members || []; // optional
      }

      setChat(chatData);
    });

    return () => unsub();
  }, [chatId]);

  const handleRemoveImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null; // Reset the input
    }
  };

  const handleSend = async () => {
    if (!text && !image) return;
    if (isSending) return;

    setIsSending(true);

    try {
      let imageUrl = null;

      const firebaseUserId = await getFirebaseUserIdFromPostgresId(
        currentUserId
      );
      if (!firebaseUserId) return;

      if (image) {
        imageUrl = await upload(image);
      }

      // Determine sender role from currentUserChatEntry
      // const senderRole = currentUserChatEntry?.role || "customer"; // Fallback to 'customer' if undefined
      const senderRole = currentUserChatEntry?.role;

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: firebaseUserId,
          text,
          createdAt: new Date(),
          ...(senderRole && { senderRole }),
          ...(imageUrl && { img: imageUrl }),
        }),
      });

      // Get full participant list from chat data
      const participantIds = chat?.isGroup
        ? [...(chat?.shopMemberIds || []), chat?.customerId].filter(Boolean)
        : [firebaseUserId, user.id]; // fallback for 1-on-1 chats

      await Promise.all(
        participantIds.map(async (id) => {
          const userChatsRef = doc(db, "userchats", id);
          const userChatsSnapshot = await getDoc(userChatsRef);

          if (!userChatsSnapshot.exists()) return;

          const userChatsData = userChatsSnapshot.data();

          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );

          if (chatIndex === -1) return;

          const isSender = id === firebaseUserId;

          userChatsData.chats[chatIndex].lastMessage = text || "Hình ảnh";
          userChatsData.chats[chatIndex].updatedAt = Date.now();
          userChatsData.chats[chatIndex].isSeen = isSender;

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        })
      );

      setText("");
      setImage(null);
      if (fileInputRef.current) fileInputRef.current.value = null;
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-1 bg-white rounded-r-xl shadow-sm border-t border-r border-b border-gray-100">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4  border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={
                user.avatar ||
                "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
              }
              alt={user.username}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h3 className="font-semibold text-gray-800">{user.username}</h3>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setShowUserInfo((v) => !v)}
            >
              <Info className="w-5 h-5 text-pink-500 hover:text-pink-600" />
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            {chat?.messages?.map((message) => {
              // const isOwnMessage = (() => {
              //   const isGroup = chat?.isGroup;
              //   // const isSenderCustomer = message.senderId === chat?.customerId;
              //   const isSenderShopMember = chat?.shopMemberIds?.includes(
              //     message.senderId
              //   );
              //   const isCurrentUserShopMember =
              //     isGroup && currentUserChatEntry?.role === "shopMember";

              //   // If not a group chat, use default logic
              //   if (!isGroup) {
              //     return message.senderId === firebaseUserId;
              //   }

              //   // If current user is a shop member
              //   if (isCurrentUserShopMember) {
              //     // Messages from any shop member (including self) are "own"
              //     return isSenderShopMember;
              //   }

              //   // If current user is a customer, use default logic
              //   return message.senderId === firebaseUserId;
              // })();

              const isOwnMessage = (() => {
                const isGroup = chat?.isGroup;

                if (!isGroup) {
                  // In 1-on-1 chat, just compare sender IDs
                  return message.senderId === firebaseUserId;
                }

                // Prefer senderRole when present
                if (message.senderRole && currentUserChatEntry?.role) {
                  return message.senderRole === currentUserChatEntry.role;
                }

                // Fallback: if current user is a shop member, treat all shop messages as "own"
                if (currentUserChatEntry?.role === "shopMember") {
                  return chat?.shopMemberIds?.includes(message.senderId);
                }

                // Default fallback to senderId
                return message.senderId === firebaseUserId;
              })();

              return isOwnMessage ? (
                <div
                  className="flex flex-col items-end gap-2 mb-3"
                  key={message.createdAt}
                >
                  {message.img && (
                    <img
                      src={message.img}
                      alt="Sent media"
                      className="rounded-md max-w-[350px] object-cover"
                    />
                  )}
                  <div className="bg-pink-500 text-white rounded-lg p-3 max-w-xs">
                    <p className="text-sm">{message.text}</p>
                    <span className="text-xs text-white-500 mt-1 block">
                      {dayjs(message.createdAt?.toDate?.()).format("h:mm A")}
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  className="flex items-start space-x-3"
                  key={message.createdAt}
                >
                  <img
                    src={
                      user.avatar ||
                      "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                    }
                    alt={user.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex flex-col items-start gap-2">
                    {message.img && (
                      <img
                        src={message.img}
                        alt="Sent media"
                        className="rounded-md max-w-[350px] object-cover"
                      />
                    )}
                    <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                      <p className="text-sm text-gray-800">{message.text}</p>
                      <span className="text-xs text-gray-500 mt-1 block">
                        {dayjs(message.createdAt?.toDate?.()).format("h:mm A")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* <div className="flex flex-col items-end gap-2 mb-3">
              <img
                src="https://assets.epicurious.com/photos/65ca8c02e09b10a92f8e7775/4:3/w_5132,h_3849,c_limit/Swiss-Meringue-Buttercream_RECIPE.jpg"
                alt="Sent media"
                className="rounded-md max-w-[350px] object-cover"
              />

              <div className="bg-pink-500 text-white rounded-lg p-3 max-w-xs">
                <p className="text-sm">
                  Of course! I use a Swiss meringue buttercream. The key is to
                  whip the egg whites to soft peaks first.
                </p>
                <span className="text-xs text-pink-100 mt-1 block text-right">
                  10:32 AM
                </span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <img
                src={OPPOSING_USER.avatar}
                alt={OPPOSING_USER.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex flex-col gap-2">
                <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                  <p className="text-sm text-gray-800">
                    Thanks for the cake recipe!
                  </p>
                  <span className="text-xs text-gray-500 mt-1 block">
                    10:35 AM
                  </span>
                </div>
              </div>
            </div> */}
            <div ref={endRef}></div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          {image && (
            <div className="relative w-full max-w-[120px] mb-4">
              <img
                src={URL.createObjectURL(image)}
                alt="Preview"
                className="rounded-lg shadow w-full object-cover"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-1 right-1 bg-white border border-gray-300 rounded-full text-red-500 hover:text-red-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Input and buttons */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <label className="p-2 text-pink-500 hover:text-pink-600 rounded-lg cursor-pointer">
              <Image className="w-8 h-8" />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                hidden
              />
            </label>
            {(text.trim() !== "" || image) && (
              <button
                onClick={handleSend}
                disabled={isSending}
                className={`p-2 rounded-lg ${
                  isSending
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-pink-500 hover:text-pink-600"
                }`}
              >
                <SendHorizonal className="w-8 h-8" />
              </button>
            )}
          </div>
        </div>
      </div>
      {/* User Info Panel (collapsible) */}
      <ChatInfo
        open={showUserInfo}
        onClose={() => setShowUserInfo(false)}
        avatar={user.avatar}
        name={user.username}
        images={OPPOSING_USER.images}
      />
    </div>
  );
};

export default ChatArea;
