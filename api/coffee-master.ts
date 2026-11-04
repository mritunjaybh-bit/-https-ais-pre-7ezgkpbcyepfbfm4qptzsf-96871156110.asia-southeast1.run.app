import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

interface ChatMessage {
  role: 'user' | 'model' | 'assistant';
  content: string;
}

const CATALOG_SUMMARY = `
We are "Cà Phê" - A premium Vietnamese-origin coffee brand, being developed for the Indian market. Launching soon.
Planned Range (All Coming Soon - Join the Waitlist):
1. "vietnamese-3in1-instant-coffee" - Vietnamese 3-in-1 Instant Coffee. A convenient instant coffee format blending Vietnamese coffee with creamer and sweetness.
2. "pure-vietnamese-instant-black-coffee" - Pure Vietnamese Instant Black Coffee. A straightforward coffee-led option with bold dark roast notes.
3. "coconut-coffee" - Coconut Coffee. A distinctive flavour direction pairing coffee with tropical toasted coconut.
4. "chocolate-coffee" - Chocolate Coffee. A familiar flavour paired with Vietnamese coffee, featuring rich dark cocoa notes.
5. "iced-mocha" - Iced Mocha. Additional varieties are being assessed, offering a chilled velvety cocoa coffee finish.
`;

function fallbackSommelier(userText: string): { reply: string; recommendedProductIds: string[] } {
  const text = userText.toLowerCase();

  // Coconut
  if (text.includes('coconut') || text.includes('tropical')) {
    return {
      reply: "Xin chào! For a distinctive tropical direction, our **Coconut Coffee** brings velvety coconut sweetness paired with Vietnamese coffee. We invite you to join the waitlist for our upcoming Indian release!",
      recommendedProductIds: ['coconut-coffee']
    };
  }

  // Chocolate / Mocha
  if (text.includes('choc') || text.includes('cocoa') || text.includes('fudge') || text.includes('mocha')) {
    if (text.includes('iced') || text.includes('cold')) {
      return {
        reply: "Xin chào! For a refreshing chocolate profile, our **Iced Mocha** delivers chilled dark cacao with smooth coffee notes. You can join our waitlist for first access at launch!",
        recommendedProductIds: ['iced-mocha', 'chocolate-coffee']
      };
    }
    return {
      reply: "Xin chào! If you love deep cocoa flavours, our **Chocolate Coffee** pairs familiar bittersweet dark chocolate with bold Vietnamese coffee. Join the waitlist for priority launch allocation!",
      recommendedProductIds: ['chocolate-coffee', 'iced-mocha']
    };
  }

  // Black / Bold / Strong
  if (text.includes('black') || text.includes('strong') || text.includes('bold') || text.includes('unsweetened') || text.includes('pure')) {
    return {
      reply: "Xin chào! For an intense, straightforward cup, our **Pure Vietnamese Instant Black Coffee** delivers a bold dark roast profile with zero added sugar. Join the launch waitlist today!",
      recommendedProductIds: ['pure-vietnamese-instant-black-coffee']
    };
  }

  // Sweet / Creamy / 3-in-1 / Classic
  if (text.includes('sweet') || text.includes('milk') || text.includes('creamy') || text.includes('3-in-1') || text.includes('convenient') || text.includes('classic')) {
    return {
      reply: "Xin chào! Our **Vietnamese 3-in-1 Instant Coffee** provides the quintessential sweet, creamy Vietnamese coffee experience in a convenient instant format. Join the waitlist to receive our launch invitation!",
      recommendedProductIds: ['vietnamese-3in1-instant-coffee']
    };
  }

  // General recommendation
  return {
    reply: "Xin chào! We are developing a premium Vietnamese-origin coffee brand for India. Are you looking for something bold & black, classic sweet 3-in-1, or distinctive flavours like Coconut, Chocolate, or Iced Mocha? Join our waitlist to be first to try them at launch!",
    recommendedProductIds: ['vietnamese-3in1-instant-coffee', 'pure-vietnamese-instant-black-coffee', 'coconut-coffee']
  };
}

export default async function handler(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history } = req.body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required.' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';

  if (!apiKey) {
    const fallback = fallbackSommelier(message);
    return res.status(200).json({
      reply: fallback.reply,
      recommendedProductIds: fallback.recommendedProductIds,
      fallback: true
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
You are the Cà Phê Master & Taste Sommelier for "Cà Phê" - a premium Vietnamese-origin coffee brand, being developed for the Indian market. Launching soon.

STRICT RULES:
1. ONLY recommend products from our planned 5 items:
   - "vietnamese-3in1-instant-coffee": Vietnamese 3-in-1 Instant Coffee (A convenient instant coffee format)
   - "pure-vietnamese-instant-black-coffee": Pure Vietnamese Instant Black Coffee (A straightforward coffee-led option)
   - "coconut-coffee": Coconut Coffee (A distinctive flavour direction)
   - "chocolate-coffee": Chocolate Coffee (A familiar flavour paired with Vietnamese coffee)
   - "iced-mocha": Iced Mocha (Additional varieties are being assessed)
2. All products are currently "Coming soon" with prices to be confirmed at launch. Do NOT invent prices or stock.
3. Every recommendation should conclude by warmly inviting the customer to "Join the waitlist".
4. Prohibited claims: Do not make claims of single source origins, farm trade pledges, nitrogen sealing, valve packaging, express courier transit guarantees, free shipping thresholds, roasting dates, or specific municipal/provincial growing territories. Strictly adhere to approved phrasing: "A premium Vietnamese-origin coffee brand, being developed for the Indian market. Launching soon."
5. At the end of your response, output a JSON array of recommended product IDs on a separate line formatted as:
   [RECOMMENDED_IDS: id1, id2]

Tone: Warm, courteous ("Xin chào!"), refined luxury coffee house, helpful, concise.
`;

    const chatHistory = Array.isArray(history) ? history.slice(-6) : [];
    const contents: any[] = [];

    for (const msg of chatHistory) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    });

    const text = response.text || '';
    let reply = text;
    let recommendedProductIds: string[] = [];

    const recMatch = text.match(/\[RECOMMENDED_IDS:\s*([^\]]+)\]/i);
    if (recMatch && recMatch[1]) {
      recommendedProductIds = recMatch[1]
        .split(',')
        .map((s) => s.trim().replace(/['"]/g, ''))
        .filter((id) =>
          [
            'vietnamese-3in1-instant-coffee',
            'pure-vietnamese-instant-black-coffee',
            'coconut-coffee',
            'chocolate-coffee',
            'iced-mocha'
          ].includes(id)
        );
      reply = text.replace(/\[RECOMMENDED_IDS:[^\]]+\]/i, '').trim();
    }

    if (recommendedProductIds.length === 0) {
      const fb = fallbackSommelier(message);
      recommendedProductIds = fb.recommendedProductIds;
    }

    return res.status(200).json({
      reply,
      recommendedProductIds,
      success: true
    });
  } catch (err: any) {
    console.warn('[CoffeeMaster] Gemini API error, using luxury fallback:', err?.message || err);
    const fallback = fallbackSommelier(message);
    return res.status(200).json({
      reply: fallback.reply,
      recommendedProductIds: fallback.recommendedProductIds,
      fallback: true
    });
  }
}
