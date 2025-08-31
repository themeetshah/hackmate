import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader, MessageCircle, Users } from 'lucide-react';
import teamsServices from '../../api/teamsServices';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistance, isToday, isYesterday, format } from 'date-fns';

const TeamChat = ({ teamId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { user } = useAuth();
  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    if (teamId) {
      fetchMessages();
      startPolling();
    }
    return () => stopPolling();
  }, [teamId]);

  // useEffect(() => { scrollToBottom(); }, [messages]);

  const startPolling = () => {
    pollingIntervalRef.current = setInterval(() => fetchMessages(false), 3000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const fetchMessages = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const res = await teamsServices.getTeamMessages(teamId);
    if (res.success) setMessages(res.messages || []);
    if (showLoading) setLoading(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || sendingMessage) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSendingMessage(true);

    // Optimistic update
    const tempMessage = {
      id: Date.now(),
      content: messageText,
      sender: { id: user.id, name: user.name },
      message_type: 'text',
      created_at: new Date().toISOString(),
      isTemp: true
    };
    setMessages(prev => [...prev, tempMessage]);

    const res = await teamsServices.sendMessage(teamId, {
      content: messageText,
      message_type: 'text'
    });

    if (res.success && res.message) {
      // Replace temp message with real one
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      setTimeout(() => fetchMessages(false), 500);
    } else {
      // Remove temp message on error
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
    }
    setSendingMessage(false);
    inputRef.current?.focus();
  };

  const isOwnMessage = msg => msg.sender?.id === user?.id;

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    if (isToday(date)) return format(date, 'HH:mm');
    if (isYesterday(date)) return `Yesterday ${format(date, 'HH:mm')}`;
    return format(date, 'MMM dd, HH:mm');
  };

  const groupMessages = messages => {
    const grouped = [];
    let currentGroup = null;

    messages.forEach((msg, i) => {
      const prevMsg = messages[i - 1];
      const isSameSender = prevMsg && prevMsg.sender?.id === msg.sender?.id;
      const isWithinTimeframe = prevMsg &&
        new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime() < 2 * 60 * 1000; // 2 minutes

      if (isSameSender && isWithinTimeframe) {
        currentGroup.messages.push(msg);
      } else {
        currentGroup = {
          sender: msg.sender,
          messages: [msg],
          isOwn: isOwnMessage(msg),
          timestamp: msg.created_at
        };
        grouped.push(currentGroup);
      }
    });
    return grouped;
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Chat Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 bg-white dark:bg-gray-800 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Team Chat</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Stay connected with your team</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Online</span>
            </div>
            <Users className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <Loader className="w-8 h-8 animate-spin text-blue-600" />
              <div className="absolute inset-0 w-8 h-8 rounded-full border-2 border-blue-200 dark:border-blue-800" />
            </div>
            <span className="text-gray-600 dark:text-gray-400 mt-3 text-sm">Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-10 h-10 text-blue-500 dark:text-blue-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No messages yet</h4>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">
              Start the conversation! Share ideas, ask questions, and collaborate with your team.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence initial={false}>
              {groupMessages(messages).map((group, i) => (
                <motion.div
                  key={`group-${i}-${group.messages[0]?.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${group.isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${group.isOwn ? 'order-2' : 'order-1'}`}>
                    {/* Sender Info */}
                    {!group.isOwn && (
                      <div className="flex items-center gap-2 mb-2 px-1">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                          {group.sender?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          {group.sender?.name || 'Unknown User'}
                        </span>
                      </div>
                    )}

                    {/* Message Bubbles */}
                    <div className="space-y-1">
                      {group.messages.map((msg, j) => (
                        <motion.div
                          key={msg.id}
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: msg.isTemp ? 0.7 : 1 }}
                          className={`relative max-w-full break-words ${group.isOwn
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                            : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-600'
                            } ${j === 0 && !group.isOwn ? 'rounded-t-2xl rounded-br-2xl rounded-bl-md' :
                              j === 0 && group.isOwn ? 'rounded-t-2xl rounded-bl-2xl rounded-br-md' :
                                j === group.messages.length - 1 && !group.isOwn ? 'rounded-b-2xl rounded-tr-2xl rounded-tl-md' :
                                  j === group.messages.length - 1 && group.isOwn ? 'rounded-b-2xl rounded-tl-2xl rounded-tr-md' :
                                    group.isOwn ? 'rounded-l-2xl rounded-tr-md rounded-br-md' :
                                      'rounded-r-2xl rounded-tl-md rounded-bl-md'
                            } px-4 py-3`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {msg.content}
                          </p>
                          {msg.isTemp && (
                            <div className="absolute inset-0 bg-black/10 rounded-2xl flex items-center justify-center">
                              <Loader className="w-4 h-4 animate-spin text-white" />
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>

                    {/* Timestamp */}
                    <div className={`text-xs text-gray-400 mt-2 px-1 ${group.isOwn ? 'text-right' : 'text-left'}`}>
                      {formatMessageTime(group.timestamp)}
                      {group.isOwn && (
                        <span className="ml-2 text-xs opacity-75">
                          Delivered
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {isTyping && (
        <div className="px-6 py-2">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs">Someone is typing...</span>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 rounded-b-xl">
        <form onSubmit={handleSendMessage} className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                // Simulate typing indicator
                setIsTyping(true);
                setTimeout(() => setIsTyping(false), 1000);
              }}
              placeholder="Type your message..."
              rows={1}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
              disabled={sendingMessage}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              style={{
                maxHeight: '120px',
                minHeight: '48px',
                overflow:"hidden", // CHANGED to hidden
                height: Math.min(newMessage.split('\n').length * 24 + 24, 120) + 'px'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={!newMessage.trim() || sendingMessage}
            className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
          >
            {sendingMessage ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>

        {/* <div className="mt-2 px-1">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Press Enter to send, Shift + Enter for new line
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default TeamChat;
