// App.jsx or Layout.jsx or any component wrapped by AuthProvider
import { useEffect } from "react";
import { useChatStore } from "./useChatStore";
import { useAuth } from "../../../contexts/AuthContext";

const SyncUserIdToStore = () => {
  const { user } = useAuth();
  const setCurrentUserId = useChatStore((state) => state.setCurrentUserId);
  const setUser = useChatStore((state) => state.setLoggedUser);
  const resetChatStore = useChatStore((state) => state.resetChatStore);

  useEffect(() => {
    if (!user) {
      resetChatStore(); // reset nếu không có user (đăng xuất)
    } else {
      setCurrentUserId(user.id.toString()); // cập nhật lại ID
      setUser(user); // cập nhật lại user object
    }
  }, [user, setCurrentUserId, setUser, resetChatStore]);

  return null;
};

export default SyncUserIdToStore;
