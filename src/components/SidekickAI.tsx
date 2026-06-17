/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Sparkles, Send, Trash, ArrowRight, CornerDownLeft, RefreshCcw,
  ChevronDown, Search, Plus, MessageSquare, Check, Maximize2, Minimize2,
  Paperclip, ShoppingBag, ArrowUp, HelpCircle, Bell, Settings, FileText, 
  TrendingUp, PenSquare, Mic, MicOff, Brain, X, FileSpreadsheet, ImageIcon, 
  FileCode, Navigation, CheckCircle2, ChevronRight
} from 'lucide-react';
import { ChatMessage, Product, Order, Discount } from '../types';
import { useShopStore } from '../stores/shopStore';
import { useLayoutStore } from '../stores/layoutStore';

interface SidekickAIProps {
  products: Product[];
  orders: Order[];
  discounts: Discount[];
  onApplyDiscount?: (code: string) => void;
  onClose?: () => void;
  isMaximized?: boolean;
  setIsMaximized?: (val: boolean) => void;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
}

const PRE_SEEDED_SESSIONS: ChatSession[] = [
  {
    id: 'session-1',
    title: 'Shopify 菜单分析和实现设置',
    updatedAt: Date.now() - 3600000 * 2,
    messages: [
      {
        id: 'msg-s1-1',
        role: 'model',
        text: '您好！我是 Sidekick。根据最新分析，Atelier Noir 的菜单层级建议采用克制而精密的 3 大模块重构，降低顾客在跨国结算和多语言时的决策摩擦。',
        timestamp: '10:15'
      },
      {
        id: 'msg-s1-2',
        role: 'user',
        text: '我们要支持多语言翻译和欧盟跨境VAT自动核算，菜单怎么调？',
        timestamp: '10:16'
      },
      {
        id: 'msg-s1-3',
        role: 'model',
        text: '建议在销售中心下开设 **Markets** 子轨道，并在顶部控制区直接部署自动定位。我已经为您在系统中配置并校验了多语言支持，可以通过一击快速到达配置页。',
        timestamp: '10:17'
      }
    ]
  },
  {
    id: 'session-2',
    title: 'Shopify POS 模块分析与设计风格',
    updatedAt: Date.now() - 3600000 * 12,
    messages: [
      {
        id: 'msg-s2-1',
        role: 'model',
        text: 'Atelier Noir POS 硬件连接及备用金校验模块已就绪，当前正在监听物理收银指令。',
        timestamp: '昨天 15:30'
      },
      {
        id: 'msg-s2-2',
        role: 'user',
        text: '我们差一个 POS 专属的外设和账单管理器，如何呈现？',
        timestamp: '昨天 15:31'
      },
      {
        id: 'msg-s2-3',
        role: 'model',
        text: '我们已经将最先进的 58mm 热敏印刷、RJ11 电磁钱箱以及手动让利特权级联隔离到了本端。您可以通过 "F6" 或点击设置进入深度客制。',
        timestamp: '昨天 15:32'
      }
    ]
  }
];

const DEFAULT_MEMORIES = [
  "1. 本店倡导意式经典高纯雅(Quiet Luxury)调性，AI文案应保持绝对的高洁、精炼及专业质地。",
  "2. 经营底线：除非重大季节性大赏，日常促销折扣不应低于85折以保障品牌尊享价值感。",
  "3. 首选原料：商品描述中重点主推比利时精细生态亚麻、托斯卡纳植鞣牛皮，以及环保环保无废制金件。",
  "4. 专邮发运：单笔高客单包裹配送采用专属高质烫金盒饰，内置微香片并随箱手写致礼卡单。"
];

export default function SidekickAI({ 
  products, 
  orders, 
  discounts, 
  onApplyDiscount, 
  onClose,
  isMaximized = false,
  setIsMaximized
}: SidekickAIProps) {
  const { settings } = useShopStore();
  const { currentTab, setCurrentTab } = useLayoutStore();

  // 🧠 Long Term Memory (持久化长记忆管理)
  const [memories, setMemories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sidekick_long_term_memory');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_MEMORIES;
  });
  const [newMemoryText, setNewMemoryText] = useState('');
  const [showMemoryDrawer, setShowMemoryDrawer] = useState(false);

  // Sync Memory
  useEffect(() => {
    try {
      localStorage.setItem('sidekick_long_term_memory', JSON.stringify(memories));
    } catch (e) {}
  }, [memories]);

  // Chat sessions Management
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('sidekick_sessions');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return PRE_SEEDED_SESSIONS;
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem('sidekick_active_session_id');
      if (savedId) return savedId;
    } catch (e) {}
    return 'session-1';
  });

  const [showSessionDropdown, setShowSessionDropdown] = useState(false);
  const [sessionSearchQuery, setSessionSearchQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 📂 Attachment Upload states
  const [attachedFiles, setAttachedFiles] = useState<{name: string, type: string, size: string}[]>([]);
  const [showUploadDropdown, setShowUploadDropdown] = useState(false);

  // 🎤 Microphone Recording state (语音模拟)
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimerRef = useRef<number | null>(null);

  // Dynamic context action chips based on navigation (上下文敏感动作微章)
  const currentContextChips = useMemo(() => {
    switch (currentTab) {
      case 'home':
        return [
          { label: "📊 经营分析报告", prompt: "盘点并生成全店本周销售增长与支付转化率报告" },
          { label: "🧠 长期配置诊断", prompt: "审阅目前的大脑记忆库，评估当前的品牌忠实度设想" },
          { label: "🎫 新人揽投推介", prompt: "推荐一套面向流失未发货客群的高效招揽折扣方案" }
        ];
      case 'products':
      case 'inventory':
      case 'collections':
        return [
          { label: "📦 危急低库存预警", prompt: "帮我查询全店可用物理库存小于10件的低库存单品，并汇总它们的分仓" },
          { label: "✍️ 细节宝贝文案", prompt: "帮我为一款由比利时亚麻精制成的居家休闲服编写高雅大方的描述" },
          { label: "🌐 优化主款SEO", prompt: "审查全店高客单服装的SEO网页元数据，提供标题和描述提亮意见" }
        ];
      case 'orders':
      case 'drafts':
      case 'abandoned':
      case 'returns':
        return [
          { label: "🧾 召回流失购物车", prompt: "帮我盘点已流失结账(Abandoned Checkout)的用户清单，怎么写触达回暖邮件？" },
          { label: "✈️ 提派待出发包裹", prompt: "列出目前尚未执行物流出库发货(Unfulfilled)的订单状态与承运分配" }
        ];
      case 'discounts':
        return [
          { label: "🎫 制定15%秋新代码", prompt: "为我们即将推出的一季度秋装精选，量身拟一份减免15%的FESTIVE15折扣券" },
          { label: "🔥 折扣边际效应审计", prompt: "分析目前已发放的所有促销活动代码和它们的被使用频率及毛利影响" }
        ];
      case 'analytics':
      case 'finance':
        return [
          { label: "💰 利润账目审计", prompt: "帮我提取和对账最近一周分店的资金到账流水与待扣费率分摊" },
          { label: "📈 爆款结构与客单", prompt: "分析当前销售转化表现核心亮点，找寻目前引流最高的单品结构" }
        ];
      case 'settings':
        return [
          { label: "⚙️ 调试大脑开关状态", prompt: "查看我目前在设置中心开启了哪些AI大脑模型微调特权参数" },
          { label: "🌍 支持国际多语言", prompt: "指导我们如何在管理后台中无损开启并配置德文及意文支持页面" }
        ];
      default:
        return [
          { label: "📦 危急低库存预警", prompt: "帮我查询全店可用物理库存小于10件的低库存单品，并汇总它们的分仓" },
          { label: "✍️ 细节宝贝文案", prompt: "帮我为一款由比利时亚麻精制成的居家休闲服编写高雅大方的描述" },
          { label: "📊 经营分析报告", prompt: "盘点并生成全店本周销售增长与支付转化率报告" }
        ];
    }
  }, [currentTab]);

  // Suggested questions based on Atelier Noir parameters
  const SUGGESTIONS = [
    { text: "有哪些商品目前的库存量偏低需要补货？", label: "📦 低库存盘点" },
    { text: "帮我为一款旗舰亚麻帽衫撰写一段清爽而大气的商品描述", label: "✍️ 宝贝文案" },
    { text: "帮我制定一个高转化率的10%秋季新品优惠券策略", label: "🏷️ 优惠券方案" },
    { text: "我们店铺这周以来的销售与财务指标怎么样？", label: "📊 店铺表现" }
  ];

  // Active computed session
  const activeSession = useMemo(() => {
    return sessions.find(s => s.id === activeSessionId) || sessions[0] || null;
  }, [sessions, activeSessionId]);

  // Sync sessions to local
  useEffect(() => {
    try {
      localStorage.setItem('sidekick_sessions', JSON.stringify(sessions));
    } catch (e) {}
  }, [sessions]);

  useEffect(() => {
    try {
      localStorage.setItem('sidekick_active_session_id', activeSessionId);
    } catch (e) {}
  }, [activeSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isTyping]);

  //  micrófono de grabación (Simulated Audio Ticker)
  useEffect(() => {
    if (isRecording) {
      setRecordingTime(0);
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 3) {
            // Stop voice automatically after 3.5 seconds
            handleStopRecording(true);
            return 3;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording]);

  const handleStartRecording = () => {
    setIsRecording(true);
  };

  const handleStopRecording = (autoSubmit = false) => {
    setIsRecording(false);
    if (autoSubmit) {
      // High-quality mock vocal recognition query matching system navigation and data audit
      const mockAudioRecognitions = [
        "帮我看看最近有哪几款商品是低库存，然后带我去商品仓库看一眼",
        "有放弃结账流失订单吗？我想要一个催付活动，并跳转到折扣券页面",
        "我想看一下财务流水情况，顺便跳到分析页面查看整体的周交易"
      ];
      const randomPrompt = mockAudioRecognitions[Math.floor(Math.random() * mockAudioRecognitions.length)];
      setInputValue(randomPrompt);
      // Auto trigger with delay so user spots progress
      setTimeout(() => {
        handleSendMessage(randomPrompt);
      }, 500);
    }
  };

  // Core Sending Logic (Sycnecd with system map navigation and modal files)
  const handleSendMessage = async (text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText && attachedFiles.length === 0) return;

    // Save attachments of this send
    const activeAttachments = [...attachedFiles];
    setAttachedFiles([]); // Clear attachment row

    let finalQueryText = trimmedText;
    if (activeAttachments.length > 0) {
      const namesList = activeAttachments.map(f => `[已上传 ${f.type === 'image' ? '📸 图片文件' : f.type === 'csv' ? '📊 表格文件' : '🛠️ 配置文件'}: ${f.name} (${f.size})]`).join(', ');
      finalQueryText = `${namesList} ${trimmedText || '已上传并要求人工智能核心进行离线/在线多模态深度审计解析。'}`;
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: finalQueryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setSessions(prev => {
      return prev.map(s => {
        if (s.id === activeSessionId) {
          const updatedMsgs = [...s.messages, userMsg];
          const shouldUpdateTitle = s.title === 'Nuova conversazione' || s.title.startsWith('新建会话');
          const finalTitle = shouldUpdateTitle ? (text.length > 20 ? text.substring(0, 20) + '...' : text) : s.title;
          return {
            ...s,
            title: finalTitle,
            messages: updatedMsgs,
            updatedAt: Date.now()
          };
        }
        return s;
      });
    });

    setInputValue('');
    setIsTyping(true);

    // 🗺️ AI System Map Core Interceptor (系统地图级一键转跳与导航解析)
    let autoRedirectedTab = '';
    let autoRedirectedTabLabel = '';
    const cleanPrompt = finalQueryText.toLowerCase();

    if (cleanPrompt.includes('订单') || cleanPrompt.includes('orders') || cleanPrompt.includes('order') || cleanPrompt.includes('流失') || cleanPrompt.includes('checkout') || cleanPrompt.includes('待发货')) {
      autoRedirectedTab = 'orders';
      autoRedirectedTabLabel = '订单中枢 (Orders)';
    } else if (cleanPrompt.includes('库存') || cleanPrompt.includes('inventory') || cleanPrompt.includes('stock') || cleanPrompt.includes('补货') || cleanPrompt.includes('低库存')) {
      autoRedirectedTab = 'inventory';
      autoRedirectedTabLabel = '商品管理 > 物理库存 (Inventory)';
    } else if (cleanPrompt.includes('商品') || cleanPrompt.includes('products') || cleanPrompt.includes('产品') || cleanPrompt.includes('collections') || cleanPrompt.includes('系列')) {
      autoRedirectedTab = 'products';
      autoRedirectedTabLabel = '商品中枢 (Products)';
    } else if (cleanPrompt.includes('折扣') || cleanPrompt.includes('discounts') || cleanPrompt.includes('coupon') || cleanPrompt.includes('优惠券') || cleanPrompt.includes('促销') || cleanPrompt.includes('zhekou')) {
      autoRedirectedTab = 'discounts';
      autoRedirectedTabLabel = '营销折扣 (Discounts)';
    } else if (cleanPrompt.includes('设置') || cleanPrompt.includes('settings') || cleanPrompt.includes('大脑') || cleanPrompt.includes('配置')) {
      autoRedirectedTab = 'settings';
      autoRedirectedTabLabel = '系统设置中心 (Settings)';
    } else if (cleanPrompt.includes('数据') || cleanPrompt.includes('analytics') || cleanPrompt.includes('报表') || cleanPrompt.includes('财务') || cleanPrompt.includes('流水') || cleanPrompt.includes('shuju') || cleanPrompt.includes('caiwu')) {
      autoRedirectedTab = 'analytics';
      autoRedirectedTabLabel = '智能数据大盘 (Analytics)';
    } else if (cleanPrompt.includes('主页') || cleanPrompt.includes('首页') || cleanPrompt.includes('home') || cleanPrompt.includes('大盘')) {
      autoRedirectedTab = 'home';
      autoRedirectedTabLabel = '主页大盘 (Home)';
    } else if (cleanPrompt.includes('多语言') || cleanPrompt.includes('markets') || cleanPrompt.includes('market') || cleanPrompt.includes('翻译') || cleanPrompt.includes('跨境') || cleanPrompt.includes('翻译') || cleanPrompt.includes('外文')) {
      autoRedirectedTab = 'ai-apps';
      autoRedirectedTabLabel = '智能大脑跨境多语言翻译器 (AI App)';
    } else if (cleanPrompt.includes('文案') || cleanPrompt.includes('写作') || cleanPrompt.includes('seo') || cleanPrompt.includes('优化') || cleanPrompt.includes('策划') || cleanPrompt.includes('ai应用')) {
      autoRedirectedTab = 'ai-apps';
      autoRedirectedTabLabel = '智能大脑辅助套件 (AI App)';
    } else if (cleanPrompt.includes('收银') || cleanPrompt.includes('pos')) {
      autoRedirectedTab = 'pos-setup';
      autoRedirectedTabLabel = '线下收银POS (POS Setup)';
    }

    // Fire automatic React Tab movement! Fully responsive!
    if (autoRedirectedTab) {
      setTimeout(() => {
        setCurrentTab(autoRedirectedTab);
      }, 300);
    }

    try {
      // Format Memory variables to enrich context
      const formattedMemories = memories.map(m => `Merchant memory setting: ${m}`).join('\n');
      
      const response = await fetch('/api/sidekick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `${finalQueryText}\n\n[Active Memory Rule Override]:\n${formattedMemories}`,
          history: activeSession ? activeSession.messages.slice(1) : [],
          storeState: { products, orders, discounts, settings }
        })
      });

      if (!response.ok) throw new Error('Server error');
      const data = await response.json();
      
      let replyText = data.text;

      // Append visual map travel notice if auto redirected
      if (autoRedirectedTab) {
        replyText = `🧭 **系统地图自动路线调配已就绪**\n\n我已经侦测到您的自然语言指令定位。**已自动带您瞬移直达「${autoRedirectedTabLabel}」面板！**\n\n---\n\n` + replyText;
      }

      // Add attachment analysis overlay if attachment present
      if (activeAttachments.length > 0) {
        const item = activeAttachments[0];
        if (item.type === 'image') {
          replyText = `📷 **[多模态首版图解析芯片]** 成功捕捉细节图：\`${item.name}\`。\n\n* **图片质地度评定**：面料呈高对比度比利时原产麦色，结构经纬平滑。已自动保存至您的草稿图片图床。\n* **建议动作**：推荐直接在「商品中心」关联此首版图。\n\n---\n\n` + replyText;
        } else if (item.type === 'csv') {
          replyText = `📊 **[供应链电子表格导入芯片]** 已成功无损解析表格 \`${item.name}\`。\n\n* **检测到数据批次**：12 个供应商库存更新日志。\n* **诊断风险**：有2个批次库存数据（陶瓷手冲咖啡壶等）与 Atelier Noir 实体库发生 3.5% 的离线对账公差，已帮您自动进行抹平校正。\n\n---\n\n` + replyText;
        } else if (item.type === 'json') {
          replyText = `⚙️ **[长记忆规则配置文件 (.JSON)]** 成功绑定并注入 \`${item.name}\` 规程。\n\n* **权限级别**：符合多租户商户数据隔离协议 (` + "`Tenant_ID: secure-051a`" + `)。已合并至本次会话上下文。\n\n---\n\n` + replyText;
        }
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'model',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setSessions(prev => {
        return prev.map(s => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: [...s.messages, assistantMsg],
              updatedAt: Date.now()
            };
          }
          return s;
        });
      });
    } catch (e) {
      // Fallback Engine matching systemic parameters perfectly
      setTimeout(() => {
        let replyText = "*(本地局域网或 API 凭证暂处于脱机保护环境，系统地图助理已直接在商户端完成本端运算)*\n\n";
        
        if (autoRedirectedTab) {
          replyText += `🧭 **已开启系统地图自动寻径**\n\n已成功将界面切换并直达 **「${autoRedirectedTabLabel}」** 模块面板！\n\n---\n\n`;
        }

        if (activeAttachments.length > 0) {
          const item = activeAttachments[0];
          if (item.type === 'image') {
            replyText += `📸 **图像解析芯片已就绪**：成功捕捉到您上传的宝贝实拍图 \`${item.name}\`。材质纹理属于比利时高织亚麻。已经为您关联归档到媒体云仓库！\n\n`;
          } else if (item.type === 'csv') {
            replyText += `📊 **表格数据已导入**：成功导入 \`${item.name}\`，检测到多点货位变动数据，已在 LocalStorage 中预先对账对齐。\n\n`;
          } else if (item.type === 'json') {
            replyText += `⚙️ **JSON 店家配置已合并**：成功合并 \`${item.name}\` 定义。极简而纯粹的意式大盘将继续践行此策略限制。\n\n`;
          }
        }

        if (cleanPrompt.includes('low') || cleanPrompt.includes('stock') || cleanPrompt.includes('inventory') || cleanPrompt.includes('库存') || cleanPrompt.includes('缺货')) {
          replyText += `### ⚠️ 低库存预警与备货指引
根据数据对账：
1. **陶瓷手冲咖啡壶** (SKU: \`MC-DRP-CHR\`)：目前可用库存仅剩 **3 件**。
2. **手工复古植鞣皮夹** (SKU: \`MC-WLT-TAN\`)：本周出货频频，库存仅剩 **6 件**。

**推荐应对动作：**
* 请点击下方 **“物理库存 (Inventory)”** 子菜单，一键微调补满其米兰总仓的配额。`;
        } else if (cleanPrompt.includes('description') || cleanPrompt.includes('shirt') || cleanPrompt.includes('draft') || cleanPrompt.includes('copy') || cleanPrompt.includes('文案') || cleanPrompt.includes('描述')) {
          replyText += `### ✍️ 智能详情文案生成

> "精选百年比利时优质亚麻编织而成，我们这款居家舒适卫衣在挺括廓形与舒展体感间找到了绝佳的平衡。衣身线条优雅内敛，随着日常穿着，天然材质的独特褶皱质感将更显温润。防风透气，四季适宜。"

**已自动为您匹配的宝贝标签：**
* \`环保亚麻\`, \`经典极简\`, \`设计美学\``;
        } else if (cleanPrompt.includes('discount') || cleanPrompt.includes('coupon') || cleanPrompt.includes('promo') || cleanPrompt.includes('折扣') || cleanPrompt.includes('优惠券')) {
          replyText += `### 🎫 推荐营销活动提案：FESTIVE15 折扣码
* **优惠劵代码**: \`FESTIVE15\`
* **优惠类型**: 全店通用百分比促销 (**减免 15% OFF**)
* **使用门槛**: 单笔订单满 €50.00 起效
* **目标流失召回率**: 预估提振 22% 放弃未支付流失客`;
        } else {
          replyText += `### 智能 Sidekick 助理就绪
我已经收到您的指令。目前已同步注入并践行您脑存储中设定的 **「${memories.length} 条长期商业准则」**。

我可以帮您进行：
1. **系统地图精准带路** (如"带我去订单页面"、"看看库存设置")；
2. **多模态文件上传审核** (随时拖拽或点击夹子上传商品图、供应链表格)；
3. **低库存分析、优雅文案撰写及财务对账**。`;
        }

        const helperMsg: ChatMessage = {
          id: `assistant-fallback-${Date.now()}`,
          role: 'model',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setSessions(prev => {
          return prev.map(s => {
            if (s.id === activeSessionId) {
              return {
                ...s,
                messages: [...s.messages, helperMsg],
                updatedAt: Date.now()
              };
            }
            return s;
          });
        });
      }, 700);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setSessions(prev => {
      return prev.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            title: '新建会话',
            messages: [
              {
                id: `init-${Date.now()}`,
                role: 'model',
                text: "已为您清空当前历史上下文。今天有什么关于店铺管理和货品优化的工作需要我协助？",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ],
            updatedAt: Date.now()
          };
        }
        return s;
      });
    });
  };

  const handleNewSession = () => {
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: '新建会话',
      updatedAt: Date.now(),
      messages: [
        {
          id: `init-${Date.now()}`,
          role: 'model',
          text: "您好！我是 **Sidekick**，您的智能店铺管理副驾驶。\n\n我可以帮您快速盘点低库存货品、撰写优质的营销及商品文案、生成优惠促销方案或深入透视店铺销售报表。\n\n你可以直接使用自然语言控制我（如说 **'带我跳转到订单列表'**），也可以在点击纸夹上传商品细节原图！",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newId);
    setShowSessionDropdown(false);
  };

  const handleDeleteSession = (id: string) => {
    if (sessions.length <= 1) {
      handleClearChat();
      return;
    }
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) {
      const remaining = sessions.filter(s => s.id !== id);
      setActiveSessionId(remaining[0].id);
    }
  };

  const selectSession = (id: string) => {
    setActiveSessionId(id);
    setShowSessionDropdown(false);
  };

  const filteredSessions = useMemo(() => {
    const q = sessionSearchQuery.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter(s => 
      s.title.toLowerCase().includes(q) || 
      s.messages.some(m => m.text.toLowerCase().includes(q))
    );
  }, [sessions, sessionSearchQuery]);

  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, idx) => {
      let content = line;
      if (content.startsWith('### ')) {
        return <h3 key={idx} className="font-semibold text-[13px] text-neutral-950 mt-3 mb-1.5 font-sans tracking-tight">{content.replace('### ', '')}</h3>;
      }
      if (content.startsWith('## ')) {
        return <h2 key={idx} className="font-semibold text-sm text-neutral-950 mt-4 mb-2 font-sans tracking-tight">{content.replace('## ', '')}</h2>;
      }
      if (content.startsWith('* ') || content.startsWith('- ')) {
        const cleaned = content.substring(2);
        return (
          <li key={idx} className="ml-4 list-disc text-neutral-705 leading-relaxed py-0.5 text-[11.5px]">
            {parseInlineStyles(cleaned)}
          </li>
        );
      }
      if (content.startsWith('> ')) {
        return (
          <blockquote key={idx} className="border-l-[3px] border-neutral-900 pl-3 py-1 my-2.5 italic text-[11px] text-neutral-600 bg-neutral-50 rounded-r">
            {parseInlineStyles(content.replace('> ', ''))}
          </blockquote>
        );
      }
      if (content.trim() === '') {
        return <div key={idx} className="h-1.5" />;
      }
      return (
        <p key={idx} className="text-[11.5px] text-neutral-800 leading-relaxed py-0.5">
          {parseInlineStyles(content)}
        </p>
      );
    });
  };

  const parseInlineStyles = (txt: string) => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    const codeRegex = /`(.*?)`/g;

    let tempText = txt;
    // Map navigation links parsing to clickable tokens
    return (
      <span 
        dangerouslySetInnerHTML={{
          __html: tempText
            .replace(boldRegex, '<strong class="font-bold text-neutral-950">$1</strong>')
            .replace(codeRegex, '<code class="px-1 py-0.5 bg-neutral-100 rounded text-[10.5px] font-mono text-neutral-800">$1</code>')
        }} 
      />
    );
  };

  // Mock Upload Selector Trigger
  const triggerMockUpload = (fileName: string, fileType: string, fileSize: string) => {
    setAttachedFiles(prev => [...prev, { name: fileName, type: fileType, size: fileSize }]);
    setShowUploadDropdown(false);
  };

  // Remove attached item
  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Memory ledger modifications
  const handleAddMemory = () => {
    if (!newMemoryText.trim()) return;
    setMemories(prev => [...prev, `${prev.length + 1}. ${newMemoryText.trim()}`]);
    setNewMemoryText('');
  };

  const clearMemories = () => {
    if (confirm("确定要格式化 AI 脑中谱的长期记忆吗？")) {
      setMemories([]);
    }
  };

  // Renders a navigation helper card dynamically within the chat stream if relevant
  const renderNavCard = (messageText: string) => {
    const textLower = messageText.toLowerCase();
    const mapMatch = [
      { trigger: 'orders', label: '订单管理 (Orders)', tab: 'orders' },
      { trigger: '订单', label: '订单中心 (Orders)', tab: 'orders' },
      { trigger: 'inventory', label: '物理账簿 (Inventory)', tab: 'inventory' },
      { trigger: '库存', label: '物理账簿 (Inventory)', tab: 'inventory' },
      { trigger: 'products', label: '商品中枢 (Products)', tab: 'products' },
      { trigger: '商品', label: '商品中枢 (Products)', tab: 'products' },
      { trigger: '产品', label: '商品中枢 (Products)', tab: 'products' },
      { trigger: 'discounts', label: '折扣券管理 (Discounts)', tab: 'discounts' },
      { trigger: '折扣', label: '折扣管理 (Discounts)', tab: 'discounts' },
      { trigger: '优惠', label: '折扣管理 (Discounts)', tab: 'discounts' },
      { trigger: 'settings', label: '设置中心 (Settings)', tab: 'settings' },
      { trigger: '设置', label: '设置中心 (Settings)', tab: 'settings' },
      { trigger: 'analytics', label: '数据大盘 (Analytics)', tab: 'analytics' },
      { trigger: '数据', label: '数据大盘 (Analytics)', tab: 'analytics' },
      { trigger: 'finance', label: '财务结算 (Finance)', tab: 'finance' },
      { trigger: '财务', label: '财务流水 (Finance)', tab: 'finance' }
    ].find(item => textLower.includes(item.trigger));

    if (mapMatch) {
      return (
        <div className="mt-2 p-2 px-3 border border-neutral-150 bg-neutral-50 rounded-lg flex items-center justify-between hover:bg-neutral-100/50 transition-colors">
          <div className="flex items-center space-x-2">
            <Navigation className="w-3.5 h-3.5 text-neutral-800 animate-pulse" />
            <span className="text-[10.5px] font-sans font-bold text-neutral-700">系统地图推荐：{mapMatch.label}</span>
          </div>
          <button 
            onClick={() => setCurrentTab(mapMatch.tab)}
            className="flex items-center space-x-0.5 text-[9.5px] font-bold text-black border border-black hover:bg-black hover:text-white rounded-md px-2 py-0.5 transition-all select-none cursor-pointer"
          >
            <span>一键跳入</span>
            <ChevronRight className="w-2.5 h-2.5" />
          </button>
        </div>
      );
    }
    return null;
  };

  // Header Memory/Brain Element
  const renderMemoryHeaderButton = () => (
    <button 
      id="sidekick-brain-indicator-btn"
      onClick={() => setShowMemoryDrawer(!showMemoryDrawer)}
      className="hidden"
      title="审查 AI 脑智库长期记忆 (Long Term Memory Ledger)"
    >
      <Brain className={`w-3.5 h-3.5 ${showMemoryDrawer ? 'animate-pulse' : ''}`} />
      <span className="text-[10px] font-bold">长记忆 ({memories.length})</span>
    </button>
  );

  // MAXIMIZED CORE LAYOUT
  if (isMaximized) {
    return (
      <div id="sidekick-maximized-workspace" className="flex-1 bg-[#fafafa] flex flex-col justify-between relative h-full overflow-hidden font-sans select-none text-black">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#e3e3e3] shrink-0 bg-white shadow-3xs">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-3 h-3 rounded-full bg-neutral-900 border border-white shrink-0 animate-pulse"></div>
            <span className="font-extrabold text-[12.5px] tracking-tight text-neutral-800 truncate max-w-[120px] sm:max-w-[300px]">
              {activeSession ? (activeSession.title === 'Nuova conversazione' ? '新建会话' : activeSession.title) : '新建会话'}
            </span>
            <span className="px-1.5 py-0.5 bg-neutral-100 border border-neutral-200 rounded text-[9px] uppercase font-bold text-neutral-500 hover:text-neutral-900 transition-colors">
              当前视窗：{`「${currentTab}」`}
            </span>
            <button
              type="button"
              onClick={handleNewSession}
              className="flex items-center gap-1 px-2.5 py-1 text-[10.5px] text-[#07C2E3] hover:text-[#06B2D0] border border-[#07C2E3]/25 hover:border-[#07C2E3] rounded-lg bg-[#07C2E3]/5 hover:bg-[#07C2E3]/10 transition-colors cursor-pointer select-none font-bold"
              title="开启新对话"
            >
              <Plus className="w-3" />
              <span>新建会话</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {renderMemoryHeaderButton()}

            <button 
              id="header-help-btn"
              onClick={() => setCurrentTab('settings')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-neutral-600 border border-neutral-200 hover:border-black rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors cursor-pointer select-none font-bold"
            >
              <HelpCircle className="w-3.5 h-3.5 text-neutral-500" />
              <span>设置</span>
            </button>

            {setIsMaximized && (
              <button 
                id="sidekick-minimize-workspace-btn"
                onClick={() => setIsMaximized(false)}
                className="p-1.5 hover:bg-neutral-100 rounded-lg border border-neutral-200 text-neutral-550 hover:text-black transition-colors cursor-pointer"
                title="折叠为主面板 (恢复右侧挂起)"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            )}

            {onClose && (
              <button 
                id="sidekick-close-workspace-btn"
                onClick={onClose}
                className="p-1.5 hover:bg-neutral-100 rounded-lg border border-neutral-200 text-neutral-550 hover:text-red-500 transition-colors cursor-pointer"
                title="关闭 Sidekick 侧边栏"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Master Workspace Box */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* Main Conversational Section */}
          <div className="flex-grow flex flex-col h-full overflow-hidden bg-white relative">
            <div className="flex-grow overflow-y-auto p-6 space-y-5">
              {(!activeSession || activeSession.messages.length <= 1) ? (
                
                /* EXCLUSIVE FULL-SCALE HEURISTIC LANDING VIEW */
                <div id="sidekick-landing-view" className="w-full max-w-xl mx-auto space-y-6 pt-5">
                  <div className="text-center space-y-1">
                    <h1 className="text-2xl font-light font-sans tracking-tight text-neutral-900 flex items-center justify-center gap-2">
                       Hello, Atelier <Sparkles className="w-5 h-5 text-neutral-800 shrink-0" />
                    </h1>
                    <p className="text-[11.5px] text-neutral-400 font-sans">
                      我是您的 Commerce OS 副驾驶。支持低库存分仓审计、多模态原物料主图解析、以及全自动系统地图瞬移导航。
                    </p>
                  </div>

                  <div className="space-y-2 max-w-lg mx-auto pt-3">
                    <p className="text-[9.5px] font-bold text-neutral-400 uppercase tracking-wider block font-sans">优秀功能范本推荐</p>
                    <div className="grid grid-cols-2 gap-3">
                      {SUGGESTIONS.map((sug, idx) => (
                        <div 
                          key={idx}
                          onClick={() => handleSendMessage(sug.text)}
                          className="border border-neutral-200 hover:border-black rounded-lg p-3 bg-white hover:bg-neutral-50/50 transition-all cursor-pointer flex flex-col justify-between group h-[72px]"
                        >
                          <div className="flex items-center gap-2">
                            <PenSquare className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            <p className="text-[10.5px] font-bold text-neutral-800">{sug.label}</p>
                          </div>
                          <div className="flex items-center justify-between text-[9.5px] text-neutral-400 group-hover:text-black">
                            <span className="truncate max-w-[150px]">{sug.text}</span>
                            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              ) : (

                /* TRADITIONAL CHAT MESSAGE STREAM FOR MAXIMIZED SCREEN */
                <div className="max-w-xl mx-auto space-y-4">
                  {activeSession.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`max-w-[90%] rounded-xl p-3.5 ${
                        msg.role === 'user' 
                          ? 'bg-neutral-950 text-white rounded-br-none shadow-sm' 
                          : 'bg-white border border-[#e1e1e1] rounded-bl-none shadow-3xs'
                      }`}>
                        {msg.role === 'user' ? (
                          <p className="text-[11.5px] leading-relaxed select-text">{msg.text}</p>
                        ) : (
                          <div className="space-y-1">
                            {renderMarkdown(msg.text)}
                            {renderNavCard(msg.text)}
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] text-neutral-400 mt-1 px-1 font-mono">{msg.timestamp}</span>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex flex-col items-start select-none">
                      <div className="bg-white border border-[#e3e3e3] rounded-xl p-3.5 rounded-bl-none shadow-3xs flex items-center space-x-2">
                        <span className="text-[10px] text-neutral-400 font-sans italic">Sidekick 正在帮您分析处理...</span>
                        <span className="flex space-x-1">
                          <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-[#07C2E3] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                          <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

              )}
            </div>

            {/* Attached files preview shelf */}
            {attachedFiles.length > 0 && (
              <div id="attached-files-shelf" className="px-6 py-2 bg-neutral-50/80 border-t border-neutral-100 flex gap-2 overflow-x-auto shrink-0 z-10">
                {attachedFiles.map((file, idx) => (
                  <div key={idx} className="bg-white border border-neutral-200 rounded-lg p-1.5 px-2.5 flex items-center space-x-2 shrink-0 shadow-3xs animate-fadeIn text-black">
                    {file.type === 'image' ? <ImageIcon className="w-3.5 h-3.5 text-blue-500" /> : file.type === 'csv' ? <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" /> : <FileCode className="w-3.5 h-3.5 text-indigo-500" />}
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-neutral-850 truncate max-w-[120px]">{file.name}</span>
                      <span className="text-[8px] text-neutral-400 font-mono">{file.size}</span>
                    </div>
                    <button onClick={() => removeAttachedFile(idx)} className="p-0.5 bg-neutral-100 hover:bg-neutral-250 text-neutral-400 hover:text-black rounded-full cursor-pointer">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Vocal wave simulation ticker */}
            {isRecording && (
              <div id="recording-simulation-shelf" className="px-6 py-4 bg-orange-50/45 border-t border-orange-100/60 flex items-center justify-between shrink-0 animate-pulse text-neutral-800">
                <div className="flex items-center space-x-3.5">
                  <div className="relative flex items-center justify-center">
                    <span className="absolute animate-ping inline-flex h-4 w-4 rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10.5px] font-bold text-neutral-800">正在录入您的商务口令...</span>
                    <span className="text-[8.5px] text-neutral-400 font-mono">秒数: 00:0{recordingTime} (最大限制 3.5s)</span>
                  </div>
                  {/* Bouncing audio wave bars */}
                  <div className="flex items-end space-x-0.5 h-5 pl-2">
                    <div className="w-0.5 bg-red-500 h-2 animate-bounce flex"></div>
                    <div className="w-0.5 bg-red-500 h-4 animate-bounce [animation-delay:0.1s] flex"></div>
                    <div className="w-0.5 bg-red-500 h-3 animate-bounce [animation-delay:0.2s] flex"></div>
                    <div className="w-0.5 bg-red-500 h-5 animate-bounce [animation-delay:0.15s] flex"></div>
                    <div className="w-0.5 bg-red-500 h-1.5 animate-bounce [animation-delay:0.3s] flex"></div>
                  </div>
                </div>
                <button 
                  onClick={() => handleStopRecording(true)}
                  className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold cursor-pointer select-none"
                >
                  点击停止并听写
                </button>
              </div>
            )}

            {/* Context-aware Rapid Actions Belt */}
            <div id="context-chips-belt" className="px-6 py-1.5 bg-[#fbfbfb] border-t border-neutral-100 flex items-center gap-1.5 overflow-x-auto shrink-0 select-none">
              <span className="text-[9px] text-neutral-405 font-bold uppercase tracking-wider font-sans opacity-70 shrink-0">当前上下文推荐:</span>
              {currentContextChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip.prompt)}
                  className="text-[9.5px] bg-white border border-neutral-200 hover:border-black rounded-full px-2.5 py-0.5 shrink-0 transition-all font-medium flex items-center space-x-1 cursor-pointer"
                  title={chip.prompt}
                >
                  <Sparkles className="w-2.5 h-2.5 text-neutral-450 shrink-0" />
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>

            {/* Input Dashboard Form Area */}
            <div className="p-4 border-t border-[#e3e3e3] bg-white shrink-0">
              <div className="border border-neutral-250 bg-neutral-50 focus-within:bg-white focus-within:border-neutral-500 rounded-xl p-3 shadow-3xs transition-all flex flex-col gap-2 max-w-xl mx-auto relative">
                <textarea
                  id="maximized-dashboard-textarea"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="向 Sidekick 咨询关于您店铺的任何问题（如：'带带我前往库存管理'）..."
                  className="w-full text-[11.5px] text-neutral-805 bg-transparent resize-none h-16 focus:outline-none focus:ring-0 placeholder-neutral-400"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (inputValue.trim()) handleSendMessage(inputValue);
                    }
                  }}
                />
                
                <div className="flex items-center justify-between pt-1.5 border-t border-neutral-150 shrink-0">
                  <div className="flex items-center space-x-1 text-black relative">
                    
                    {/* Multi-modal Paperclip and Upload Picker */}
                    <button 
                      type="button" 
                      onClick={() => setShowUploadDropdown(!showUploadDropdown)}
                      className="p-1.5 hover:bg-neutral-100 rounded-md text-neutral-500 hover:text-black transition-colors cursor-pointer relative" 
                      title="载入多模态源文件"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                    </button>

                    {showUploadDropdown && (
                      <div className="absolute bottom-9 left-0 bg-white border border-neutral-200 rounded-lg shadow-lg py-1.5 w-44 z-30 animate-slideUp font-sans">
                        <p className="text-[8.5px] font-bold text-neutral-400 px-3 py-1 uppercase tracking-wider select-none">多选模拟上传产品规整</p>
                        <button onClick={() => triggerMockUpload('atelier_classic_linen_hoodie.jpg', 'image', '1.2 MB')} className="flex items-center space-x-2 w-full text-left px-3 py-1.5 text-[10.5px] hover:bg-neutral-50 text-black">
                          <ImageIcon className="w-3 h-3 text-neutral-500" />
                          <span>📸 拍投首版样衣实图</span>
                        </button>
                        <button onClick={() => triggerMockUpload('supply_chain_warehouse_b.csv', 'csv', '31 KB')} className="flex items-center space-x-2 w-full text-left px-3 py-1.5 text-[10.5px] hover:bg-neutral-50 text-black">
                          <FileSpreadsheet className="w-3 h-3 text-neutral-500" />
                          <span>📊 补货对账单 (.CSV)</span>
                        </button>
                        <button onClick={() => triggerMockUpload('multitenant_compliance_rules.json', 'json', '3.5 KB')} className="flex items-center space-x-2 w-full text-left px-3 py-1.5 text-[10.5px] hover:bg-neutral-50 text-black">
                          <FileCode className="w-3 h-3 text-neutral-500" />
                          <span>⚙️ 平台验证协议 (.JSON)</span>
                        </button>
                      </div>
                    )}

                    {/* Microphone Toggle btn */}
                    <button 
                      type="button"
                      onClick={isRecording ? () => handleStopRecording(true) : handleStartRecording}
                      className={`p-1.5 rounded-md transition-colors cursor-pointer ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'hover:bg-neutral-100 text-neutral-500 hover:text-black'}`}
                      title={isRecording ? "停止录音" : "点击麦克风 开启语音商务指令"}
                    >
                      <Mic className="w-3.5 h-3.5" />
                    </button>

                    <div className="bg-neutral-100 border border-neutral-200 rounded-full px-2.5 py-0.5 flex items-center space-x-1 hover:border-black cursor-pointer transition-colors">
                      <span className="text-[9px] text-neutral-600 font-mono font-semibold">智能模型 (Gemini 3.5)</span>
                      <ChevronDown className="w-3 h-3 text-neutral-400" />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSendMessage(inputValue)}
                    disabled={(!inputValue.trim() && attachedFiles.length === 0) || isTyping}
                    className="p-1.5 rounded-full bg-black hover:bg-neutral-800 text-white disabled:bg-neutral-100 disabled:text-neutral-400 transition-all cursor-pointer shadow-3xs"
                  >
                    <ArrowUp className="w-3.5 h-3.5 font-bold text-white" />
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* 🧠 Memory Slide-out Cabinet (脑中枢长期记忆库板面) */}
          {showMemoryDrawer && (
            <div id="sidekick-brain-memory-drawer" className="w-64 border-l border-neutral-200 bg-white shadow-lg p-4 flex flex-col h-full animate-slideLeft overflow-y-auto shrink-0 z-20">
              <div className="flex items-center justify-between border-b border-neutral-150 pb-2 mb-3">
                <div className="flex items-center space-x-1.5">
                  <Brain className="w-4 h-4 text-neutral-900 animate-pulse" />
                  <span className="text-xs font-bold text-neutral-850">🧠 AI 大脑长期记忆数据库</span>
                </div>
                <button onClick={() => setShowMemoryDrawer(false)} className="p-1 hover:bg-neutral-100 rounded text-neutral-400 hover:text-black cursor-pointer">✕</button>
              </div>

              <p className="text-[10px] text-neutral-400 leading-relaxed mb-3">
                存放在此处的长期规则将<b>永久固化并强制介入</b> AI 大脑每次的数据分析与商业文案生成决策中，超越会话上下文，免除重复叮嘱。
              </p>

              {/* Memory ledger list */}
              <div className="space-y-2.5 flex-1 overflow-y-auto min-h-[250px] max-h-[350px] pr-1">
                {memories.map((memo, mIdx) => (
                  <div key={mIdx} className="bg-neutral-50 border border-neutral-150 p-2 rounded-lg text-[10px] text-neutral-700 leading-relaxed hover:border-black transition-colors relative group">
                    <span>{memo}</span>
                    <button 
                      onClick={() => setMemories(prev => prev.filter((_, i) => i !== mIdx))}
                      className="opacity-0 group-hover:opacity-100 absolute top-1 right-1 p-0.5 hover:bg-neutral-200 rounded text-neutral-400 hover:text-black cursor-pointer"
                      title="擦除此记忆"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {memories.length === 0 && (
                  <div className="text-center py-8 text-[10px] text-neutral-400 italic">智库处于空置状态。请录入您的商家法则。</div>
                )}
              </div>

              {/* Memory Append row */}
              <div className="pt-3 border-t border-neutral-150 mt-3 space-y-2">
                <p className="text-[8.5px] font-bold text-neutral-400 uppercase tracking-wider select-none">录入新的长期指令规制</p>
                <div className="flex gap-1">
                  <input
                    type="text"
                    placeholder="例如：发运纸盒必须自带烫金印章"
                    value={newMemoryText}
                    onChange={(e) => setNewMemoryText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddMemory();
                    }}
                    className="flex-1 text-[10px] border border-neutral-200 outline-none p-1.5 focus:border-black rounded bg-neutral-50 focus:bg-white"
                  />
                  <button 
                    onClick={handleAddMemory}
                    className="bg-black hover:bg-neutral-800 text-white text-[10px] px-2.5 font-bold rounded cursor-pointer select-none shrink-0"
                  >
                    写入
                  </button>
                </div>

                <button 
                  onClick={clearMemories}
                  className="w-full text-center py-1 border border-dashed border-red-200 hover:border-red-500 text-red-500 hover:text-red-700 text-[9.5px] font-bold rounded transition-all cursor-pointer select-none"
                >
                  格式化记忆库 (Reset)
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    );
  }

  // MINIMIZED (STANDARD VERTICAL PANEL) LAYOUT
  return (
    <div id="sidekick-main-chat" className="flex flex-col h-full bg-[#fbfbfb] border-l border-[#e3e3e3] text-black relative">
      
      {/* Sidebar Header with Interactive Session Dropdown */}
      <div id="sidekick-chat-header" className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#e3e3e3] z-10 shrink-0">
        <div className="flex items-center space-x-1.5 flex-1 min-w-0">
          <button
            id="switch-history-btn"
            type="button"
            onClick={() => setShowSessionDropdown(!showSessionDropdown)}
            className="flex items-center gap-1.5 text-left hover:bg-neutral-50 px-2.5 py-1.5 -mx-1.5 rounded transition-all cursor-pointer font-sans font-semibold text-neutral-800 text-[12.5px] tracking-tight truncate max-w-full"
            title="点击切换历史对话"
          >
            <span className="truncate">
              {activeSession ? (activeSession.title === 'Nuova conversazione' ? '新建会话' : activeSession.title) : '新建会话'}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-neutral-550 shrink-0 transition-transform duration-200 ${showSessionDropdown ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="flex items-center space-x-2 shrink-0 select-none pl-1">
          {renderMemoryHeaderButton()}

          <button 
            id="clear-active-chat-btn"
            type="button"
            onClick={handleClearChat}
            title="清空当前历史对话"
            className="p-1 hover:bg-neutral-100 rounded text-neutral-500 hover:text-black transition-colors cursor-pointer"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
          </button>

          {onClose && (
            <>
              {setIsMaximized && (
                <button 
                  id="maximize-sidekick-btn"
                  type="button"
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="p-1 hover:bg-neutral-100 rounded text-neutral-500 hover:text-black transition-colors cursor-pointer"
                  title="最大化工作面板"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button 
                id="close-sidekick-btn"
                type="button"
                onClick={onClose}
                className="p-1 hover:bg-neutral-100 rounded text-neutral-500 hover:text-red-500 transition-colors cursor-pointer"
                title="关闭"
              >
                ✕
              </button>
            </>
          )}
        </div>
      </div>

      {/* History sessions dropdown list */}
      {showSessionDropdown && (
        <div id="conversations-overlay" className="absolute top-[49px] inset-x-0 bg-white border-b border-neutral-200 shadow-xl z-20 p-3.5 flex flex-col max-h-[360px] animate-slideDown text-black">
          <div className="relative mb-2.5">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
            <input
              id="search-conversations-input"
              type="text"
              placeholder="搜索历史会话..."
              value={sessionSearchQuery}
              onChange={(e) => setSessionSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 border border-neutral-200 bg-neutral-50 rounded-lg outline-none focus:bg-white focus:ring-1 focus:ring-black font-sans"
            />
          </div>

          <button
            id="new-conversation-modal-btn"
            type="button"
            onClick={handleNewSession}
            className="flex items-center justify-center gap-2 w-full p-2 text-xs text-black border border-dashed border-neutral-300 hover:border-black rounded-lg transition-colors font-bold bg-neutral-50 hover:bg-neutral-100 cursor-pointer mb-2.5 font-mono"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>开启新对话 (新建会话)</span>
          </button>

          <div className="flex-grow overflow-y-auto space-y-1 pr-1 max-h-[220px]">
            <p className="text-[9.5px] font-bold text-neutral-400 uppercase tracking-wider font-mono mb-1.5 select-none">最近会话历史</p>
            {filteredSessions.map((session) => (
              <div
                id={`session-item-${session.id}`}
                key={session.id}
                className={`flex items-center justify-between group p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                  session.id === activeSessionId
                    ? 'bg-neutral-100 text-black font-bold'
                    : 'hover:bg-neutral-50 text-neutral-600'
                }`}
                onClick={() => selectSession(session.id)}
              >
                <div className="flex items-center gap-2 truncate flex-grow min-w-0">
                  <MessageSquare className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="truncate">{session.title === 'Nuova conversazione' ? '新建会话' : session.title}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {session.id === activeSessionId ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <button
                      id={`delete-session-btn-${session.id}`}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(session.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-neutral-250 rounded text-neutral-400 hover:text-red-500 transition-all cursor-pointer"
                      title="删除此会话"
                    >
                      <Trash className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {filteredSessions.length === 0 && (
              <p className="text-center text-[10px] text-neutral-400 py-6 font-mono font-medium">无匹配的对话历史</p>
            )}
          </div>
        </div>
      )}

      {/* 🧠 Memory cabinet inside standard view (absolute pullup) */}
      {showMemoryDrawer && (
        <div id="sidekick-mini-brain-drawer" className="absolute top-[49px] inset-x-0 bg-white border-b border-neutral-200 p-4 shadow-xl z-25 max-h-[300px] flex flex-col animate-slideDown overflow-y-auto min-h-[220px]">
          <div className="flex items-center justify-between border-b pb-2 mb-2">
            <span className="text-xs font-bold flex items-center gap-1">🧠 AI 脑智库长期记忆</span>
            <button onClick={() => setShowMemoryDrawer(false)} className="text-xs text-neutral-450 hover:text-black">收起</button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[160px]">
            {memories.map((m, mIdx) => (
              <div key={mIdx} className="bg-neutral-50 text-[9.5px] p-2 border border-neutral-150 rounded text-neutral-700 relative group leading-relaxed">
                {m}
                <button 
                  onClick={() => setMemories(prev => prev.filter((_, i) => i !== mIdx))}
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-0.5 hover:bg-neutral-200 rounded text-neutral-400"
                >
                  ✕
                </button>
              </div>
            ))}
            {memories.length === 0 && <span className="text-[10px] italic text-neutral-400 py-4 block text-center">暂空。录入以固化大脑表现。</span>}
          </div>
          <div className="pt-2 border-t mt-2 flex gap-1">
            <input
              type="text"
              placeholder="新增规则..."
              value={newMemoryText}
              onChange={(e) => setNewMemoryText(e.target.value)}
              className="flex-1 text-[10px] border outline-none p-1.5 focus:border-black rounded bg-neutral-50 focus:bg-white"
            />
            <button onClick={handleAddMemory} className="bg-black text-white text-[10px] px-2.5 font-bold rounded cursor-pointer">写入</button>
          </div>
        </div>
      )}

      {/* Message stream area */}
      <div id="messages-stream-board" className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeSession?.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className={`max-w-[85%] rounded-lg p-3 ${
              msg.role === 'user' 
                ? 'bg-black text-white rounded-br-none' 
                : 'bg-white border border-[#e1e3e5] rounded-bl-none shadow-sm'
            }`}>
              {msg.role === 'user' ? (
                <p className="text-[11px] leading-relaxed selection:bg-neutral-200 select-text">{msg.text}</p>
              ) : (
                <div className="space-y-1">
                  {renderMarkdown(msg.text)}
                  {renderNavCard(msg.text)}
                </div>
              )}
            </div>
            <span className="text-[8.5px] text-neutral-400 mt-1 px-1 font-mono">{msg.timestamp}</span>
          </div>
        ))}

        {isTyping && (
          <div className="flex flex-col items-start select-none">
            <div className="bg-white border border-[#e3e3e3] rounded-lg p-3 rounded-bl-none shadow-sm flex items-center space-x-2">
              <span className="text-[10px] text-neutral-400 font-sans italic">Sidekick 正在帮您分析处理...</span>
              <span className="flex space-x-1">
                <span className="w-1.2 h-1.2 bg-black rounded-full animate-bounce"></span>
                <span className="w-1.2 h-1.2 bg-[#07C2E3] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.2 h-1.2 bg-black rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Input Prompt Carousel (Shown if session is empty) */}
      {(!activeSession || activeSession.messages.length <= 1) && (
        <div id="suggestions-carousel" className="px-4 py-2 bg-white border-t border-[#f0f0f0] shrink-0 select-none">
          <p className="text-[9.5px] text-neutral-400 font-sans font-bold mb-1 ml-0.5">快捷提问</p>
          <div className="flex flex-wrap gap-1">
            {SUGGESTIONS.map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(sug.text)}
                className="text-[10px] bg-neutral-100 hover:bg-black hover:text-white border border-neutral-200 transition-all rounded-md px-2 py-1 flex items-center space-x-1 cursor-pointer font-bold"
              >
                <span>{sug.label}</span>
                <ArrowRight className="w-2.5 h-2.5 opacity-50" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Attached file previews inside Compact View */}
      {attachedFiles.length > 0 && (
        <div className="px-3 py-1.5 bg-neutral-50 border-t border-neutral-100 flex gap-1.5 overflow-x-auto shrink-0 z-10 text-black">
          {attachedFiles.map((file, idx) => (
            <div key={idx} className="bg-white border border-neutral-150 rounded p-1.5 flex items-center space-x-1.5 text-[9.5px] shadow-3xs shrink-0 animate-fadeIn">
              {file.type === 'image' ? <ImageIcon className="w-3 h-3 text-blue-500" /> : file.type === 'csv' ? <FileSpreadsheet className="w-3 h-3 text-emerald-500" /> : <FileCode className="w-3 h-3 text-indigo-500" />}
              <span className="truncate max-w-[80px] font-bold">{file.name}</span>
              <button onClick={() => removeAttachedFile(idx)} className="p-0.5 hover:bg-neutral-150 rounded">
                <X className="w-2 h-2" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Vocal wave simulator ticker inside Compact View */}
      {isRecording && (
        <div className="px-3 py-2 bg-orange-50 border-t border-orange-100/70 flex items-center justify-between shrink-0 animate-pulse text-neutral-850">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-red-600 inline-block animate-ping"></span>
            <span className="text-[9.5px] font-bold">听写中... (00:0{recordingTime})</span>
            {/* Quick mini soundwave animation block */}
            <div className="flex items-end space-x-0.5 h-3">
              <div className="w-0.5 bg-red-500 h-1.5 animate-bounce"></div>
              <div className="w-0.5 bg-red-500 h-3 animate-bounce [animation-delay:0.1s]"></div>
              <div className="w-0.5 bg-red-500 h-2 animate-bounce [animation-delay:0.2s]"></div>
            </div>
          </div>
          <button onClick={() => handleStopRecording(true)} className="px-1.5 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[8.5px] font-bold cursor-pointer">
            停止
          </button>
        </div>
      )}

      {/* Context-aware Quick Action Chips for Compact View */}
      <div id="context-chips-belt-minimized" className="px-3.5 py-1.5 bg-[#fafafa] border-t border-neutral-150 flex items-center gap-1.5 overflow-x-auto shrink-0 select-none">
        {currentContextChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip.prompt)}
            className="text-[9.5px] bg-white border border-neutral-200 hover:border-black rounded-lg px-2 py-0.5 shrink-0 transition-all font-semibold flex items-center space-x-1 cursor-pointer"
            title={chip.prompt}
          >
            <Sparkles className="w-2.5 h-2.5 text-neutral-400 shrink-0" />
            <span>{chip.label}</span>
          </button>
        ))}
      </div>

      {/* Input Field Belt for Compact View */}
      <div id="keyboard-input-belt" className="p-3 border-t border-[#e3e3e3] bg-white shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="relative flex items-center border border-[#ccc] rounded-md bg-[#fafafa] focus-within:ring-1 focus-within:ring-black focus-within:border-black overflow-hidden"
        >
          <button 
            type="button"
            onClick={() => setShowUploadDropdown(!showUploadDropdown)}
            className="p-1 px-1.5 hover:bg-neutral-100 text-neutral-400 hover:text-black transition-colors border-r border-neutral-200 shrink-0 cursor-pointer text-xs"
            title="模拟拖投或上传产品附件"
          >
            <Paperclip className="w-3.5 h-3.5" />
          </button>

          {showUploadDropdown && (
            <div className="absolute bottom-11 left-1.5 bg-white border border-neutral-200 rounded-lg shadow-lg py-1.5 w-40 z-30 animate-slideUp font-sans text-black">
              <button onClick={() => triggerMockUpload('atelier_samples_view.png', 'image', '814 KB')} className="flex items-center space-x-1.5 w-full text-left px-2.5 py-1.5 text-[10px] hover:bg-neutral-50">
                <ImageIcon className="w-3 h-3 text-neutral-400" />
                <span>📸 实拍样表</span>
              </button>
              <button onClick={() => triggerMockUpload('inventory_replenish.csv', 'csv', '12 KB')} className="flex items-center space-x-1.5 w-full text-left px-2.5 py-1.5 text-[10px] hover:bg-neutral-50">
                <FileSpreadsheet className="w-3 h-3 text-neutral-400" />
                <span>📊 库存表 (.CSV)</span>
              </button>
            </div>
          )}

          <input
            id="chat-input-field"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="咨询有关您店铺的信息..."
            className="flex-grow px-2 py-2 text-xs bg-transparent focus:outline-none pr-14 text-black font-sans"
          />

          <div className="absolute right-1.5 flex items-center space-x-1">
            <button 
              type="button"
              onClick={isRecording ? () => handleStopRecording(true) : handleStartRecording}
              className={`p-1 rounded cursor-pointer ${isRecording ? 'text-red-600 animate-pulse bg-red-105' : 'text-neutral-400 hover:text-black'}`}
              title="模拟智能语音指令录入"
            >
              <Mic className="w-3 h-3" />
            </button>
            <button
              id="submit-chat-btn"
              type="submit"
              disabled={(!inputValue.trim() && attachedFiles.length === 0) || isTyping}
              className="p-1 rounded bg-black hover:bg-neutral-800 text-white disabled:bg-neutral-100 disabled:text-neutral-400 transition-colors cursor-pointer"
            >
              <Send className="w-3 h-3" />
            </button>
          </div>
        </form>
        
        <div className="flex items-center justify-between mt-1 px-1">
          <p className="text-[9px] text-neutral-400 text-left">
            已成功连接至 <strong>Atelier Noir 商户端大盘</strong>
          </p>
          <span className="text-[8px] text-neutral-400 font-mono flex items-center">
            按下 Enter 发送 <CornerDownLeft className="w-2 h-2 ml-0.5 font-bold" />
          </span>
        </div>
      </div>
    </div>
  );
}
