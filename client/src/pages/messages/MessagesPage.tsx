import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { Send, Search, Plus, MessageCircle, X, Loader2 } from 'lucide-react';
import { apiSlice } from '../../store/api/apiSlice';
import { formatDistanceToNow } from 'date-fns';
import { useSocket } from '../../hooks/useSocket';

const messageApi = apiSlice.injectEndpoints({
  endpoints: (b) => ({
    getConversations: b.query<any, void>({ query: () => '/messages', providesTags: ['Notifications'] }),
    getConversation: b.query<any, string>({ query: (id) => `/messages/${id}` }),
    sendMessage: b.mutation<any, { id: string; content: string }>({
      query: ({ id, content }) => ({ url: `/messages/${id}/messages`, method: 'POST', body: { content } }),
    }),
    createDirect: b.mutation<any, { recipientId: string; subject?: string }>({
      query: (d) => ({ url: '/messages/direct', method: 'POST', body: d }),
      invalidatesTags: ['Notifications'],
    }),
  }),
});

const { useGetConversationsQuery, useGetConversationQuery, useSendMessageMutation, useCreateDirectMutation } = messageApi;

export default function MessagesPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = useSelector(selectCurrentUser);
  const { socket } = useSocket();

  const { data: convsData, isLoading: convsLoading, refetch: refetchConvs } = useGetConversationsQuery();
  const { data: convData, refetch: refetchConv } = useGetConversationQuery(selectedId!, { skip: !selectedId });
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();

  const conversations = convsData?.data || [];
  const currentConv = convData?.data;

  // Real-time message updates
  useEffect(() => {
    if (!socket) return;
    socket.on('message:new', (data: any) => {
      if (data.conversationId === selectedId) refetchConv();
      refetchConvs();
    });
    return () => { socket.off('message:new'); };
  }, [socket, selectedId, refetchConv, refetchConvs]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConv?.messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedId) return;
    try {
      await sendMessage({ id: selectedId, content: newMessage.trim() }).unwrap();
      setNewMessage('');
      refetchConv();
    } catch {
      // handled globally
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredConvs = conversations.filter((c: any) => {
    const otherParticipants = c.participants?.filter((p: any) => p._id !== user?._id);
    const name = c.name || otherParticipants?.map((p: any) => `${p.firstName} ${p.lastName}`).join(', ');
    return name?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Conversations sidebar */}
      <div className={`flex flex-col w-full sm:w-80 border-r border-white/5 bg-bg-secondary flex-shrink-0 ${selectedId ? 'hidden sm:flex' : 'flex'}`}>
        {/* Header */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-text-primary">Messages</h2>
            <button className="p-1.5 rounded-lg text-text-secondary hover:text-accent hover:bg-accent/10 transition-all">
              <Plus size={16} />
            </button>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations..." className="input pl-8 text-sm py-2" />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {convsLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center px-4">
              <MessageCircle size={32} className="text-text-tertiary opacity-30 mb-2" />
              <p className="text-text-secondary text-sm">No conversations yet</p>
              <p className="text-text-tertiary text-xs mt-1">Start a new message to begin</p>
            </div>
          ) : filteredConvs.map((conv: any) => {
            const otherParticipants = conv.participants?.filter((p: any) => p._id !== user?._id);
            const name = conv.name || otherParticipants?.map((p: any) => `${p.firstName} ${p.lastName}`).join(', ');
            const initials = name?.split(' ').slice(0, 2).map((n: string) => n[0]).join('');
            const isSelected = conv._id === selectedId;

            return (
              <button key={conv._id} onClick={() => setSelectedId(conv._id)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-all text-left border-b border-white/5 ${isSelected ? 'bg-accent/8 border-l-2 border-l-accent' : ''}`}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/40 to-purple-500/40 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{name}</p>
                  <p className="text-xs text-text-tertiary truncate mt-0.5">
                    {conv.lastMessage?.content || 'No messages yet'}
                  </p>
                </div>
                {conv.lastMessage?.sentAt && (
                  <span className="text-[10px] text-text-tertiary flex-shrink-0">
                    {formatDistanceToNow(new Date(conv.lastMessage.sentAt), { addSuffix: false })}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat area */}
      {selectedId ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-bg-secondary flex-shrink-0">
            <button onClick={() => setSelectedId(null)} className="sm:hidden p-1.5 rounded-lg text-text-secondary hover:text-text-primary">
              <X size={16} />
            </button>
            {currentConv && (
              <>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent/40 to-purple-500/40 flex items-center justify-center text-white text-sm font-bold">
                  {currentConv.name?.[0] || currentConv.participants?.find((p: any) => p._id !== user?._id)?.firstName?.[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    {currentConv.name || currentConv.participants?.filter((p: any) => p._id !== user?._id).map((p: any) => `${p.firstName} ${p.lastName}`).join(', ')}
                  </p>
                  {currentConv.subject && <p className="text-xs text-text-tertiary">{currentConv.subject}</p>}
                </div>
              </>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {currentConv?.messages?.length === 0 ? (
              <div className="flex items-center justify-center h-full text-text-tertiary text-sm">
                No messages yet. Say hello! 👋
              </div>
            ) : currentConv?.messages?.map((msg: any) => {
              const isOwn = msg.sender?._id === user?._id || msg.sender === user?._id;
              return (
                <div key={msg._id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                  {!isOwn && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/30 to-accent/30 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1">
                      {msg.sender?.firstName?.[0]}{msg.sender?.lastName?.[0]}
                    </div>
                  )}
                  <div className={`max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    {!isOwn && (
                      <p className="text-xs text-text-tertiary px-1">
                        {msg.sender?.firstName} {msg.sender?.lastName}
                      </p>
                    )}
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isOwn
                        ? 'bg-accent text-white rounded-br-sm'
                        : 'bg-bg-secondary border border-white/8 text-text-primary rounded-bl-sm'
                    }`}>
                      {msg.content}
                    </div>
                    <p className="text-[10px] text-text-tertiary px-1">
                      {msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true }) : ''}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          <div className="p-4 border-t border-white/5 bg-bg-secondary flex-shrink-0">
            <div className="flex items-end gap-3">
              <textarea
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type a message... (Enter to send)"
                rows={1}
                className="flex-1 input resize-none min-h-[44px] max-h-32 overflow-y-auto text-sm py-2.5"
                style={{ height: 'auto' }}
              />
              <button
                onClick={handleSend}
                disabled={!newMessage.trim() || isSending}
                className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center text-white flex-shrink-0 hover:bg-accent-hover transition-all disabled:opacity-40 shadow-glow-sm"
              >
                {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden sm:flex items-center justify-center bg-bg-primary">
          <div className="text-center">
            <MessageCircle size={56} className="mx-auto text-text-tertiary opacity-20 mb-4" />
            <p className="text-text-secondary font-display font-semibold">Select a conversation</p>
            <p className="text-text-tertiary text-sm mt-1">Choose from the left to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}
