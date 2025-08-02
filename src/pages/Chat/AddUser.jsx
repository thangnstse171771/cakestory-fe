import React, { useState } from "react";
import { X } from "lucide-react";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";

const AddUser = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  const [users, setUsers] = useState([]);
  const { user } = useAuth();
  const currentUserId = user?.id?.toString();
  const [existingChatUserIds, setExistingChatUserIds] = useState([]);

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

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");

    try {
      const currentFirebaseId = await getFirebaseUserIdFromPostgresId(
        currentUserId
      );
      if (!currentFirebaseId) {
        console.warn("No Firebase ID found for current user.");
        return;
      }

      // Step 1: Fetch user's current chat partners
      const userChatsSnap = await getDoc(
        doc(db, "userchats", currentFirebaseId)
      );
      const chatUserIds = userChatsSnap.exists()
        ? userChatsSnap.data().chats.map((chat) => chat.receiverId)
        : [];
      setExistingChatUserIds(chatUserIds); // 👈 store them in state

      // Step 2: Search by username
      const userRef = collection(db, "users");
      const q = query(
        userRef,
        where("username", ">=", username),
        where("username", "<", username + "\uf8ff")
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const results = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter(
            (u) => u.id !== currentFirebaseId && !chatUserIds.includes(u.id)
          ); // 👈 exclude existing chats
        setUsers(results);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  const handleAdd = async (user) => {
    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchats");

    try {
      const currentFirebaseId = await getFirebaseUserIdFromPostgresId(
        currentUserId
      );
      if (!currentFirebaseId) {
        console.error(
          "Current Firebase user ID not found for Postgres ID:",
          currentUserId
        );
        return;
      }
      console.log("Current Firebase ID:", currentFirebaseId);

      const newChatRef = doc(chatRef);

      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      await updateDoc(doc(userChatsRef, user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          receiverId: currentFirebaseId,
          lastMessage: "",
          createdAt: Date.now(),
        }),
      });

      await updateDoc(doc(userChatsRef, currentFirebaseId), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          receiverId: user.id,
          lastMessage: "",
          createdAt: Date.now(),
        }),
      });

      console.log("New chat created:", newChatRef.id);
    } catch (error) {
      console.error("Chat error: ", error);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      {/* Modal Card */}
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl relative">
        {/* Close Button */}
        <button className="absolute top-3 right-3" onClick={onClose}>
          <X className="w-5 h-5 text-pink-500 hover:text-pink-600" />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Add New User
        </h2>

        {/* Search Form */}
        <form className="mb-6" onSubmit={handleSearch}>
          <input
            name="username"
            type="text"
            placeholder="Enter username"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 mb-4"
          />
          <button
            type="submit"
            className="w-full py-2 px-4 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
          >
            Search
          </button>
        </form>

        {/* Sample Search Result */}
        {users.length > 0 && (
          <div className="max-h-64 overflow-y-auto space-y-4">
            {users.map((user, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={
                      user.avatar ||
                      "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                    }
                    alt="avatar"
                    className="w-10 h-10 rounded-full"
                  />
                  <span className="text-gray-800 font-medium">
                    {user.username}
                  </span>
                </div>
                <button
                  className="py-1 px-3 text-sm bg-pink-500 text-white rounded hover:bg-pink-600 transition"
                  onClick={() => handleAdd(user)}
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddUser;
