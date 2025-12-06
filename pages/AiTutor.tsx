import React, { useState, useRef, useEffect } from 'react';
import { MessageRole, ChatMessage } from '../types';
import { streamGeminiResponse } from '../services/geminiService';

const AiTutor: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: MessageRole.MODEL, text: "Hello student! I am Raj, your English tutor. Ask me about Class 11 or 12 English chapters, grammar, or summaries." }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: MessageRole.USER, text: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Create a placeholder for the model response
      setMessages(prev => [...prev, { role: MessageRole.MODEL, text: '' }]);
      
      let fullResponse = '';
      await streamGeminiResponse(
        [...messages, userMessage],
        userMessage.text,
        (chunk) => {
          fullResponse += chunk;
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.role === MessageRole.MODEL) {
              lastMessage.text = fullResponse;
            }
            return newMessages;
          });
        }
      );
    } catch (error) {
      // Error is handled in service by logging and returning friendly message text in stream
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-background-dark">
      
      {/* Chat Header Area - distinct from Main App Header */}
      <div className="flex-none bg-white dark:bg-slate-800 shadow-sm z-10 p-4 border-b border-gray-100 dark:border-slate-700">
        <div className="max-w-4xl mx-auto w-full flex items-center space-x-3">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shadow-inner">
             <span className="material-icons text-amber-500">smart_toy</span>
          </div>
          <div>
            <h2 className="font-bold text-gray-800 dark:text-white">AI Tutor Raj</h2>
            <p className="text-xs text-green-500 font-medium flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
              Online
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-6">
        <div className="max-w-4xl mx-auto w-full space-y-4">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex ${msg.role === MessageRole.USER ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] md:max-w-[70%] p-3 md:p-4 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm ${
                  msg.role === MessageRole.USER 
                    ? 'bg-primary text-white rounded-br-none' 
                    : 'bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-slate-600'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.text === '' && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-700 p-3 md:p-4 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 dark:border-slate-600 flex items-center space-x-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms'}}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms'}}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms'}}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-none p-4 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto w-full relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask about a chapter, summary, or grammar..."
            disabled={isLoading}
            className="w-full bg-gray-100 dark:bg-gray-900 border-0 rounded-full py-4 pl-6 pr-14 text-sm md:text-base focus:ring-2 focus:ring-primary dark:text-white placeholder-gray-500 shadow-inner"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`absolute right-2 p-2 rounded-full transition-all duration-200 ${
              !input.trim() || isLoading 
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500' 
                : 'bg-primary text-white hover:bg-blue-600 hover:scale-105 shadow-md'
            }`}
          >
            <span className="material-icons flex items-center justify-center" style={{ fontSize: '24px' }}>send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiTutor;