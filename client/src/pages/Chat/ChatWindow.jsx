import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchConversationDetails, 
  acceptConversation, 
  rejectConversation, 
  sendMessageRest, 
  clearActiveConversation,
  receiveMessage
} from "../../features/chat/chatSlice";
import { useAuth } from "../../context/AuthContext";
import { Send, ArrowLeft, ShieldCheck, AlertCircle, Package } from "lucide-react";
import { getWebSocketUrl, getImageUrl } from "../../config";

const ChatWindow = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { activeConversation, messages, detailStatus } = useSelector((state) => state.chat);
  
  const [inputText, setInputText] = useState("");
  const [ws, setWs] = useState(null);
  const messagesEndRef = useRef(null);

  // Fetch details on mount
  useEffect(() => {
    dispatch(fetchConversationDetails(conversationId));
    return () => {
      dispatch(clearActiveConversation());
    };
  }, [dispatch, conversationId]);

  // WebSocket Connection
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const socket = new WebSocket(getWebSocketUrl());

    socket.onopen = () => {
      console.log("Chat WS Connected");
    };

    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      if (payload.type === "MESSAGE") {
        // Dispatch to redux so both the active window and the conversation list update
        dispatch(receiveMessage(payload.data));
      } else if (payload.type === "STATUS_CHANGE") {
        // Handled automatically if we refetch or you can dispatch a status update action
        dispatch(fetchConversationDetails(conversationId));
      }
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [conversationId, dispatch]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Send via REST (fallback) or WS
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: "MESSAGE",
        conversation_id: parseInt(conversationId),
        content: inputText
      }));
    } else {
      dispatch(sendMessageRest({ conversationId: parseInt(conversationId), content: inputText }));
    }
    
    setInputText("");
  };

  const handleAccept = () => {
    dispatch(acceptConversation(conversationId));
  };

  const handleReject = () => {
    dispatch(rejectConversation(conversationId));
  };

  if (detailStatus === "loading") {
    return <div className="h-screen flex items-center justify-center text-slate-500">Loading chat...</div>;
  }

  if (!activeConversation) {
    return <div className="h-screen flex items-center justify-center text-slate-500">Conversation not found</div>;
  }

  const isSeller = user && user.id === activeConversation.seller_id;
  const isPending = activeConversation.status === "PENDING";
  const isActive = activeConversation.status === "ACTIVE";

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-4 shadow-sm z-10 shrink-0">
        <button 
          onClick={() => navigate("/chat")}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative shrink-0">
            {activeConversation.product_thumbnail ? (
              <img 
                src={getImageUrl(activeConversation.product_thumbnail)} 
                alt="Product" 
                className="w-12 h-12 rounded-lg object-cover bg-slate-100"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                <Package size={20} className="text-slate-400" />
              </div>
            )}
          </div>
          
          <div className="flex flex-col min-w-0">
            <h2 className="font-bold text-slate-800 text-sm sm:text-base truncate">
              {activeConversation.product_title || "Deleted Product"}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">
                {isSeller ? "Buyer" : "Seller"}: {activeConversation.other_party_name}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-slate-100 text-slate-600">
                {activeConversation.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Trust & Safety Banner */}
      <div className="bg-indigo-50 px-4 py-2 flex items-center justify-center gap-2 text-xs font-semibold text-indigo-700 shrink-0">
        <ShieldCheck size={14} />
        <span>Keep conversations and payments within Zellers for your safety.</span>
      </div>

      {/* Action Banner for Pending States */}
      {isPending && isSeller && (
        <div className="bg-amber-50 border-b border-amber-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2 text-amber-800 text-sm font-semibold">
            <AlertCircle size={18} />
            <span>Buyer wants to chat. Accept to reply.</span>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={handleReject}
              className="flex-1 sm:flex-none px-4 py-2 bg-white border border-amber-200 text-amber-700 font-bold rounded-xl text-sm hover:bg-amber-100 transition-colors"
            >
              Decline
            </button>
            <button 
              onClick={handleAccept}
              className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-sm hover:bg-emerald-700 transition-colors"
            >
              Accept Request
            </button>
          </div>
        </div>
      )}

      {isPending && !isSeller && (
        <div className="bg-slate-100 border-b border-slate-200 p-3 text-center text-xs font-semibold text-slate-500 shrink-0">
          Waiting for seller to accept your chat request.
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.map((msg, idx) => {
          const isMine = msg.sender_id === user?.id;
          const showTime = idx === 0 || new Date(msg.created_at) - new Date(messages[idx-1].created_at) > 300000;
          
          return (
            <div key={msg.id} className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
              {showTime && (
                <span className="text-[10px] text-slate-400 font-semibold mb-2">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              <div 
                className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                  isMine 
                    ? "bg-indigo-600 text-white rounded-tr-sm shadow-sm" 
                    : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 p-4 shrink-0 pb-safe">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={!isActive}
            placeholder={isActive ? "Type a message..." : "You cannot reply right now"}
            className="flex-1 bg-slate-100 border-transparent focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 rounded-2xl px-4 py-3 text-sm transition-all"
          />
          <button
            type="submit"
            disabled={!isActive || !inputText.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white p-3 rounded-2xl transition-colors shrink-0 flex items-center justify-center"
          >
            <Send size={18} className={isActive && inputText.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
