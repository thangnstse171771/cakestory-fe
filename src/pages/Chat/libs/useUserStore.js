// import { doc, getDoc } from "firebase/firestore";
// import { create } from "zustand";

// const useUserStore = create((set) => ({
//   currentUser: null,
//   isLoading: true,
//   fetchUserInfo: async (userId) => {
//     if (!userId) {
//       set({ currentUser: null, isLoading: false });
//       return;
//     }
//     set({ isLoading: true });
//     try {
//       const userDoc = await getDoc(doc(db, "users", userId));
//       if (userDoc.exists()) {
//         set({
//           currentUser: { id: userId, ...userDoc.data() },
//           isLoading: false,
//         });
//       } else {
//         set({ currentUser: null, isLoading: false });
//       }
//     } catch (error) {
//       console.error("Error fetching user info:", error);
//       set({ currentUser: null, isLoading: false });
//     }
//   },
// }));
