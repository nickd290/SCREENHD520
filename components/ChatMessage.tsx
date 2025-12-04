
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, Sender } from '../types';
import { Bot, User, Cpu, CheckCircle, ThumbsUp } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  onVerifyFix?: (messageId: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onVerifyFix }) => {
  const isBot = message.sender === Sender.Bot;

  return (
    <div className={`flex gap-4 p-6 ${isBot ? 'bg-white' : 'bg-slate-50'}`}>
      <div className={`
        w-10 h-10 min-w-[2.5rem] rounded-full flex items-center justify-center shrink-0 shadow-sm
        ${isBot ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-600'}
      `}>
        {isBot ? <Bot size={20} /> : <User size={20} />}
      </div>
      
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-sm text-slate-900">
            {isBot ? 'ScreenTech AI' : 'Operator'}
          </span>
          <span className="text-xs text-slate-400">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {message.isVerifiedFix && (
             <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider border border-green-200">
               <CheckCircle size={10} />
               Verified Fix
             </span>
          )}
        </div>

        {message.imageUrl && (
          <div className="mb-4 mt-1">
            <img 
              src={message.imageUrl} 
              alt="Uploaded context" 
              className="max-h-64 rounded-xl border-2 border-slate-200 shadow-md" 
            />
          </div>
        )}

        {message.isThinking ? (
           <div className="flex items-center gap-2 text-slate-500 animate-pulse py-2">
             <Cpu size={16} />
             <span className="text-sm font-mono">Analyzing diagnostic steps...</span>
           </div>
        ) : (
          <div className="prose prose-slate prose-sm max-w-none text-slate-700 leading-relaxed">
            <ReactMarkdown
               components={{
                 ul: ({node, ...props}) => <ul className="space-y-3 my-3" {...props} />,
                 ol: ({node, ...props}) => <ol className="space-y-3 my-3 list-decimal list-outside ml-4" {...props} />,
                 li: ({node, ...props}) => (
                    <li className="pl-2 marker:text-red-600 marker:font-bold" {...props} />
                 ),
                 strong: ({node, ...props}) => <strong className="font-black text-slate-900 bg-slate-100 px-1 rounded mx-0.5 border border-slate-200" {...props} />,
                 p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                 h3: ({node, ...props}) => <h3 className="text-lg font-bold text-red-700 mt-4 mb-2 uppercase tracking-wide" {...props} />,
                 code: ({node, ...props}) => <code className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded text-xs font-mono border border-red-100 font-bold" {...props} />,
               }}
            >
              {message.text}
            </ReactMarkdown>

            {/* Verification Button: Only show on Bot messages that aren't verified yet and aren't greetings */}
            {isBot && !message.isVerifiedFix && onVerifyFix && message.text.length > 50 && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                    <button 
                       onClick={() => onVerifyFix(message.id)}
                       className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                       <ThumbsUp size={14} />
                       <span>This fixed the issue</span>
                    </button>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
