'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as React from 'react';
import { useUser } from '@clerk/nextjs';
import { Bot, Loader2, Send } from 'lucide-react';

interface Doc {
  pageContent?: string;
  metadata?: {
    loc?: {
      pageNumber?: number;
    };
    source?: string;
  };
}
interface IMessage {
  role: 'assistant' | 'user';
  content?: string;
  documents?: Doc[];
}

const ChatComponent: React.FC = () => {
  const [message, setMessage] = React.useState<string>('');
  const [messages, setMessages] = React.useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const { user } = useUser();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendChatMessage = async () => {
    if (!message.trim()) return;

    const currentMessage = message;
    setMessage('');
    setMessages((prev) => [...prev, { role: 'user', content: currentMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch(`http://localhost:8000/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: currentMessage }),
      });
      
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data?.message || 'Sorry, I encountered an error.',
          documents: data?.docs,
        },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Failed to fetch response. Please ensure the server is running.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendChatMessage();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white relative">
      <div className="p-4 border-b bg-gray-50/50">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-600" />
          Document AI Assistant
        </h2>
        <p className="text-sm text-gray-500">Ask me anything about your uploaded documents.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4 mt-20">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
              <Bot className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-lg">Start a conversation by typing a message below.</p>
          </div>
        )}
        
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 border border-blue-200 shadow-sm mt-1">
                <Bot className="w-6 h-6 text-blue-600" />
              </div>
            )}
            
            <div className={`flex flex-col max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div 
                className={`p-4 rounded-2xl shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-sm' 
                    : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                {msg.documents && msg.documents.length > 0 && (
                  <div className={`mt-3 pt-3 border-t ${msg.role === 'user' ? 'border-blue-500' : 'border-gray-100'} text-xs ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    <p className="font-semibold mb-1">Sources:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      {msg.documents.map((doc, i) => (
                        <li key={i} className="truncate">
                          {doc.metadata?.source || 'Unknown source'}
                          {doc.metadata?.loc?.pageNumber ? ` (Page ${doc.metadata.loc.pageNumber})` : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex flex-shrink-0 overflow-hidden border border-gray-300 shadow-sm mt-1">
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white font-bold text-sm">
                    {user?.firstName?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-4 justify-start">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 border border-blue-200 shadow-sm mt-1">
              <Bot className="w-6 h-6 text-blue-600" />
            </div>
            <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm text-gray-800 rounded-tl-sm flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-sm text-gray-500 font-medium">Generating response...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            className="flex-1 bg-white shadow-sm border-gray-300 focus-visible:ring-blue-500 h-12 rounded-xl"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendChatMessage} 
            disabled={!message.trim() || isLoading}
            className="w-12 h-12 rounded-xl p-0 flex items-center justify-center flex-shrink-0 bg-blue-600 hover:bg-blue-700 shadow-sm transition-all"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
