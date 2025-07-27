// App.jsx or Layout.jsx or any component wrapped by AuthProvider
import { useEffect } from "react";
import { useChatStore } from "./useChatStore";
import { useAuth } from "../../../contexts/AuthContext";

const SyncUserIdToStore = () => {
  const { user } = useAuth();
  const setCurrentUserId = useChatStore((state) => state.setCurrentUserId);
  const setUser = useChatStore((state) => state.setLoggedUser);

  useEffect(() => {
    if (user?.id) {
      setCurrentUserId(user.id.toString());
      setUser(user);
    }
  }, [user, setCurrentUserId, setUser]);

  return null;
};

export default SyncUserIdToStore;
