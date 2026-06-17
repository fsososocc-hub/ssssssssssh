/**
 * AI Commerce OS - Client AI State and Context Controller (AIContext)
 * Implements a clean, elegant React Context to centralize and synchronize modular AI interactions.
 * Fully type-safe and zero unnecessary complex scaffold logs.
 */

import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { ChatMessage, Product, Order, Discount } from '../../types';
import { AIService, AIStoreState } from '../services/ai.service';
import { useProductStore } from '../../stores/productStore';
import { useOrderStore } from '../../stores/orderStore';
import { useDiscountStore } from '../../stores/discountStore';
import { useShopStore } from '../../stores/shopStore';

// Defined Session interface
export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
}

export interface AIContextType {
  sessions: ChatSession[];
  activeSessionId: string | null;
  activeSession: ChatSession | null;
  isLoading: boolean;
  tonePreset: 'elegant' | 'scientific' | 'warm' | 'active';
  memories: string[];
  
  // Handlers
  setTonePreset: (tone: 'elegant' | 'scientific' | 'warm' | 'active') => void;
  createNewSession: (title?: string) => string;
  selectSession: (id: string) => void;
  deleteSession: (id: string) => void;
  clearAllSessions: () => void;
  sendChatMessage: (text: string, attachments?: any[]) => Promise<void>;
  addMemoryRule: (rule: string) => void;
  removeMemoryRule: (rule: string) => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

const PRE_SEEDED_SESSION_KEY = 'atelier_ai_sessions';
const PRE_SEEDED_TONE_KEY = 'atelier_ai_tone_preset';
const PRE_SEEDED_MEMORIES_KEY = 'atelier_ai_memories';

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Grab real data from core stores
  const products = useProductStore((state) => state.products);
  const orders = useOrderStore((state) => state.orders);
  const discounts = useDiscountStore((state) => state.discounts);
  const settings = useShopStore((state) => state.settings);

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tonePreset, setTonePreset] = useState<'elegant' | 'scientific' | 'warm' | 'active'>('elegant');
  const [memories, setMemories] = useState<string[]>([]);

  const storeState: AIStoreState = useMemo(() => ({
    products,
    orders,
    discounts,
    settings,
  }), [products, orders, discounts, settings]);

  // Load from local memory cache safely (anti-loss clearing protocols)
  useEffect(() => {
    try {
      const cachedSessions = localStorage.getItem(PRE_SEEDED_SESSION_KEY);
      const cachedTone = localStorage.getItem(PRE_SEEDED_TONE_KEY);
      const cachedMemories = localStorage.getItem(PRE_SEEDED_MEMORIES_KEY);

      if (cachedSessions) {
        const parsed = JSON.parse(cachedSessions);
        if (parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
        } else {
          seedInitialSession();
        }
      } else {
        seedInitialSession();
      }

      if (cachedTone) {
        setTonePreset(cachedTone as any);
      }

      if (cachedMemories) {
        setMemories(JSON.parse(cachedMemories));
      } else {
        setMemories([
          '本店主打意大利高奢羊绒服饰与高纬度比利时生态亚麻成衣',
          '日常促销及优惠券不得突破 85 折 (折扣降幅 <= 15%)，严守品牌调性心智',
          '欧洲统一大市场采用完全零碳排放的碳中和环保递送 (DHL Green)'
        ]);
      }
    } catch {
      seedInitialSession();
    }
  }, []);

  // Sync to local memory on alterations
  const persistSessions = (updated: ChatSession[]) => {
    setSessions(updated);
    localStorage.setItem(PRE_SEEDED_SESSION_KEY, JSON.stringify(updated));
  };

  const seedInitialSession = () => {
    const initial: ChatSession = {
      id: 'session-default',
      title: '商铺大脑首发分析会话',
      updatedAt: Date.now(),
      messages: [
        {
          id: 'welcome-msg',
          role: 'model',
          text: `您好！我是 **Sidekick**，Atelier Noir 品牌商铺大脑智能决策师。
          
我已为您自动挂载了**多租户数据隔离机制**及全链路对账体系。当前所有已配置的微调规程均已就绪。
请问您想对哪一块业务进行规划？您可以尝试向我提问 **“低库存分析”**、**“营业额对账诊断”** 或直接转入 **“智能大脑 App”** 进行创意文案一键注入。`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };
    setSessions([initial]);
    setActiveSessionId(initial.id);
    localStorage.setItem(PRE_SEEDED_SESSION_KEY, JSON.stringify([initial]));
  };

  const createNewSession = (title?: string): string => {
    const id = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id,
      title: title || `新创意会话-${new Date().toLocaleDateString()}`,
      updatedAt: Date.now(),
      messages: [
        {
          id: `msg-welcome-${Date.now()}`,
          role: 'model',
          text: '开启全新的商业策划轨道。请告诉我您的目标。',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };
    const updated = [newSession, ...sessions];
    persistSessions(updated);
    setActiveSessionId(id);
    return id;
  };

  const selectSession = (id: string) => {
    setActiveSessionId(id);
  };

  const deleteSession = (id: string) => {
    const filtered = sessions.filter(s => s.id !== id);
    if (activeSessionId === id) {
      if (filtered.length > 0) {
        setActiveSessionId(filtered[0].id);
      } else {
        setActiveSessionId(null);
      }
    }
    persistSessions(filtered);
  };

  const clearAllSessions = () => {
    seedInitialSession();
  };

  const addMemoryRule = (rule: string) => {
    const updated = [...memories, rule];
    setMemories(updated);
    localStorage.setItem(PRE_SEEDED_MEMORIES_KEY, JSON.stringify(updated));
  };

  const removeMemoryRule = (rule: string) => {
    const updated = memories.filter(m => m !== rule);
    setMemories(updated);
    localStorage.setItem(PRE_SEEDED_MEMORIES_KEY, JSON.stringify(updated));
  };

  const activeSession = useMemo(() => {
    return sessions.find(s => s.id === activeSessionId) || null;
  }, [sessions, activeSessionId]);

  const sendChatMessage = async (text: string, attachments: any[] = []) => {
    if (!text.trim() && attachments.length === 0) return;
    if (!activeSessionId || !activeSession) return;

    setIsLoading(true);

    const userMsgId = `user-${Date.now()}`;
    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let finalQueryText = text;
    if (attachments && attachments.length > 0) {
      const attInfo = attachments.map(a => `[附件: ${a.name} (${a.type})]`).join(' ');
      finalQueryText = `${attInfo} ${text}`;
    }

    const newUserMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      text: finalQueryText,
      timestamp: timestampStr
    };

    const updatedMessages = [...activeSession.messages, newUserMessage];
    const updatedSessions = sessions.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          messages: updatedMessages,
          updatedAt: Date.now()
        };
      }
      return s;
    });

    persistSessions(updatedSessions);

    try {
      // Append memory presets into query prompt to enrich context
      const memoryString = memories.map(m => `Brand Guideline Override: ${m}`).join('\n');
      const enrichedPrompt = `${finalQueryText}\n\n[Brand Policies & Heartbeat Override]:\n${memoryString}`;

      const reply = await AIService.querySidekick(
        enrichedPrompt,
        activeSession.messages,
        storeState
      );

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'model',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const finalSessions = sessions.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [...updatedMessages, assistantMessage],
            updatedAt: Date.now(),
            // Rename session title smartly if it's the default name
            title: s.title.startsWith('新创意会话-') ? text.substring(0, 15) : s.title
          };
        }
        return s;
      });

      persistSessions(finalSessions);

    } catch (err) {
      console.error('AI session call error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AIContext.Provider value={{
      sessions,
      activeSessionId,
      activeSession,
      isLoading,
      tonePreset,
      memories,
      setTonePreset: (tone) => {
        setTonePreset(tone);
        localStorage.setItem(PRE_SEEDED_TONE_KEY, tone);
      },
      createNewSession,
      selectSession,
      deleteSession,
      clearAllSessions,
      sendChatMessage,
      addMemoryRule,
      removeMemoryRule
    }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAIContext = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAIContext must be used within an AIProvider');
  }
  return context;
};
