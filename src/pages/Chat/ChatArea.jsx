import { Image, Info } from "lucide-react";
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
import { message } from "antd";
import { useAuth } from "../../contexts/AuthContext";
import dayjs from "dayjs";

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

    const unSub = onSnapshot(doc(db, "chats", chatIdStr), (res) => {
      setChat(res.data());
    });
    return () => {
      unSub();
    };
  }, [chatId]);

  const handleSend = async () => {
    if (text === "") return;
    const firebaseUserId = await getFirebaseUserIdFromPostgresId(currentUserId);
    if (!firebaseUserId) return;

    try {
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: firebaseUserId,
          text,
          createdAt: new Date(),
        }),
      });

      const userIDs = [firebaseUserId, user.id];

      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();

          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );

          userChatsData.chats[chatIndex].lastMessage = text;
          userChatsData.chats[chatIndex].isSeen =
            id === firebaseUserId ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });
    } catch (error) {
      console.error("Error sending message:", error);
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
              <span className="text-sm text-green-500">Online</span>
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
              const isOwnMessage = message.senderId === firebaseUserId;

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
                    src={user.avatar}
                    alt={user.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex flex-col gap-2">
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
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <button className="p-2 text-pink-500 hover:text-pink-600 rounded-lg">
              <Image className="w-8 h-8" />
            </button>
            <button
              className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
              onClick={handleSend}
            >
              Send
            </button>
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
