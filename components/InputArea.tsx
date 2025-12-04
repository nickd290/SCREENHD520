import React, { useState, useRef, KeyboardEvent } from 'react';
import { Send, Image as ImageIcon, X } from 'lucide-react';

interface InputAreaProps {
  onSendMessage: (text: string, image: string | null) => void;
  isLoading: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if ((!text.trim() && !image) || isLoading) return;
    onSendMessage(text, image);
    setText('');
    setImage(null);
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
      const target = e.currentTarget;
      target.style.height = 'auto';
      target.style.height = `${Math.min(target.scrollHeight, 150)}px`;
      setText(target.value);
  }

  return (
    <div className="border-t border-slate-200 bg-white p-4">
      <div className="max-w-4xl mx-auto">
        
        {image && (
          <div className="mb-3 relative inline-block">
            <img src={image} alt="Preview" className="h-20 w-auto rounded-lg border border-slate-200 shadow-sm" />
            <button 
              onClick={() => setImage(null)}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700 transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        )}

        <div className="flex gap-2 items-end bg-slate-50 border border-slate-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-red-100 focus-within:border-red-400 transition-all shadow-sm">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Upload image for troubleshooting"
          >
            <ImageIcon size={20} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
          
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Describe the press issue, ask about setup, or enter error code..."
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-[150px] py-2 text-slate-700 placeholder-slate-400 text-sm leading-relaxed"
            rows={1}
          />

          <button
            onClick={handleSend}
            disabled={(!text.trim() && !image) || isLoading}
            className={`
              p-2 rounded-lg transition-all duration-200
              ${(!text.trim() && !image) || isLoading 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-red-600 text-white shadow-md hover:bg-red-700 hover:shadow-lg'}
            `}
          >
            <Send size={18} />
          </button>
        </div>
        <div className="text-center mt-2">
            <p className="text-[10px] text-slate-400">
                AI can make mistakes. Check important info. Consult official Screen USA manuals for high-voltage procedures.
            </p>
        </div>
      </div>
    </div>
  );
};
