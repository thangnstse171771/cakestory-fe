import ChatArea from "./ChatArea";
import ConversationList from "./ConversationList";
import { useChatStore } from "./libs/useChatStore";

const Chat = () => {
  const { chatId } = useChatStore();

  return (
    <div className="flex h-screen md:max-h-[93vh] ml-20">
      {/* Conversations List */}
      <ConversationList />

      {/* Chat Area */}
      {chatId && <ChatArea />}
    </div>
  );
};

export default Chat;
