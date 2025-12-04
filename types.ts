
export enum Sender {
  User = 'user',
  Bot = 'model'
}

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  timestamp: Date;
  imageUrl?: string;
  isThinking?: boolean;
  isVerifiedFix?: boolean; // New: Tracks if this specific advice solved the problem
}

export enum PressModel {
  TP_JET520HD_PLUS = 'Truepress JET 520HD+'
}

export interface PressProfile {
  serialNumber: string;
  model: PressModel;
  nickname?: string;
  installDate?: string;
}

export interface KnowledgeEntry {
  id: string;
  serialNumber: string;
  issue: string;
  solution: string;
  timestamp: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  activeProfile: PressProfile | null;
  input: string;
  attachedImage: string | null;
}
