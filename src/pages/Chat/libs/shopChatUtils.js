import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../../../firebase";

/**
 * Creates or finds a shop group chat.
 * Includes shop metadata for UI display.
 */
// filepath: d:\CakeStory\cakestory-fe\src\pages\Chat\libs\shopChatUtils.js

async function createGroupChat(chatId, memberIds, customerId) {
  console.log("🔍 createGroupChat called with:");
  console.log("➤ chatId:", chatId);
  console.log("➤ memberIds:", memberIds);
  console.log("➤ customerId:", customerId);

  for (const memberId of memberIds) {
    try {
      console.log(`⏳ Processing member: ${memberId}`);

      const userChatsRef = doc(db, "userchats", memberId);
      const userChatsSnap = await getDoc(userChatsRef);

      const role = memberId === customerId ? "customer" : "shopMember";
      console.log(`📌 Role for ${memberId}:`, role);

      const newChatEntry = {
        chatId,
        createdAt: Date.now(),
        isSeen: false,
        lastMessage: "",
        role,
      };

      if (userChatsSnap.exists()) {
        console.log(`✏️ Updating existing userchats doc for ${memberId}`);
        await updateDoc(userChatsRef, {
          chats: arrayUnion(newChatEntry),
        });
      } else {
        console.log(`🆕 Creating new userchats doc for ${memberId}`);
        await setDoc(userChatsRef, {
          chats: [newChatEntry],
        });
      }

      console.log(`✅ Done processing ${memberId}`);
    } catch (err) {
      console.error(`❌ Error updating userchats for ${memberId}:`, err);
    }
  }

  console.log("✅ Finished createGroupChat");
}

export async function getOrCreateShopChat(
  shopId,
  memberIds,
  shopName,
  shopAvatar,
  customerFirebaseId,
  shopMemberFirebaseIds
) {
  const q = query(
    collection(db, "groupChats"),
    where("shopId", "==", shopId),
    where("type", "==", "shop")
  );
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    return snapshot.docs[0].id;
  }

  // Step 2: Create new group chat
  const docRef = await addDoc(collection(db, "groupChats"), {
    type: "shop",
    shopId,
    shopName,
    shopAvatar,
    members: memberIds,
    customerId: customerFirebaseId,
    shopMemberIds: shopMemberFirebaseIds,
    createdAt: Date.now(),
    updatedAt: Date.now(), // ADD THIS
    lastMessage: "",
  });

  // 🔥 Add group chat to each user's "userchats"
  await createGroupChat(docRef.id, memberIds, customerFirebaseId);

  return docRef.id;
}

export async function getShopChatsForUser(currentUserFirebaseId) {
  const q = query(
    collection(db, "groupChats"),
    where("members", "array-contains", currentUserFirebaseId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      chatId: doc.id,
      lastMessage: data.lastMessage,
      isShop: true,
      isSeen: true, // or your logic
      user: {
        username: data.shopName || "Shop",
        avatar:
          data.shopAvatar ||
          "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
      },
      // ...add other fields as needed
    };
  });
}
