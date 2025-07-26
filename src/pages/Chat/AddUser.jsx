import React, { useState } from "react";
import { X } from "lucide-react";
import {
  collection,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";

const AddUser = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  const [users, setUsers] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");
    console.log("Searching for username:", username);

    try {
      const userRef = collection(db, "users");
      const q = query(
        userRef,
        where("username", ">=", username),
        where("username", "<", username + "\uf8ff")
      );
      const querySnapshot = await getDocs(q); // ✅ Correct function

      if (!querySnapshot.empty) {
        const results = querySnapshot.docs.map((doc) => doc.data());
        setUsers(results);
      } else {
        setUsers([]); // clear if none found
      }
    } catch (error) {
      console.error("Search failed:", error);
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
                <button className="py-1 px-3 text-sm bg-pink-500 text-white rounded hover:bg-pink-600 transition">
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
