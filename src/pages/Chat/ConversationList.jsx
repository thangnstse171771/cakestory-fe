import React, { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import AddUser from "./AddUser";
import { useAuth } from "../../contexts/AuthContext";
import { onSnapshot, doc, query, collection, where, getDocs, getDoc } from "firebase/firestore";
import { db } from "../../firebase";

const ConversationList = () => {
  const [chats, setChats] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const currentUserId = user?.id?.toString();

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

      const firebaseUserId = await getFirebaseUserIdFromPostgresId(currentUserId);
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
            const userDocRef = doc(db, "users", item.receiverId);
            const userDocSnap = await getDoc(userDocRef);
            const user = userDocSnap.data();

            return { ...item, user };
          });

          const chatData = await Promise.all(promises);
          setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
        }
      );

      return () => unSub();
    };

    fetchAndListenChats();
  }, [user?.id]);

  // useEffect(() => {
  //   if (!currentUserId) return;

  //   const unSub = onSnapshot(
  //     doc(db, "userchats", currentUserId),
  //     async (res) => {
  //       if (!res.exists()) {
  //         setChats([]);
  //         return;
  //       }

  //       const items = res.data().chats;

  //       const promises = items.map(async (item) => {
  //         const userDocRef = doc(db, "users", item.receiverId);
  //         const userDocSnap = await getDoc(userDocRef);
  //         const user = userDocSnap.data();

  //         return { ...item, user };
  //       });

  //       const chatData = await Promise.all(promises);

  //       setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
  //     }
  //   );

  //   return () => unSub();
  // }, [currentUserId]);

  console.log("Chats:", chats);

  const conversations = [
    {
      id: 1,
      name: "Sarah Baker",
      lastMessage: "Thanks for the cake recipe!",
      time: "2m ago",
      unread: 2,
      avatar:
        "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
    },
    {
      id: 2,
      name: "Cake Lovers Group",
      lastMessage: "New chocolate cake tutorial posted",
      time: "1h ago",
      unread: 0,
      avatar:
        "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
    },
    {
      id: 3,
      name: "Mike Johnson",
      lastMessage: "Can you make a custom cake for my wedding?",
      time: "3h ago",
      unread: 1,
      avatar:
        "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
    },
    {
      id: 4,
      name: "Mike Johnson",
      lastMessage: "Can you make a custom cake for my wedding?",
      time: "3h ago",
      unread: 1,
      avatar:
        "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
    },
    // {
    //   id: 5,
    //   name: "Mike Johnson",
    //   lastMessage: "Can you make a custom cake for my wedding?",
    //   time: "3h ago",
    //   unread: 1,
    //   avatar: "/placeholder.svg?height=40&width=40",
    // },
    // {
    //   id: 6,
    //   name: "Mike Johnson",
    //   lastMessage: "Can you make a custom cake for my wedding?",
    //   time: "3h ago",
    //   unread: 1,
    //   avatar: "/placeholder.svg?height=40&width=40",
    // },
    // {
    //   id: 7,
    //   name: "Mike Johnson",
    //   lastMessage: "Can you make a custom cake for my wedding?",
    //   time: "3h ago",
    //   unread: 1,
    //   avatar: "/placeholder.svg?height=40&width=40",
    // },
    // {
    //   id: 8,
    //   name: "Mike Johnson",
    //   lastMessage: "Can you make a custom cake for my wedding?",
    //   time: "3h ago",
    //   unread: 1,
    //   avatar: "/placeholder.svg?height=40&width=40",
    // },
  ];

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
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chats.map((chat, index) => (
          <div
            key={chat.chatId || chat.receiverId || index}
            className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer h-auto"
          >
            <div className="flex items-center space-x-3">
              <img
                src={chat.user.avatar || "/placeholder.svg"}
                alt={chat.user.username}
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800 truncate">
                    {chat.user.username}
                  </h3>
                  <span className="text-xs text-gray-500">{chat.time}</span>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {chat.lastMessage}
                </p>
              </div>
              {/* {conversation.unread > 0 && (
                <div className="bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {chat.unread}
                </div>
              )} */}
            </div>
          </div>
        ))}
      </div>
      <AddUser isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default ConversationList;
