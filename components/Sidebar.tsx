import React from 'react';
import { PressProfile } from '../types';
import { Settings, AlertCircle, Wrench, Power, Database, History } from 'lucide-react';

interface SidebarProps {
  activeProfile: PressProfile | null;
  onDisconnect: () => void;
  isOpen: boolean;
  onClose: () => void;
  onClearHistory: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeProfile, onDisconnect, isOpen, onClose, onClearHistory }) => {
  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Content */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-72 bg-slate-900 text-white flex flex-col h-full
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center font-bold text-white shadow-lg shadow-red-900/20">S</div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">ScreenTech AI</h1>
            <p className="text-xs text-slate-400">Universal Service Bot</p>
          </div>
        </div>

        {activeProfile ? (
          <div className="flex-1 overflow-y-auto py-6 px-4">
            <div className="mb-8">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Connected System</h2>
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-slate-400">Serial Number</span>
                  <span className="text-xs bg-green-900/50 text-green-400 px-2 py-0.5 rounded-full border border-green-800">Online</span>
                </div>
                <div className="text-xl font-mono font-bold text-white mb-2 tracking-wide">{activeProfile.serialNumber}</div>
                <div className="text-sm text-slate-300 font-medium leading-tight">{activeProfile.model}</div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Tech Rep Tools</h2>
              <div className="space-y-1">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-left group">
                  <Database size={18} className="text-blue-500 group-hover:text-blue-400" />
                  <span>EQUIOS Workflow</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-left group">
                  <Wrench size={18} className="text-yellow-500 group-hover:text-yellow-400" />
                  <span>Maintenance Guide</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-left group">
                  <AlertCircle size={18} className="text-red-500 group-hover:text-red-400" />
                  <span>Error / Defect Analysis</span>
                </button>
              </div>
            </div>

            <div className="mb-8">
               <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Session Data</h2>
               <button 
                  onClick={onClearHistory}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
               >
                 <History size={16} />
                 <span>Clear Local History</span>
               </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500">
            <p className="text-sm">No press connected.</p>
          </div>
        )}

        <div className="p-4 border-t border-slate-800">
          {activeProfile && (
            <button 
              onClick={onDisconnect}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-lg transition-colors text-sm font-medium"
            >
              <Power size={16} />
              <span>Disconnect Press</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};