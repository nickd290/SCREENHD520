
import React, { useState } from 'react';
import { PressModel, PressProfile } from '../types';
import { DETECT_MODEL_BY_SERIAL, LEARNING_UNIT_SERIAL } from '../constants';
import { Server, ArrowRight, BookOpen } from 'lucide-react';

interface ConnectModalProps {
  onConnect: (profile: PressProfile) => void;
  isOpen: boolean;
}

export const ConnectModal: React.FC<ConnectModalProps> = ({ onConnect, isOpen }) => {
  const [serial, setSerial] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (serial.trim().length > 0) {
      // Force detection for the test build
      const detectedModel = DETECT_MODEL_BY_SERIAL(serial);
      
      onConnect({
        serialNumber: serial.toUpperCase(),
        model: detectedModel || PressModel.TP_JET520HD_PLUS, // Fallback safe
        installDate: new Date().toLocaleDateString()
      });
    }
  };

  const loadLearningUnit = () => {
      setSerial(LEARNING_UNIT_SERIAL);
  }

  return (
    <div className="fixed inset-0 bg-slate-900/95 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-700">
        <div className="bg-slate-950 p-8 text-center border-b border-slate-800 relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600"></div>
          
          <div className="w-16 h-16 bg-red-700 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-red-900/50">
            <Server size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">ScreenTech AI</h1>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-900/30 rounded-full border border-red-900/50">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-red-200 text-xs font-mono tracking-wider">HD+ TEST BUILD</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 pb-4">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Press Serial Number
              </label>
              <input
                type="text"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                placeholder="e.g. J30452"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition-all font-mono uppercase tracking-wider text-lg"
                autoFocus
                required
              />
              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                 Usually located on the main breaker panel (Starts with 'J').
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-600">
                <div className="font-semibold text-slate-900 mb-1">Target System:</div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                    <span>Truepress JET 520HD+ (SC Inks)</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                    <span>1200 dpi / NIR Dryer Config</span>
                </div>
            </div>

            <button
              type="submit"
              disabled={!serial.trim()}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <span>Initialize Diagnostics</span>
              <ArrowRight size={20} />
            </button>
          </div>
        </form>
        
        <div className="px-8 pb-8">
            <button 
                type="button"
                onClick={loadLearningUnit}
                className="w-full py-2 flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-dashed border-slate-300 hover:border-red-200"
            >
                <BookOpen size={14} />
                <span>Load Learning Unit ({LEARNING_UNIT_SERIAL})</span>
            </button>
        </div>

        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">Screen USA Service Engineering</p>
        </div>
      </div>
    </div>
  );
};
