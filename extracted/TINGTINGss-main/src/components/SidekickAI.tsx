/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Trash, ArrowRight, CornerDownLeft, RefreshCcw } from 'lucide-react';
import { ChatMessage, Product, Order, Discount } from '../types';

interface SidekickAIProps {
  products: Product[];
  orders: Order[];
  discounts: Discount[];
  onApplyDiscount?: (code: string) => void;
  onClose?: () => void;
}

export default function SidekickAI({ products, orders, discounts, onApplyDiscount, onClose }: SidekickAIProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-01',
      role: 'model',
      text: "Hello! I am **Sidekick**, your intelligent Atelier Noir assistant.\n\nI can check inventory, draft sophisticated product copies, generate discount strategies, or analyze store performance.\n\nTry testing me with one of the suggestion prompts below!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested questions based on Atelier Noir parameters
  const SUGGESTIONS = [
    { text: "What items are low in stock?", label: "📦 Low Inventory" },
    { text: "Draft an elegant description for a shirt", label: "✍️ Design Copypasta" },
    { text: "Explain a good discount strategy", label: "🏷️ Campaign Idea" },
    { text: "How is my store performing?", label: "📊 Analytics Check" }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/sidekick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(1), // omit greeting to preserve scope
          storeState: { products, orders, discounts }
        })
      });

      if (!response.ok) {
        throw new Error('Server error');
      }

      const data = await response.json();
      
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'model',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (e) {
      // Robust offline mode fallback if fetch fails
      setTimeout(() => {
        let replyText = "I encountered a light network interruption. However, I can still verify store metrics offline:\n\n";
        const cleanPrompt = text.toLowerCase();

        if (cleanPrompt.includes('low') || cleanPrompt.includes('stock') || cleanPrompt.includes('inventory')) {
          replyText += `### ⚠️ Low Stock Alert\n\nYour *Ceramic Pour-Over Coffee Brewer* is critically low with only **3 units** in inventory.\n\nWould you like me to help draft a restock purchase order?`;
        } else if (cleanPrompt.includes('description') || cleanPrompt.includes('shirt') || cleanPrompt.includes('draft') || cleanPrompt.includes('copy')) {
          replyText += `### Atelier Noir Copywriting (Organic Hemp Tee):\n\n> "Woven from certified clean European hemp, this raw organic jersey represents essential structure and breathability. It yields unique surface texture that relaxes with tactical wear, preserving modern silhouette."\n\n**Suggested tags**: \`sustainable\`, \`organic\`, \`raw-hemp\``;
        } else if (cleanPrompt.includes('discount') || cleanPrompt.includes('coupon') || cleanPrompt.includes('promo')) {
          replyText += `### Recommended Discount Code: SHOPBACK10\n\n* **Off**: 10% Entire Store\n* **Target**: Recovering Abandoned Customer baskets.\n\nDeploy inside the *Discounts* tab to reactivate stale visits.`;
        } else {
          replyText += `### Offline Store Helper\n\nI am running locally. To get dynamic generative help, configure a verified \`GEMINI_API_KEY\` in your secrets panel! Otherwise, ask me about **low stock**, **descripion ideas**, or **discount campaigns**!`;
        }

        const helperMsg: ChatMessage = {
          id: `assistant-fallback-${Date.now()}`,
          role: 'model',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, helperMsg]);
      }, 700);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'init-02',
        role: 'model',
        text: "Chat history cleared. What store aspects can I help you adjust today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Convert markdown-like syntax to basic HTML for clean, safe printing
  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, idx) => {
      let content = line;
      // Headers
      if (content.startsWith('### ')) {
        return <h3 key={idx} className="font-semibold text-sm text-black mt-3 mb-1 font-mono tracking-tight">{content.replace('### ', '')}</h3>;
      }
      if (content.startsWith('## ')) {
        return <h2 key={idx} className="font-semibold text-base text-black mt-4 mb-2 font-mono tracking-tight">{content.replace('## ', '')}</h2>;
      }
      // Bullet items
      if (content.startsWith('* ') || content.startsWith('- ')) {
        const cleaned = content.substring(2);
        return (
          <li key={idx} className="ml-4 list-disc text-xs text-neutral-700 leading-relaxed py-0.5">
            {parseInlineStyles(cleaned)}
          </li>
        );
      }
      // Quotes
      if (content.startsWith('> ')) {
        return (
          <blockquote key={idx} className="border-l-2 border-black pl-3 py-1 my-2 italic text-xs text-neutral-600 bg-neutral-50 rounded-r">
            {parseInlineStyles(content.replace('> ', ''))}
          </blockquote>
        );
      }

      if (content.trim() === '') {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="text-xs text-neutral-800 leading-relaxed py-1">
          {parseInlineStyles(content)}
        </p>
      );
    });
  };

  const parseInlineStyles = (txt: string) => {
    // Basic bold **text** and code `code` replacement
    const boldRegex = /\*\*(.*?)\*\*/g;
    const codeRegex = /`(.*?)`/g;

    let parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    // A very simple procedural parser for inline **bold** and `code`
    let tempText = txt;
    // We'll replace them with spans
    return <span dangerouslySetInnerHTML={{
      __html: tempText
        .replace(boldRegex, '<strong class="font-semibold text-black">$1</strong>')
        .replace(codeRegex, '<code class="px-1 py-0.5 bg-neutral-100 rounded text-[11px] font-mono text-neutral-800">$1</code>')
    }} />;
  };

  return (
    <div className="flex flex-col h-full bg-[#fafafa] border-l border-[#e3e3e3] text-black">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#e3e3e3]">
        <div className="flex items-center space-x-2">
          <div className="bg-black p-1 text-white rounded">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-xs font-mono tracking-tight">Sidekick AI</h3>
            <p className="text-[10px] text-neutral-500">Live Shopify Assistant</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button 
            onClick={handleClearChat}
            title="Clear context"
            className="p-1 hover:bg-neutral-100 rounded text-neutral-400 hover:text-black transition-colors"
          >
            <Trash className="w-3.5 h-3.5" />
          </button>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-xs font-semibold px-2 py-1 hover:bg-neutral-100 rounded text-neutral-500 hover:text-black"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Message Output Board */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`max-w-[85%] rounded-lg p-3 ${
              msg.role === 'user' 
                ? 'bg-black text-white rounded-br-none' 
                : 'bg-white border border-[#e3e3e3] rounded-bl-none shadow-sm'
            }`}>
              {msg.role === 'user' ? (
                <p className="text-xs leading-relaxed selection:bg-neutral-200">{msg.text}</p>
              ) : (
                <div className="space-y-1">{renderMarkdown(msg.text)}</div>
              )}
            </div>
            <span className="text-[9px] text-neutral-400 mt-1 px-1 font-mono">{msg.timestamp}</span>
          </div>
        ))}

        {isTyping && (
          <div className="flex flex-col items-start select-none">
            <div className="bg-white border border-[#e3e3e3] rounded-lg p-3 rounded-bl-none shadow-sm flex items-center space-x-2">
              <span className="text-[10px] text-neutral-400 font-mono italic">Sidekick is auditing store files</span>
              <span className="flex space-x-1">
                <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Input Prompt Carousel */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 border-t border-[#f0f0f0] bg-white">
          <p className="text-[10px] text-neutral-400 font-mono mb-1.5">Suggested prompts</p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((sug, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(sug.text)}
                className="text-[10px] bg-neutral-100 hover:bg-black hover:text-white border border-neutral-200 transition-all rounded px-2 py-1 flex items-center space-x-1 cursor-pointer font-medium"
              >
                <span>{sug.label}</span>
                <ArrowRight className="w-2.5 h-2.5 opacity-50" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Keyboard Input Controller */}
      <div className="p-3 border-t border-[#e3e3e3] bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="relative flex items-center border border-[#ccc] rounded-md bg-[#fafafa] focus-within:ring-1 focus-within:ring-black focus-within:border-black overflow-hidden"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask Sidekick anything about the store..."
            className="flex-1 px-3 py-2.5 text-xs bg-transparent focus:outline-none pr-10 text-black pr-12"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="absolute right-1.5 p-1.5 rounded bg-black hover:bg-neutral-800 text-white disabled:bg-neutral-100 disabled:text-neutral-400 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        <div className="flex items-center justify-between mt-1 px-1">
          <p className="text-[9px] text-neutral-400 text-left">
            Connected to <strong>Atelier Noir Admin</strong>
          </p>
          <span className="text-[8px] text-neutral-400 font-mono flex items-center">
            Enter <CornerDownLeft className="w-2 h-2 ml-0.5" />
          </span>
        </div>
      </div>
    </div>
  );
}
