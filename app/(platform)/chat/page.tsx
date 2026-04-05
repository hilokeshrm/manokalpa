"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import TopBar from "@/components/platform/TopBar";
import { Send, Bot, Phone, Video, Search, SquarePen, X } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { useUser } from "@/components/providers/UserProvider";

interface Conversation {
  partnerId: string;
  partnerName: string;
  partnerAvatar?: string | null;
  partnerRole: string;
  lastMessage: string;
  lastMessageTime: string;
  isLastMessageMine: boolean;
  unread: number;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  sender: { id: string; name: string; avatar?: string | null };
}

function timeAgo(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function ChatPage() {
  const { user } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [newMsgOpen, setNewMsgOpen] = useState(false);
  const [newMsgSearch, setNewMsgSearch] = useState("");
  const [newMsgResults, setNewMsgResults] = useState<{ userId: string; name: string; tagline?: string | null }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeConv = conversations.find((c) => c.partnerId === activeId);

  // Load conversations list
  const loadConversations = useCallback(() => {
    fetch("/api/chat")
      .then((r) => r.json())
      .then((data) => setConversations(data.conversations || []));
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load messages when active conversation changes + poll every 5s
  const loadMessages = useCallback(() => {
    if (!activeId) return;
    fetch(`/api/chat?with=${activeId}`)
      .then((r) => r.json())
      .then((data) => {
        setMessages(data.messages || []);
        // Mark conversation as read locally
        setConversations((prev) =>
          prev.map((c) => (c.partnerId === activeId ? { ...c, unread: 0 } : c))
        );
      });
  }, [activeId]);

  useEffect(() => {
    setMessages([]);
    loadMessages();
    if (pollRef.current) clearInterval(pollRef.current);
    if (activeId) {
      pollRef.current = setInterval(loadMessages, 5000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeId, loadMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !activeId || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);

    // Optimistic update
    const tempMsg: Message = {
      id: "tmp-" + Date.now(),
      content: text,
      createdAt: new Date().toISOString(),
      isRead: false,
      sender: { id: user?.id || "", name: user?.name || "Me", avatar: user?.avatar },
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: activeId, content: text }),
      });
      if (res.ok) {
        loadMessages();
        loadConversations();
      }
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (!newMsgOpen) return;
    const q = newMsgSearch.trim();
    const params = new URLSearchParams();
    if (q) params.set("search", q);
    fetch(`/api/counsellors?${params}`)
      .then((r) => r.json())
      .then((data) => setNewMsgResults(data.counsellors || []));
  }, [newMsgOpen, newMsgSearch]);

  const startNewConversation = (userId: string) => {
    setActiveId(userId);
    setNewMsgOpen(false);
    setNewMsgSearch("");
  };

  const filteredConvs = conversations.filter((c) =>
    c.partnerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <TopBar pageTitle="Messages" />
      <div className="flex h-[calc(100vh-64px)]">

        {/* Sidebar */}
        <div className="w-72 flex-shrink-0 border-r border-slate-100 bg-white flex flex-col hidden sm:flex relative overflow-hidden">
          <div className="p-4 border-b border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Messages</span>
              <button
                onClick={() => setNewMsgOpen(true)}
                className="w-8 h-8 rounded-xl bg-brand-purple-pale text-brand-purple flex items-center justify-center hover:bg-brand-purple hover:text-white transition-colors"
                title="New Message"
              >
                <SquarePen size={14} />
              </button>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
              <Search size={14} className="text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="text-sm text-slate-700 outline-none flex-1 bg-transparent placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* New message modal */}
          {newMsgOpen && (
            <div className="absolute inset-0 z-20 bg-white flex flex-col">
              <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                <button onClick={() => setNewMsgOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
                <span className="font-semibold text-slate-900 text-sm">New Message</span>
              </div>
              <div className="p-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
                  <Search size={14} className="text-slate-400" />
                  <input
                    autoFocus
                    value={newMsgSearch}
                    onChange={(e) => setNewMsgSearch(e.target.value)}
                    placeholder="Search counsellors..."
                    className="text-sm text-slate-700 outline-none flex-1 bg-transparent placeholder:text-slate-400"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
                {newMsgResults.map((c) => (
                  <button
                    key={c.userId}
                    onClick={() => startNewConversation(c.userId)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-teal to-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {getInitials(c.name)}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 text-sm">{c.name}</div>
                      {c.tagline && <div className="text-slate-400 text-xs truncate">{c.tagline}</div>}
                    </div>
                  </button>
                ))}
                {newMsgResults.length === 0 && (
                  <p className="text-center text-slate-400 text-sm py-6">No counsellors found.</p>
                )}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-2">
            {filteredConvs.length === 0 && (
              <div className="p-6 text-center text-slate-400 text-sm">
                {conversations.length === 0 ? "No conversations yet." : "No results."}
              </div>
            )}
            {filteredConvs.map((conv) => (
              <button
                key={conv.partnerId}
                onClick={() => setActiveId(conv.partnerId)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-left ${
                  activeId === conv.partnerId ? "bg-brand-purple-pale" : "hover:bg-slate-50"
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-purple to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                    {conv.partnerRole === "COUNSELLOR"
                      ? getInitials(conv.partnerName)
                      : conv.partnerRole === "ADMIN"
                      ? <Bot size={16} />
                      : getInitials(conv.partnerName)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900 text-sm truncate">{conv.partnerName}</span>
                    <span className="text-slate-400 text-xs flex-shrink-0">{timeAgo(conv.lastMessageTime)}</span>
                  </div>
                  <p className="text-slate-500 text-xs truncate">
                    {conv.isLastMessageMine ? "You: " : ""}{conv.lastMessage}
                  </p>
                </div>
                {conv.unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-brand-purple text-white text-xs flex items-center justify-center flex-shrink-0">
                    {conv.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        {!activeId ? (
          <div className="flex-1 flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-purple-pale flex items-center justify-center mx-auto mb-4">
                <Send size={24} className="text-brand-purple" />
              </div>
              <p className="font-medium text-slate-700">Select a conversation</p>
              <p className="text-slate-400 text-sm mt-1">Choose someone from the list to start chatting.</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col bg-[#F8F7FF]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-purple to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                  {getInitials(activeConv?.partnerName || "")}
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{activeConv?.partnerName}</div>
                  <div className="text-xs text-slate-400 capitalize">{activeConv?.partnerRole?.toLowerCase()}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
                  <Phone size={16} />
                </button>
                <button className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
                  <Video size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-slate-400 text-sm pt-8">
                  No messages yet. Say hello!
                </div>
              )}
              {messages.map((msg) => {
                const isMe = msg.sender.id === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    {!isMe && (
                      <div className="w-8 h-8 rounded-full bg-brand-purple flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 self-end">
                        {getInitials(msg.sender.name)}
                      </div>
                    )}
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? "bg-brand-purple text-white rounded-br-none"
                          : "bg-white border border-slate-100 text-slate-700 rounded-bl-none shadow-sm"
                      }`}
                    >
                      {msg.content}
                      <div className={`text-xs mt-1 ${isMe ? "text-white/60" : "text-slate-400"}`}>
                        {timeAgo(msg.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="flex gap-3 items-end">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="input-field flex-1 !py-2.5"
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className="w-11 h-11 rounded-xl bg-brand-purple text-white flex items-center justify-center hover:bg-brand-purple-light transition-colors flex-shrink-0 disabled:opacity-40"
                >
                  <Send size={17} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
