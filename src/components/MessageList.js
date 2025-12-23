import { useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

export default function MessageList({ messages, currentUserId }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isOwnMessage = message.userId === currentUserId;
        
        return (
          <div
            key={message.id}
            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-2 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
              <img
                src={message.userImage}
                alt={message.userName}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <div className={`rounded-lg p-3 ${isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                  <p className="text-sm font-semibold">{message.userName}</p>
                  <p>{message.text}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {message.timestamp && formatDistanceToNow(message.timestamp.toDate(), { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
