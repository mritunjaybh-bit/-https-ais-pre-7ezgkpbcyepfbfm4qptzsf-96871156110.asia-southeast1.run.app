import { Request, Response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

interface ChatMessage {
  role: 'user' | 'model' | 'assistant';
  content: string;
}

const CATALOG_SUMMARY = `
We are "Cà Phê Vietnam" - Direct-Trade Vietnamese Specialty Coffee Roastery.
Catalog Products:
1. "saigon-artisan-dark-chocolate-cacao-powder" - Saigon Artisan Chocolate & Dark Cacao Phin Powder (₹410). Fine Robusta roasted with Mekong single-origin dark cacao nibs & French butter. Rich fudge and cocoa notes.
2. "saigon-dark-chocolate-mocha-instant-box" - Saigon 3-in-1 Dark Chocolate Mocha Instant Sachets (₹360). 20 instant sachets of micro-ground Robusta with Bến Tre dark chocolate and creamy milk.
3. "hanoi-egg-coffee-heritage-ground-powder" - Hà Nội Heritage Egg Custard Coffee Powder (₹390). Smoky, dark roast master blend with chicory & raw cocoa butter designed for traditional whipped egg yolk custard.
4. "hanoi-instant-egg-crema-latte-box" - Hà Nội 3-in-1 Golden Egg Crema Instant Sachets (₹375). Instant creamy tiramisu-like egg foam coffee.
5. "ben-tre-toasted-coconut-phin-powder" - Bến Tre Toasted Coconut Phin Drip Powder (₹425). Roasted with freshly grated toasted coconut and natural coconut cream extract.
6. "ben-tre-coconut-instant-latte-box" - Bến Tre 3-in-1 Toasted Coconut Cream Instant (₹365). Instant tropical iced coconut coffee latte.
7. "da-lat-salted-caramel-phin-powder" - Đà Lạt Butter-Caramel & Fleur de Sel Coffee Powder (₹415). Slow caramelized brown sugar and Vietnamese sea salt.
8. "hue-royal-lotus-scented-coffee-powder" - Huế Imperial Lotus-Scented Blossom Coffee Powder (₹450). Rare Arabica infused with night-blooming lotus blossoms. Floral, refined.
9. "buon-ma-thuot-peaberry-robusta-cui" - Buôn Ma Thuột Peaberry (Culi) Robusta Powder (₹380). Ultra-strong, 5/5 caffeine, volcanic basalt soil, intense dark chocolate, malt & tobacco notes.
10. "da-lat-langbiang-typica-arabica-powder" - Đà Lạt Lang Biang Highland Typica Arabica (₹460). 1,550m altitude, smooth, washed, sweet citrus blossom & honey notes. Mild 2.5/5 strength.
11. "culi-highland-dark-roast-powder" - Culi Highland Signature Dark Butter Roast (₹350). Traditional Saigon street cafe roast with clarified French butter. Perfect for everyday Cà Phê Sữa Đá.
12. "vietnam-g7-style-gold-instant-jar" - Saigon Gold Micro-Ground Pure Black Freeze-Dried Instant Jar (₹340). 100g 100% pure freeze-dried Robusta crystals, unsweetened, bold crema.
13. "authentic-gravity-phin-filter-set" - Traditional Vietnamese Stainless Steel Gravity Phin Filter (₹290). Classic brewing hardware for slow-drip coffee over condensed milk.
`;

function fallbackSommelier(userText: string): { reply: string; recommendedProductIds: string[] } {
  const text = userText.toLowerCase();

  // Hazelnut substitution
  if (text.includes('hazelnut') || text.includes('nutty')) {
    return {
      reply: "We don't have Hazelnut yet, but you might love our **Đà Lạt Salted Butter-Caramel** or our **Saigon Artisan Chocolate Phin Powder**, which is slow-roasted with French clarified butter and Bến Tre cacao nibs that impart natural toasted hazelnut notes!",
      recommendedProductIds: ['da-lat-salted-caramel-phin-powder', 'saigon-artisan-dark-chocolate-cacao-powder']
    };
  }

  // Vanilla substitution
  if (text.includes('vanilla')) {
    return {
      reply: "We don't have a standalone Vanilla roast yet, but you might love our **Hà Nội Heritage Egg Custard Coffee Powder** (rich vanilla-sabayon tiramisu notes) or our **Đà Lạt Butter-Caramel Coffee**!",
      recommendedProductIds: ['hanoi-egg-coffee-heritage-ground-powder', 'da-lat-salted-caramel-phin-powder']
    };
  }

  // Caramel preference
  if (text.includes('caramel') || text.includes('butter') || text.includes('toffee')) {
    return {
      reply: "Our **Đà Lạt Butter-Caramel & Fleur de Sel Coffee Powder** is slow-caramelized with brown sugar and Vietnamese sea salt, brewing a luscious butterscotch crema profile that melts in your mouth!",
      recommendedProductIds: ['da-lat-salted-caramel-phin-powder', 'culi-highland-dark-roast-powder']
    };
  }

  // Chocolate / Cocoa preference
  if (text.includes('choc') || text.includes('cocoa') || text.includes('fudge') || text.includes('mocha')) {
    if (text.includes('instant') || text.includes('quick') || text.includes('sachet')) {
      return {
        reply: "If you love chocolate and want instant cafe convenience, our **Saigon 3-in-1 Dark Chocolate Mocha Instant Sachets** are made with micro-ground Robusta and real Bến Tre dark cacao. For traditional Phin drip, try our **Saigon Artisan Chocolate Phin Powder**!",
        recommendedProductIds: ['saigon-dark-chocolate-mocha-instant-box', 'saigon-artisan-dark-chocolate-cacao-powder']
      };
    }
    return {
      reply: "You will love our **Saigon Artisan Chocolate & Dark Cacao Phin Powder**! Co-roasted with single-origin Bến Tre dark cacao nibs and French butter, it brews a thick, bittersweet mocha with notes of warm fudge. Here is our recommended chocolate pairing:",
      recommendedProductIds: ['saigon-artisan-dark-chocolate-cacao-powder', 'saigon-dark-chocolate-mocha-instant-box']
    };
  }

  // Egg coffee / Tiramisu
  if (text.includes('egg') || text.includes('custard') || text.includes('tiramisu') || text.includes('hanoi')) {
    return {
      reply: "Ah, the legendary Hà Nội Egg Coffee (Cà Phê Trứng)! We have the authentic recipe: our **Hà Nội Heritage Egg Custard Coffee Powder** is dark-roasted with chicory and cocoa butter to perfectly hold whipped egg sabayon. Or try our **Hà Nội 3-in-1 Golden Egg Crema** for instant whipped egg latte anytime!",
      recommendedProductIds: ['hanoi-egg-coffee-heritage-ground-powder', 'hanoi-instant-egg-crema-latte-box']
    };
  }

  // Coconut / Tropical / Sweet
  if (text.includes('coconut') || text.includes('tropical') || text.includes('cream')) {
    return {
      reply: "Nothing beats a Bến Tre coconut iced coffee! Our **Bến Tre Toasted Coconut Phin Drip Powder** combines volcanic Robusta with real toasted coconut flakes. For instant iced lattes, check out our **Bến Tre 3-in-1 Coconut Cream Instant**!",
      recommendedProductIds: ['ben-tre-toasted-coconut-phin-powder', 'ben-tre-coconut-instant-latte-box']
    };
  }

  // Strong / Bold / High Caffeine / Robusta
  if (text.includes('strong') || text.includes('bold') || text.includes('energy') || text.includes('caffeine') || text.includes('dark') || text.includes('intense')) {
    return {
      reply: "If you want pure, unfiltered Vietnamese power, our **Buôn Ma Thuột Peaberry (Culi) Robusta** packs an intense 5/5 caffeine score with deep dark chocolate and smoky hazelnut notes. Pair it with our **Stainless Steel Phin Filter** for the ultimate traditional ritual!",
      recommendedProductIds: ['buon-ma-thuot-peaberry-robusta-cui', 'culi-highland-dark-roast-powder', 'authentic-gravity-phin-filter-set']
    };
  }

  // Instant only
  if (text.includes('instant') || text.includes('sachet') || text.includes('quick') || text.includes('easy')) {
    return {
      reply: "For fast, authentic Vietnamese brews in under 10 seconds: our **Saigon Gold Micro-Ground Freeze-Dried Jar** delivers pure black volcanic crema, while our **3-in-1 Dark Chocolate Mocha** and **Golden Egg Crema** give you luscious cafe drinks anywhere!",
      recommendedProductIds: ['vietnam-g7-style-gold-instant-jar', 'saigon-dark-chocolate-mocha-instant-box', 'hanoi-instant-egg-crema-latte-box']
    };
  }

  // Phin filter / Drip
  if (text.includes('phin') || text.includes('drip') || text.includes('brew') || text.includes('condensed milk')) {
    return {
      reply: "To make authentic Cà Phê Sữa Đá (Vietnamese Iced Coffee with condensed milk), you need our **Culi Highland Signature Dark Butter Roast** and an **Authentic Stainless Steel Gravity Phin Filter**. It produces that iconic thick, slow-dripped chocolatey brew!",
      recommendedProductIds: ['culi-highland-dark-roast-powder', 'authentic-gravity-phin-filter-set', 'buon-ma-thuot-peaberry-robusta-cui']
    };
  }

  // Mild / Arabica / Fruity / Floral
  if (text.includes('mild') || text.includes('arabica') || text.includes('fruity') || text.includes('sweet') || text.includes('light')) {
    return {
      reply: "For a smoother, naturally sweeter cup with lower bitterness: our **Đà Lạt Lang Biang Highland Typica Arabica** (grown at 1,550m) boasts citrus blossom and honey notes. Or experience royal luxury with our **Huế Imperial Lotus Blossom Coffee**!",
      recommendedProductIds: ['da-lat-langbiang-typica-arabica-powder', 'hue-royal-lotus-scented-coffee-powder']
    };
  }

  // General initial recommendation
  return {
    reply: "Xin chào! To help guide your tastebuds, which of these sounds most exciting to you?\n\n1. **Classic Strong & Bold**: Intense Robusta for traditional iced coffee with condensed milk.\n2. **Artisan Flavoured**: French butter-roasted with dark cacao, toasted coconut, or egg custard.\n3. **Quick & Instant**: 3-in-1 gourmet sachets or freeze-dried black crystals.",
    recommendedProductIds: ['culi-highland-dark-roast-powder', 'saigon-artisan-dark-chocolate-cacao-powder', 'saigon-dark-chocolate-mocha-instant-box']
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
    return res.status(400).json({ error: 'Missing message parameter' });
  }

  const apiKey = (process.env.GEMINI_API_KEY || '').trim().replace(/^["']|["']$/g, '');

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    // Graceful fallback to expert sommelier heuristic engine
    const fallback = fallbackSommelier(message);
    return res.status(200).json({
      ...fallback,
      source: 'sommelier_engine'
    });
  }

  try {
    const ai = new GoogleGenAI({});

    const formattedHistory = Array.isArray(history)
      ? history.slice(-6).map((h: ChatMessage) => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }]
        }))
      : [];

    const systemInstruction = `
You are "Coffee Master", the resident Vietnamese master sommelier at "Cà Phê Vietnam".
Tone: Warm, welcoming, respectful ("Xin chào!"), knowledgeable about Vietnamese coffee traditions (Phin brewing, condensed milk, Robusta terroir in Buôn Ma Thuột, Đà Lạt Arabica, French butter roasting).
Goal: Help customers find the exact coffee products that match their personal taste preferences (caffeine strength, sweetness, ground powder for Phin vs instant sachets, flavors like dark chocolate, toasted coconut, egg custard, salted caramel, or pure single-origin).

${CATALOG_SUMMARY}

Instructions:
1. Be concise (2-4 sentences max per response).
2. Answer the user's specific questions or taste preferences.
3. Recommend 1 to 3 specific products from our catalog by their exact ID from the catalog list above.
4. Output your response as a valid JSON object with EXACTLY this structure (no markdown fences around the JSON):
{
  "reply": "Your warm friendly message to the customer...",
  "recommendedProductIds": ["id1", "id2"]
}
`;

    const contents = [
      ...formattedHistory,
      { role: 'user', parts: [{ text: message }] }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.7,
      }
    });

    const rawText = response.text || '';
    let parsed: any;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      // Clean possible markdown code fences if model wrapped them
      const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      parsed = JSON.parse(cleaned);
    }

    if (parsed && parsed.reply) {
      return res.status(200).json({
        reply: parsed.reply,
        recommendedProductIds: Array.isArray(parsed.recommendedProductIds) ? parsed.recommendedProductIds : [],
        source: 'gemini-3.8-flash'
      });
    }

    throw new Error('Invalid JSON structure returned by Gemini');
  } catch (err: any) {
    console.error('Error invoking Gemini for Coffee Master:', err?.message || err);
    const fallback = fallbackSommelier(message);
    return res.status(200).json({
      ...fallback,
      source: 'sommelier_engine_fallback'
    });
  }
}
