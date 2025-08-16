import { query, collection, where, getDocs } from "firebase/firestore";
import { create } from "zustand";
import { db } from "../../../firebase";

export const useChatStore = create((set, get) => ({
  chatId: null,
  user: null,
  currentUser: null,
  currentUserId: null, // holds current user's ID
  isCurrentUserBlocked: null,
  isReceveiverBlocked: null,

  setCurrentUserId: (id) => {
    console.log("✅ Setting currentUserId:", id);
    set({ currentUserId: id });
  },

  setLoggedUser: (user) => {
    console.log("✅ Setting full user object:", user);
    set({ currentUser: user });
  },

  changeChat: async (chatId, user) => {
    const currentUser = get().currentUser;
    const currentUserPostgresId = get().currentUserId; // get the current user's postgresId from store
    console.log(
      "🔄 Current user postgresId from store:",
      currentUserPostgresId
    );

    const currentFirebaseId = await get().getFirebaseUserIdFromPostgresId(
      currentUserPostgresId
    );

    console.log("🔄 Current user firebaseid from store:", currentFirebaseId);

    if (user?.blocked?.includes(currentFirebaseId)) {
      return set({
        chatId,
        user: null,
        isCurrentUserBlocked: true,
        isReceiverBlocked: false,
      });
    } else if (currentUser?.blocked?.includes(user?.id)) {
      return set({
        chatId,
        user: user,
        isCurrentUserBlocked: false,
        isReceiverBlocked: true,
      });
    } else {
      return set({
        chatId,
        user,
        isCurrentUserBlocked: false,
        isReceiverBlocked: false,
      });
    }
  },

  changeBlock: () => {
    set((state) => ({
      ...state,
      isReceiverBlocked: !state.isReceiverBlocked,
    }));
  },

  resetChatStore: () =>
    set({
      chatId: null,
      user: null,
      currentUser: null,
      currentUserId: null,
      isCurrentUserBlocked: null,
      isReceveiverBlocked: null,
    }),

  getFirebaseUserIdFromPostgresId: async (postgresId) => {
    const q = query(
      collection(db, "users"),
      where("postgresId", "==", Number(postgresId))
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id;
    }

    return null;
  },
}));
