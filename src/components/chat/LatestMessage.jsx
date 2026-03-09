import { useGetLatestMessageQuery } from "@/store/api/conversationsApi";
import { selectCurrentUser } from "@/store/authSlice";
import truncate from "@/utils/truncate";
import { useSelector } from "react-redux";

/* eslint-disable react/prop-types */
export default function LatestMessage({ conversationId }) {
  const currentUser = useSelector(selectCurrentUser);
  const { data: latestMessage = {} } = useGetLatestMessageQuery(
    conversationId,
    {
      skip: !conversationId,
    },
  );
  return (
    <div className="flex justify-between text-[12px] text-slate-500 truncate mt-[2px] pr-2">
      <div className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
        {currentUser?.id == latestMessage?.user_id ? "Bạn : " : ""}
        {truncate(latestMessage?.content)}
      </div>
    </div>
  );
}
