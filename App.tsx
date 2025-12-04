
import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatMessage } from './components/ChatMessage';
import { InputArea } from './components/InputArea';
import { ConnectModal } from './components/ConnectModal';
import { Message, Sender, PressProfile, KnowledgeEntry } from './types';
import { initializeChat, sendMessageToGemini } from './services/geminiService';
import { Menu, Info } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [activeProfile, setActiveProfile] = useState<PressProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load profile from last session if available
  useEffect(() => {
    const savedProfile = localStorage.getItem('screen_active_profile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      handleConnect(profile);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Persist messages whenever they change
  useEffect(() => {
    if (activeProfile && messages.length > 0) {
      localStorage.setItem(`screen_history_${activeProfile.serialNumber}`, JSON.stringify(messages));
    }
  }, [messages, activeProfile]);

  const handleConnect = (profile: PressProfile) => {
    setActiveProfile(profile);
    localStorage.setItem('screen_active_profile', JSON.stringify(profile));
    
    // Load history
    const historyKey = `screen_history_${profile.serialNumber}`;
    const savedHistory = localStorage.getItem(historyKey);
    
    let initialMessages: Message[] = [];
    
    if (savedHistory) {
      // Hydrate dates back from strings
      initialMessages = JSON.parse(savedHistory).map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }));
    } else {
      initialMessages = [{
        id: uuidv4(),
        sender: Sender.Bot,
        text: `**System Connected.** \n\nHello. I am ScreenTech AI. I have loaded the service profile for Serial Number **${profile.serialNumber}** (${profile.model}). \n\nI am ready to assist with troubleshooting, maintenance, or job setup.`,
        timestamp: new Date()
      }];
    }
    
    setMessages(initialMessages);
    
    // Initialize Gemini with history AND learned knowledge
    initializeChat(profile, initialMessages);
    
    setShowConnectModal(false);
  };

  const handleDisconnect = () => {
    setActiveProfile(null);
    setMessages([]);
    localStorage.removeItem('screen_active_profile');
    setShowConnectModal(true);
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear the service history for this unit? This cannot be undone.")) {
       const resetMsg = [{
          id: uuidv4(),
          sender: Sender.Bot,
          text: `**History Cleared.** \n\nService log for **${activeProfile?.serialNumber}** has been reset. Ready for new inquiries.`,
          timestamp: new Date()
       }];
       setMessages(resetMsg);
       if(activeProfile) {
         localStorage.removeItem(`screen_history_${activeProfile.serialNumber}`);
         initializeChat(activeProfile, []);
       }
    }
  }

  const handleVerifyFix = (messageId: string) => {
      if(!activeProfile) return;

      setMessages(prev => prev.map(msg => {
          if (msg.id === messageId) {
              return { ...msg, isVerifiedFix: true };
          }
          return msg;
      }));

      // Find the bot message and the preceding user message to create a Knowledge Entry
      const msgIndex = messages.findIndex(m => m.id === messageId);
      if (msgIndex > 0) {
          const solutionMsg = messages[msgIndex];
          // Look backwards for the last user message
          let issueMsg = null;
          for(let i = msgIndex - 1; i >= 0; i--) {
              if (messages[i].sender === Sender.User) {
                  issueMsg = messages[i];
                  break;
              }
          }

          if (issueMsg) {
              const entry: KnowledgeEntry = {
                  id: uuidv4(),
                  serialNumber: activeProfile.serialNumber,
                  issue: issueMsg.text,
                  solution: solutionMsg.text,
                  timestamp: new Date().toISOString()
              };

              // Save to Local Storage Knowledge Base
              const kbKey = `screen_kb_${activeProfile.serialNumber}`;
              const existingKb = JSON.parse(localStorage.getItem(kbKey) || '[]');
              const newKb = [...existingKb, entry];
              localStorage.setItem(kbKey, JSON.stringify(newKb));

              // Note: We don't re-initialize chat immediately, 
              // the new knowledge will be loaded next time the app starts or "Disconnect/Connect" happens.
          }
      }
  };

  const handleSendMessage = async (text: string, image: string | null) => {
    if (!activeProfile) return;

    // 1. Add User Message
    const userMsg: Message = {
      id: uuidv4(),
      sender: Sender.User,
      text: text,
      timestamp: new Date(),
      imageUrl: image || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // 2. Add Placeholder Bot Message (Thinking)
    const botMsgId = uuidv4();
    const botMsgPlaceholder: Message = {
      id: botMsgId,
      sender: Sender.Bot,
      text: "",
      timestamp: new Date(),
      isThinking: true
    };
    setMessages(prev => [...prev, botMsgPlaceholder]);

    try {
      // 3. Stream Response
      const stream = await sendMessageToGemini(text, image);
      
      let fullText = "";
      
      for await (const chunk of stream) {
        // Upon first chunk, remove thinking state
        if (fullText === "") {
             setMessages(prev => prev.map(msg => 
                msg.id === botMsgId ? { ...msg, isThinking: false } : msg
             ));
        }

        const chunkText = chunk.text;
        if (chunkText) {
          fullText += chunkText;
          setMessages(prev => prev.map(msg => 
            msg.id === botMsgId ? { ...msg, text: fullText } : msg
          ));
        }
      }

    } catch (error) {
      console.error("Error generating response:", error);
      setMessages(prev => prev.map(msg => 
        msg.id === botMsgId ? { 
            ...msg, 
            isThinking: false, 
            text: "I encountered a communication error. I cannot reach the ScreenTech Cloud. Please check your network." 
        } : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-100">
      <ConnectModal isOpen={showConnectModal} onConnect={handleConnect} />
      
      <Sidebar 
        activeProfile={activeProfile} 
        onDisconnect={handleDisconnect}
        onClearHistory={handleClearHistory}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-slate-900 text-white p-4 flex items-center justify-between shadow-md z-10">
           <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(true)}>
                <Menu size={24} />
              </button>
              <span className="font-semibold truncate">{activeProfile?.model || 'ScreenTech AI'}</span>
           </div>
        </header>

        {/* Desktop Header Context Bar */}
        <div className="hidden lg:flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 shadow-sm z-10">
           <div className="flex items-center gap-4 text-slate-700">
              <div className="flex flex-col leading-none">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active System</span>
                 <span className="font-bold text-slate-900">{activeProfile?.model || 'Not Connected'}</span>
              </div>
              {activeProfile && (
                 <div className="h-6 w-px bg-slate-200"></div>
              )}
              {activeProfile && (
                  <div className="flex flex-col leading-none">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Serial ID</span>
                     <span className="font-mono text-red-600 font-medium">{activeProfile.serialNumber}</span>
                  </div>
              )}
           </div>
           <div className="flex items-center gap-4 text-xs text-slate-500">
             {activeProfile && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Live Connection
                </div>
             )}
             <button title="About ScreenTech AI" className="hover:text-red-600 transition-colors">
               <Info size={16} />
             </button>
           </div>
        </div>

        {/* Messages Area */}
        <main className="flex-1 overflow-y-auto scroll-smooth bg-slate-100">
          <div className="max-w-4xl mx-auto border-x border-slate-200/50 min-h-full bg-white shadow-xl shadow-slate-200/50">
            {messages.map((msg) => (
              <ChatMessage 
                  key={msg.id} 
                  message={msg} 
                  onVerifyFix={handleVerifyFix}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Input Area */}
        <div className="z-20 relative">
             <InputArea onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}

export default App;
