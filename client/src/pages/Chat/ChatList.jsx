import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchConversations } from "../../features/chat/chatSlice";
import { Link } from "react-router-dom";
import { MessageSquare, Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getImageUrl } from "../../config";

const ChatList = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { conversations, status } = useSelector((state) => state.chat);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  if (status === "loading") {
    return <div className="p-8 text-center text-slate-500">Loading conversations...</div>;
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <h2 className="text-2xl font-black text-slate-800 mb-6">Messages</h2>
        <div className="bg-white rounded-3xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <MessageSquare size={48} className="text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 mb-2">No messages yet</h3>
          <p className="text-slate-500">When you chat with buyers or sellers, they'll appear here.</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg"><Clock size={12} /> Pending</span>;
      case "ACTIVE":
        return <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg"><CheckCircle size={12} /> Active</span>;
      case "REJECTED":
        return <span className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg"><XCircle size={12} /> Rejected</span>;
      default:
        return <span className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded-lg">{status}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 min-h-screen">
      <h2 className="text-2xl font-black text-slate-800 mb-6">Messages</h2>
      
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-100">
          {conversations.map((conv) => {
            const isSeller = user && user.id === conv.seller_id;
            const unreadCount = isSeller ? conv.seller_unread_count : conv.buyer_unread_count;

            return (
              <Link 
                key={conv.id} 
                to={`/chat/${conv.id}`}
                className="block p-4 sm:p-6 hover:bg-slate-50 transition-colors duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    {conv.product_thumbnail ? (
                      <img 
                        src={getImageUrl(conv.product_thumbnail)} 
                        alt="Product" 
                        className="w-16 h-16 rounded-xl object-cover bg-slate-100"
                        onError={(e) => { e.target.src = "https://placehold.co/100x100?text=No+Image"; }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center">
                        <Package size={24} className="text-slate-400" />
                      </div>
                    )}
                    {unreadCount > 0 && (
                      <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                        {unreadCount}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                      <h3 className="font-bold text-slate-800 truncate text-base">
                        {conv.product_title || "Deleted Product"}
                      </h3>
                      <div className="flex items-center gap-2 shrink-0">
                        {getStatusBadge(conv.status)}
                        {conv.last_message_time && (
                          <span className="text-xs text-slate-400 font-medium">
                            {new Date(conv.last_message_time).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {isSeller ? "Buyer" : "Seller"}: {conv.other_party_name}
                      </span>
                      {conv.product_price && (
                        <span className="text-xs font-bold text-emerald-700">
                          ₹{conv.product_price.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>

                    <p className={`text-sm truncate ${unreadCount > 0 ? "text-slate-800 font-semibold" : "text-slate-500"}`}>
                      {conv.last_message || "No messages yet"}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChatList;
