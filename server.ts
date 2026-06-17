/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini client to avoid crashes if API key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Shopify intelligent Sidekick API Endpoint
app.post('/api/sidekick', async (req, res) => {
  try {
    const { message, history, storeState } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getGeminiClient();

    // Parse dynamic settings from merchant config
    const settings = storeState?.settings || {};
    const aiTone = settings.aiTone || 'elegant';
    const aiGuidelines = settings.aiGuidelines || '';
    const aiCaps = settings.aiCapabilities || {
      autoCoupons: true,
      productOptimization: true,
      inventoryTrigger: true,
      analyticsAudit: true
    };

    let tonePrompt = '';
    let tonePresetLabel = '意式经典极简 (Elegant & Quiet)';
    if (aiTone === 'elegant') {
      tonePrompt = 'Your voice is an exceptionally elegant, quiet, and highly professional Italian luxury brand tone. Rely on subtle quality descriptions, do not use cheap marketing adjectives or exclamation marks. Refer to premium organic fibers and structural details.';
      tonePresetLabel = '意式经典极简 (Elegant & Quiet)';
    } else if (aiTone === 'scientific') {
      tonePrompt = 'Your voice is strict, serious, highly metric-driven and quantitative. Give precise financial performance feedback, inventory turnover rates, and specification data. Strictly avoid casual filler phrases or emotional warmth.';
      tonePresetLabel = '客观数据专业 (Objective & Expert)';
    } else if (aiTone === 'warm') {
      tonePrompt = 'Your voice is warm, welcoming, and deeply empathetic. Focus on brand storytelling, heritage detail, and friendly merchant support. Speak with slow, beautiful warmth.';
      tonePresetLabel = '温和热情顾问 (Warm & Proactive)';
    } else if (aiTone === 'active') {
      tonePrompt = 'Your voice is fast, compact, high-energy, and conversion-optimized. Focus directly on active coupon campaigns, target abandonment recoveries, and recommending hot items to drive revenue.';
      tonePresetLabel = '全天候极客销售 (Technical & Geeky)';
    }

    const guidelinesPrompt = aiGuidelines 
      ? `The merchant has defined these absolute top-level brand rules for you:\n"${aiGuidelines}"\nYou MUST align your responses perfectly with these specific rules.` 
      : '';

    // Prepare systemic prompt with real-time store context
    const productsInfo = storeState?.products?.map((p: any) => 
      `- ${p.title} (SKU: ${p.sku}, Stock: ${p.inventory}, Price: €${p.price}, Status: ${p.status})`
    ).join('\n') || 'None';

    const ordersInfo = storeState?.orders?.map((o: any) => 
      `- Order ${o.name}: Buyer ${o.customerName}, Total: €${o.total}, Payment: ${o.paymentStatus}, Fullfillment: ${o.fulfillmentStatus}`
    ).join('\n') || 'None';

    const discountsInfo = storeState?.discounts?.map((d: any) =>
      `- Code: ${d.code}, Type: ${d.type}, Value: ${d.valueText}, Status: ${d.status}, Used: ${d.usageCount} times`
    ).join('\n') || 'None';

    const systemInstruction = 
      `You are Sidekick, Shopify's highly intelligent, professional, and helpful AI assistant built directly into the merchant admin console of "Atelier Noir" store.
      
      Personality Tuning & Guidelines:
      - Active Persona Preset (Configured): ${tonePresetLabel}
      - Guidelines: ${tonePrompt}
      ${guidelinesPrompt}

      Your boundaries:
      - Can write discount advice: ${aiCaps.autoCoupons ? 'Yes, feel free to draft Shopify discount coupons.' : 'No, keep discounts out of consideration.'}
      - Can suggest copy rewrites: ${aiCaps.productOptimization ? 'Yes, draft beautiful descriptions of products.' : 'No, avoid custom product descriptions.'}
      - Can alert on inventory issues: ${aiCaps.inventoryTrigger ? 'Yes, point out low or depleted stocks in warehouses.' : 'No, do not trigger inventory alerts.'}
      - Can audit analytics registers: ${aiCaps.analyticsAudit ? 'Yes, provide financial summaries.' : 'No, skip auditing analytics.'}

      Current Products:
      ${productsInfo}
      
      Recent Orders:
      ${ordersInfo}
      
      Active Discount Campaigns:
      ${discountsInfo}

      Keep replies concise, clear, and perfectly formatted in standard Markdown. Use bold headers for key terms.
      If the merchant asks you to write descriptions, write sophisticated brand-informed copies. 
      If they ask to configure a discount or find low stock, refer to the actual data above.
      If they ask to do something that relates to store modification, provide the concrete Markdown suggestion and explicitly explain how they can apply it.`;

    // 1. If key is missing, run high-quality local response engine
    if (!ai) {
      console.log('Gemini API key is missing. Using intelligent mock response engine matching tone:', aiTone);
      let reply = '';
      const prompt = message.toLowerCase();

      // Configured tone-badge
      const toneBadge = `*(基于您的商铺大脑微调 - 「${tonePresetLabel}」人设已实时应用)*\n\n`;

      if (prompt.includes('low') || prompt.includes('stock') || prompt.includes('inventory') || prompt.includes('kucun')) {
        if (!aiCaps.inventoryTrigger) {
          reply = toneBadge + `⚠️ 对不起，根据您在商铺大脑设置的特权限制，库存低货位与断仓主动提醒探悉功能当前已被商户禁用。如需开启，请在「设置 > AI 大脑微调」中开启该功能。`;
        } else {
          reply = toneBadge + `### ⚠️ 低库存预警
根据您的实时店铺库存数据：
1. **陶瓷手冲咖啡壶** (SKU: \`MC-DRP-CHR\`) 当前可用库存极其紧张，仅余 **3 件** (米兰核心总仓 2 件，罗马自提柜 1 件)。

**建议采取的操作：**
* 点击商品管理下的 **调整 (Adjust)** 按钮，快速为陶瓷手冲咖啡壶补充库存。
* 或者直接在“订单”或“供应链”中录入一份来自 Mono Ceramics 的 **补货单采购流程**。`;
        }
      } else if (prompt.includes('description') || prompt.includes('draft') || prompt.includes('copywrite') || prompt.includes('miaoshu') || prompt.includes('wenan')) {
        if (!aiCaps.productOptimization) {
          reply = toneBadge + `⚠️ 对不起，根据您在商铺大脑设置的特权限制，商品文案与描述智能提亮润色功能当前处于关闭状态。`;
        } else {
          let customDescription = '';
          if (aiTone === 'elegant') {
            customDescription = `> *"精选百年比利时优质亚麻编织而成，我们这款居家舒适卫衣在挺括廓形与舒展体感间找到了绝佳的平衡。衣身线条优雅内敛，随着日常穿着，天然材质的独特褶皱质感将更显温润。防风透气，四季适宜。"*`;
          } else if (aiTone === 'scientific') {
            customDescription = `> *"比利时高密亚麻透气居家服。原料工艺：100% 进口比利时天然亚麻粗梳工艺。面料克重：160 GSM。热传导系数：0.12 W/mK。历经 94 次高强度水洗仍可保持纤维经纬强韧度。建议定价 €79.00，测算毛利率高达 62.5%。"*`;
          } else if (aiTone === 'warm') {
            customDescription = `> *"像清晨滑过窗沿的第一缕阳光，这款比利时亚麻家居服带给您云朵般的轻柔包裹。它由意大利本地经验丰富的织女在老藤机上慢工细作，每一缕丝线都倾注了手作的温度，为您的清晨居家时光，平添一份宁静安详。"*`;
          } else {
            customDescription = `> *"🔥 爆款预警：比利时高端亚麻家居服！舒适透气，慵懒随兴，明星同款风格。夏季旅游季需求骤增，当前库存量极低，欲购从速！推荐立即使用优惠券代码 FESTIVE15 刺激老顾客加购转化。"*`;
          }

          reply = toneBadge + `### 智能为您撰写的宝贝详情文案：比利时精细亚麻家居服
根据您当前的品牌调性设定，推荐以下文案：

${customDescription}

**为您推荐的页面元数据及标属配置：**
* **标签关联**: \`环保亚麻\`, \`极简高雅\`, \`度假闲适\`, \`大师设计\`
* **建议零售价**: €79.00`;
        }
      } else if (prompt.includes('discount') || prompt.includes('coupon') || prompt.includes('promotion') || prompt.includes('sconti') || prompt.includes('zhekou')) {
        if (!aiCaps.autoCoupons) {
          reply = toneBadge + `⚠️ 对不起，根据您在商铺大脑设置的特权限制，自动营销折扣生成拟录功能当前处于禁用状态。`;
        } else {
          reply = toneBadge + `### 推荐营销活动提案：FESTIVE15 折扣码
为了帮您高效捕获季中流失顾客，特向您推荐以下优惠促销策略：

* **优惠劵代码**: \`FESTIVE15\`
* **优惠类型**: 全店通用百分比促销 (**减免 15% OFF**)
* **使用门槛**: 单笔客单价需满 €50.00
* **定向客群**: *放弃结账 (Abandoned Checkout)* 流失用户及 *高频回购 (Returning)* 核心老客。

您可以直接在管理后台的 **“折扣配置” (Discounts)** 页面一键录入该活动，提高流失客单的挽回率。`;
        }
      } else if (prompt.includes('sale') || prompt.includes('performance') || prompt.includes('revenue') || prompt.includes('stats') || prompt.includes('shuju')) {
        if (!aiCaps.analyticsAudit) {
          reply = toneBadge + `⚠️ 对不起，根据您在商铺大脑设置的特权限制，财务与利息成本账目自动审计功能当前已被关闭。`;
        } else {
          reply = toneBadge + `### 当前分店近期数据分析简报
* **全店综合转化率**: 2.8% (高出同品类奢侈店平均 1.5% 的行业参考线)
* **最热卖爆款单品**: *手工复古植鞣皮夹* (单价 €49.00) 占到近期成交流水的 35%。
* **未妥投待出库单**: **4 笔未发货单** 涉及总体待交付款项 €580.00。

需要我为您推荐一组针对 *放弃结账* 部分顾客（预估待召回流水余额 ~€141.60）的自动化挽单邮件催付模版吗？`;
        }
      } else {
        reply = toneBadge + `### 您好！我是您的智能商铺管家 Sidekick。
我已经为您激活并实时应用了您设定的 **「${tonePresetLabel}」** 品牌对话人设。

${aiGuidelines ? `*当前已注入并践行您指定的特定商户法则：*\n> "${aiGuidelines}"` : ''}

目前我可以协助您打通并处理以下业务闭环：
* 📦 **低库存状态分析**: 询问 *"哪些商品目前的库存偏低？"*
* ✍️ **商品文案提亮润色**: 询问 *"帮我为一款亚麻帽衫写一段商品描述"*
* 🏷️ **促销折扣方案制定**: 询问 *"有什么适合老顾客召回的优惠券方案？"*
* 📊 **店铺财务流水审计**: 询问 *"我们店铺最近的销售指标怎么样？"*

今天有什么关于 Atelier Noir 官方旗舰店的业务需要我协同处理？`;
      }

      return res.json({ text: reply, mode: 'fallback' });
    }

    // 2. Real Gemini SDK Call
    console.log('Gemini API key is defined. Making real API call.');
    
    // Map history to parts if present, or just pass prompt directly with system instruction
    const chatContents = history?.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    })) || [];

    // Push current message
    chatContents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: chatContents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2,
      }
    });

    const text = response.text || 'No response generated.';
    return res.json({ text, mode: 'gemini' });

  } catch (error: any) {
    console.error('Error in Sidekick API handler:', error);
    return res.status(500).json({ error: error.message || 'An unexpected failure occurred while querying the assistant.' });
  }
});

// Configure Vite or Static File Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}

startServer();
