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
  arrayRemove,
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
    where("type", "==", "shop"),
    where("customerId", "==", customerFirebaseId)
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
    updatedAt: Date.now(),
    lastMessage: "",
  });

  // ✅ CREATE chats/{chatId} document
  await setDoc(doc(db, "chats", docRef.id), {
    createdAt: Date.now(),
    messages: [], // optional; just for structure
  });

  console.log("✅ chats/{chatId} initialized");

  // 🔥 Add group chat to each user's "userchats"
  await createGroupChat(docRef.id, memberIds, customerFirebaseId);

  // Return the new chat ID
  return docRef.id;
}

// Helper function to check if user ID exists in array (handles trailing whitespace/newlines)
const isUserInArray = (array, userId) => {
  if (!array || !Array.isArray(array)) return false;
  return array.some((id) => id?.trim() === userId?.trim());
};

export const removeUserFromGroupChatByShopId = async ({
  firebaseUid,
  shopId,
}) => {
  // 1. Find the correct group chat using shopId
  const groupChatsRef = collection(db, "groupChats");
  const q = query(groupChatsRef, where("shopId", "==", shopId));

  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    console.warn(`No group chat found for shopId=${shopId}`);
    return;
  }

  // for (const doc of snapshot.docs) {
  //   const data = doc.data();
  //   console.log("Group Chat Doc:", {
  //     id: doc.id,
  //     members: data.members,
  //     shopMemberIds: data.shopMemberIds,
  //     customerId: data.customerId,
  //     shopId: data.shopId,
  //   });
  // }

  // Filter to find chats where user is a member (either in members, shopMemberIds, or customerId)
  const userChats = snapshot.docs.filter((doc) => {
    const data = doc.data();

    const isMember = isUserInArray(data.members, firebaseUid);
    const isShopMember = isUserInArray(data.shopMemberIds, firebaseUid);
    const isCustomer = data.customerId?.trim() === firebaseUid?.trim();

    // console.log(`Checking chat ${doc.id} for user ${firebaseUid}:`, {
    //   isMember,
    //   isShopMember,
    //   isCustomer,
    //   members: data.members,
    //   shopMemberIds: data.shopMemberIds,
    //   customerId: data.customerId,
    // });

    return isMember || isShopMember || isCustomer;
  });

  // console.log(
  //   `Found ${userChats.length} chats for user ${firebaseUid} in shop ${shopId}`
  // );

  if (userChats.length === 0) {
    console.warn(
      `No group chat found for shopId=${shopId} and user=${firebaseUid}`
    );
    return;
  }

  for (const groupChatDoc of userChats) {
    const data = groupChatDoc.data();
    const chatId = groupChatDoc.id;

    // 🚨 Skip removal if this user is the customer
    if (data.customerId?.trim() === firebaseUid?.trim()) {
      console.log(
        `Skipping removal: ${firebaseUid} is the customer in chat ${chatId}`
      );
      continue;
    }

    // --- remove from members / shopMemberIds as staff ---
    const membersToRemove =
      data.members?.filter((id) => id?.trim() === firebaseUid?.trim()) || [];
    const shopMembersToRemove =
      data.shopMemberIds?.filter((id) => id?.trim() === firebaseUid?.trim()) ||
      [];

    for (const memberId of membersToRemove) {
      await updateDoc(groupChatDoc.ref, {
        members: arrayRemove(memberId),
      });
    }

    for (const shopMemberId of shopMembersToRemove) {
      await updateDoc(groupChatDoc.ref, {
        shopMemberIds: arrayRemove(shopMemberId),
      });
    }

    // --- remove from userchats ---
    const userChatsRef = doc(db, "userchats", firebaseUid);
    const userChatsSnap = await getDoc(userChatsRef);

    if (userChatsSnap.exists()) {
      const userData = userChatsSnap.data();
      const chats = userData.chats || [];

      const updatedChats = chats.filter((chat) => chat.chatId !== chatId);

      if (updatedChats.length !== chats.length) {
        console.log(
          `Removing chat ${chatId} from userchats for user ${firebaseUid}`
        );
        await updateDoc(userChatsRef, {
          chats: updatedChats,
        });
      }
    }
  }
};

export const addUserToGroupChatsByShopId = async ({ firebaseUid, shopId }) => {
  try {
    const groupChatsRef = collection(db, "groupChats");
    const q = query(groupChatsRef, where("shopId", "==", shopId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.warn(`No group chats found for shopId=${shopId}`);
      return;
    }

    for (const groupChatDoc of snapshot.docs) {
      const data = groupChatDoc.data();
      const chatId = groupChatDoc.id;

      // Skip if this firebaseUid is already in members as the customer
      if (data.customerId?.trim() === firebaseUid?.trim()) {
        console.log(
          `Skipping chat ${chatId} because ${firebaseUid} is the customer`
        );
        continue;
      }

      // Add user to groupChats.{members, shopMemberIds} if not already included
      await updateDoc(groupChatDoc.ref, {
        members: arrayUnion(firebaseUid),
        shopMemberIds: arrayUnion(firebaseUid),
      });

      // Add to userchats
      const userChatDocRef = doc(db, "userchats", firebaseUid);
      const userChatSnap = await getDoc(userChatDocRef);
      const chatEntry = {
        chatId: chatId,
        role: "shopMember",
        createdAt: Date.now(),
        isSeen: false,
        lastMessage: "",
      };

      if (userChatSnap.exists()) {
        const userData = userChatSnap.data();
        const existingChats = userData.chats || [];
        const isAlreadyInChat = existingChats.some(
          (chat) => chat.chatId === chatId
        );

        if (!isAlreadyInChat) {
          const updatedChats = [...existingChats, chatEntry];
          await updateDoc(userChatDocRef, {
            chats: updatedChats,
          });
        }
      } else {
        // Create new userchats document if it doesn't exist
        await setDoc(userChatDocRef, {
          chats: [chatEntry],
        });
      }
    }

    console.log(
      `User ${firebaseUid} added to all group chats for shopId=${shopId}`
    );
  } catch (error) {
    console.error("Error adding user to group chats:", error);
  }
};

export async function getShopChatsForUser(currentUserFirebaseId) {
  const q = query(collection(db, "groupChats"), where("type", "==", "shop"));
  const snapshot = await getDocs(q);

  // Filter to find chats where user is a member (either in members, shopMemberIds, or customerId)
  const userChats = snapshot.docs.filter((doc) => {
    const data = doc.data();

    return (
      isUserInArray(data.members, currentUserFirebaseId) ||
      isUserInArray(data.shopMemberIds, currentUserFirebaseId) ||
      data.customerId?.trim() === currentUserFirebaseId?.trim()
    );
  });

  return userChats.map((doc) => {
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
