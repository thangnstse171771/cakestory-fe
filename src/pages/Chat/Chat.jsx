import ChatArea from "./ChatArea";
import ConversationList from "./ConversationList";

const Chat = () => {
  return (
    <div className="flex h-screen md:max-h-[93vh]">
      {/* Conversations List */}
      <ConversationList />

      {/* Chat Area */}
      <ChatArea />
    </div>
  );
};

export default Chat;
