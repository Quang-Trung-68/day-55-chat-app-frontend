import { useGetConversationsQuery } from "@/store/api/conversationsApi";
import ConversationItem from "./ConversationItem";

const ConversationList = () => {
  const { data: conversations, isLoading: isConversationsLoading } =
    useGetConversationsQuery();
  console.log(conversations);
  return (
    <div>
      {conversations?.map((conversation) => {
        return (
          <ConversationItem
            key={conversation.id}
            conversationUser={conversation}
          />
        );
      })}
    </div>
  );
};

export default ConversationList;
