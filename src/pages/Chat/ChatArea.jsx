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
import ChatInfo from "./ChatInfo";
import { useAuth } from "../../contexts/AuthContext";
import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import upload from "./libs/upload";

dayjs.extend(calendar);
dayjs.extend(relativeTime);
dayjs.locale("vi");

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
    const images = document.querySelectorAll(".chat-image");

    if (images.length === 0) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    let loadedCount = 0;

    images.forEach((img) => {
      if (img.complete) {
        loadedCount++;
      } else {
        img.onload = () => {
          loadedCount++;
          if (loadedCount === images.length) {
            endRef.current?.scrollIntoView({ behavior: "smooth" });
          }
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount === images.length) {
            endRef.current?.scrollIntoView({ behavior: "smooth" });
          }
        };
      }
    });

    if (loadedCount === images.length) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
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

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          setImage(file); // same as file input flow
        }
      }
    }
  };

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

  const extractImagesFromMessages = (messages = []) =>
    messages
      .map((m) => {
        if (m.img) return m.img;
        if (m.text?.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i)) {
          return m.text;
        }
        return null;
      })
      .filter(Boolean);

  const chatImages = extractImagesFromMessages(chat?.messages);

  const MAX_MESSAGE_LENGTH = 1000;

  const formatTimestamp = (timestamp) => {
  if (!timestamp) return "";
  const date = timestamp?.toDate ? timestamp.toDate() : timestamp;
  return dayjs(date).calendar(null, {
    sameDay: "[Hôm nay] [lúc] HH:mm",       // Hôm nay
    lastDay: "[Hôm qua] [lúc] HH:mm",       // Hôm qua
    lastWeek: "dddd [tuần trước] HH:mm",           // Tuần trước (Thứ Hai, Thứ Ba…)
    sameElse: "DD/MM/YYYY [lúc] HH:mm",     // Ngày khác
  });
};


  const chatPrompts = [
    "Shop mình mở từ mấy giờ ạ?",
    "Mình có thể xem menu được không?",
    "Mình đặt hàng như thế nào?",
    "Shop thường mất bao lâu để làm và giao bánh?",
    "Best seller của shop mình là bánh nào ạ?",
  ];

  return (
    <div className="flex flex-1 rounded-r-xl shadow-sm border-t border-r border-b border-gray-100">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={
                user?.avatar ||
                "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
              }
              alt={user?.username || "Unknown User"}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h3 className="font-semibold text-gray-800">{user?.username}</h3>
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

        <div className="flex-1 p-4 overflow-y-auto bg-gray">
          <div className="space-y-4">
            {chat?.messages?.map((message) => {
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
                      className="chat-image rounded-md max-w-[350px] object-cover"
                    />
                  )}

                  {message.text?.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i) ? (
                    <>
                      <img
                        src={message.text}
                        alt="Sent image"
                        className="chat-image rounded-md max-w-[350px] object-cover"
                      />
                      <div className="bg-pink-500 text-white rounded-lg p-3 max-w-xs">
                        <span className="text-xs text-white/70 mt-1 block">
                          {formatTimestamp(message.createdAt)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="bg-pink-500 text-white rounded-lg p-3 max-w-xs">
                      <p className="text-sm break-words whitespace-pre-wrap">
                        {message.text}
                      </p>
                      <span className="text-xs text-white/70 mt-1 block">
                        {formatTimestamp(message.createdAt)}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="flex items-start space-x-3"
                  key={message.createdAt}
                >
                  <img
                    src={
                      user?.avatar ||
                      "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                    }
                    alt={user?.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex flex-col items-start gap-2">
                    {message.img && (
                      <img
                        src={message.img}
                        alt="Sent media"
                        className="chat-image rounded-md max-w-[350px] object-cover"
                      />
                    )}

                    {message.text?.match(
                      /\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i
                    ) ? (
                      <>
                        <img
                          src={message.text}
                          alt="Sent media"
                          className="chat-image rounded-md max-w-[350px] object-cover"
                        />
                        <div className="bg-pink-100 rounded-lg p-3 max-w-xs">
                          <span className="text-xs text-gray-500 mt-1 block">
                            {formatTimestamp(message.createdAt)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="bg-pink-100 rounded-lg p-3 max-w-xs">
                        <p className="text-sm text-gray-800 break-words whitespace-pre-wrap">
                          {message.text}
                        </p>
                        <span className="text-xs text-gray-500 mt-1 block">
                          {formatTimestamp(message.createdAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <div ref={endRef}></div>
          </div>
        </div>

        <div className="p-4 border-t bg-white border-gray-200">
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

          {/* Chat prompts */}
          {currentUserChatEntry?.role === "customer" && (
            <div className="flex flex-wrap gap-2 mb-3">
              {chatPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setText(prompt)}
                  className="bg-gray-100 hover:bg-pink-200 text-sm text-gray-800 px-3 py-1 rounded-full transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input and buttons */}
          <div className="flex items-center space-x-2">
            <textarea
              placeholder="Hãy viết gì đó..."
              value={text}
              maxLength={MAX_MESSAGE_LENGTH}
              onChange={(e) => setText(e.target.value)}
              onPaste={handlePaste}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault(); // stop newline
                  handleSend(); // send message
                }
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
              rows={1}
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
        avatar={user?.avatar}
        name={user?.username}
        images={chatImages || []}
      />
    </div>
  );
};

export default ChatArea;
