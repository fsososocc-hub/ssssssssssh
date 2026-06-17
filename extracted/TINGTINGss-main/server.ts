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
      Your tone is elegant, objective, expert, and efficient. Avoid excessive punctuation, sales pitch hype, unnecessary pleasantries or robotic apologies.
      You help the merchant manage their inventory, analyze sales, draft beautiful minimalist product descriptions, generate discount coupon strategies, suggest segment targets, and troubleshoot setups.

      Current store environment details:
      Active Currency: € (EUR)
      Store Name: Atelier Noir
      
      Current Products:
      ${productsInfo}
      
      Recent Orders:
      ${ordersInfo}
      
      Active Discount Campaigns:
      ${discountsInfo}

      Keep replies concise, clear, and perfectly formatted in standard Markdown. Use bold headers for key terms.
      If the merchant asks you to write descriptions, write sophisticated, quiet-luxury-style copies. 
      If they ask to configure a discount or find low stock, refer to the actual data above.
      For example, the Ceramic Pour-Over Dripper only has 3 items left which is low stock!
      If they ask to do something that relates to store modification, provide the concrete Markdown suggestion and explicitly explain how they can apply it.`;

    // 1. If key is missing, run high-quality local response engine
    if (!ai) {
      console.log('Gemini API key is missing. Using intelligent mock response engine.');
      let reply = '';
      const prompt = message.toLowerCase();

      if (prompt.includes('low') || prompt.includes('stock') || prompt.includes('inventory') || prompt.includes('kucun')) {
        reply = `### ⚠️ Low Inventory Alert
Based on your real-time store levels:
1. **Ceramic Pour-Over Coffee Brewer** (SKU: \`MC-DRP-CHR\`) is critically low with only **3 units** left in inventory (2 at Main Warehouse, 1 at Berlin Outlet).

**Suggested actions:**
* Click the **Adjust** button next to Ceramic Pour-Over Coffee Brewer to replenish local counts.
* Or create a **Purchase Order** to restock from Mono Ceramics.`;
      } else if (prompt.includes('description') || prompt.includes('draft') || prompt.includes('copywrite') || prompt.includes('miaoshu') || prompt.includes('wenan')) {
        reply = `### Crafted Product Copy: Premium Linen Linen Loungewear
Here is a sophisticated, quiet-luxury-style description for your upcoming collection:

> *"Constructed from centuries-old Belgian flax weaves, our linen loungewear balances structure with ease. Designed with a generous silhouette that relaxes over time, the organic construction keeps it breathable in ambient heat and insulating in cooler drafts. A quiet statement for the home studio."*

**Fittings for your Metadata:**
* **Tags**: \`sustainable\`, \`linen\`, \`quiet-luxury\`, \`lounge\`
* **Recommended Price**: €79.00`;
      } else if (prompt.includes('discount') || prompt.includes('coupon') || prompt.includes('promotion') || prompt.includes('sconti') || prompt.includes('zhekou')) {
        reply = `### Proposed Coupon Strategy: FESTIVE15
To capture mid-season shoppers, here is a recommended discount structure:

* **Coupon Code**: \`FESTIVE15\`
* **Type**: Percentage discount (**15% OFF** entire catalog)
* **Minimum Requirement**: Spend at least €50.00
* **Target Segment**: *Abandoned Checkout* customers and *Returning* buyers.

You can click **Create Discount** in the Discounts menu to put this active immediately in Atelier Noir.`;
      } else if (prompt.includes('sale') || prompt.includes('performance') || prompt.includes('revenue') || prompt.includes('stats') || prompt.includes('shuju')) {
        reply = `### Store Performance Summary
* **Total Conversion Rate**: 2.8% (above industry benchmark of 1.5%)
* **Top Selling Item**: *Minimalist Leather Pocket Wallet* (€49.00) forming 35% of recent sales.
* **Open Orders**: **4 unfulfilled transactions** representing €580.00 in outstanding shipments.

Would you like me to recommend a targeted email automate sequence to capture the *Abandoned Checkout* customer segment (~€141.60 in recoverable carts)?`;
      } else {
        reply = `### Hello! I am Sidekick, your Store Assistant.
I am running in **Preview Mode**. To unlock real-time Gemini language generation, feel free to configure your **GEMINI_API_KEY** in the **Settings > Secrets** panel!

Currently, I can assist you with:
* 📦 **Low stock alerts**: Ask *"What items are low in stock?"*
* ✍️ **Product Copywriting**: Ask *"Draft an elegant description for a shirt"*
* 🏷️ **Campaign Ideas**: Ask *"Explain a good discount strategy"*
* 📊 **Store Analytics**: Ask *"How is my store performing?"*

How can I help you support Atelier Noir today?`;
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
