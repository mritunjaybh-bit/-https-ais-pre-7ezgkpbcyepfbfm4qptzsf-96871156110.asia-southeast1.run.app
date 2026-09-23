import { BlogPost } from '../types';

/**
 * ============================================================================
 * CÀ PHÊ VIETNAM - JOURNAL & BLOG POSTS DATABASE
 * ============================================================================
 * 
 * HOW TO ADD A NEW BLOG POST:
 * 1. Duplicate one of the post objects in the BLOG_POSTS array below.
 * 2. Give it a unique `id` and URL-friendly `slug` (e.g. 'my-new-coffee-guide').
 * 3. Update `title`, `excerpt`, `publishDate`, `dateISO`, and `readTime`.
 * 4. Fill in `metaTitle` (30-60 chars) and `metaDescription` (120-160 chars) for search engines.
 * 5. Add structured `content` blocks (headings, paragraphs, images, quotes, callouts, lists).
 * 6. Save this file — the post will automatically appear in the Journal listing and at /blog/:slug!
 */

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'how-to-brew-vietnamese-phin-coffee',
    slug: 'how-to-brew-vietnamese-phin-coffee',
    title: 'How to Brew Vietnamese Phin Coffee: A Step-by-Step Guide',
    excerpt: 'Master the meditative art of the traditional Vietnamese Phin gravity filter with our authentic slow-drip technique, grind advice, and condensed milk layering secrets.',
    publishDate: 'September 18, 2024',
    dateISO: '2024-09-18T09:00:00Z',
    readTime: '6 min read',
    category: 'Brewing Guides',
    featuredImage: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'The stainless steel Phin filter: gravity drip brewing over a layer of sweetened condensed milk.',
    author: {
      name: 'Nguyễn Văn Minh',
      role: 'Head Roaster & Phin Specialist',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
    metaTitle: 'How to Brew Vietnamese Phin Coffee: Step-by-Step Guide | Cà Phê',
    metaDescription: 'Learn how to brew authentic Vietnamese Phin coffee at home. Master the slow-drip gravity filter, grind size, coffee-to-water ratio, and condensed milk layering.',
    tags: ['Phin Filter', 'Brew Guide', 'Cà Phê Sữa Đá', 'Home Barista', 'Robusta'],
    content: [
      {
        type: 'paragraph',
        text: 'In an era dominated by rapid espresso machines and high-tech pour-over kettles, the traditional Vietnamese Phin (phin cà phê) stands as a testament to patience, mindfulness, and sensory satisfaction. Dating back to the 19th century, this compact metal dripper requires zero paper filters, zero electricity, and no fragile glassware. Instead, it relies on simple physics: gravity, water pressure, and a micro-perforated damper plate.',
      },
      {
        type: 'heading',
        level: 2,
        text: 'Anatomy of a Vietnamese Phin Filter',
      },
      {
        type: 'paragraph',
        text: 'Before brewing your first cup, it helps to understand the four stainless steel components that work in harmony inside the Phin:',
      },
      {
        type: 'list',
        ordered: true,
        items: [
          'The Base Plate (Đĩa phin): Sits securely atop your drinking glass or ceramic mug to collect the dripping extract.',
          'The Brewing Chamber (Thân phin): Holds the coffee grounds and hot water reservoir.',
          'The Gravity Damper / Press (Gài phin): A perforated internal disc placed directly onto the dry grounds to gently compress them and ensure even water saturation.',
          'The Lid (Nắp phin): Retains steaming heat during extraction and later flips upside-down to serve as a drip tray for the spent chamber.',
        ],
      },
      {
        type: 'heading',
        level: 2,
        text: 'Essential Ingredients & Brewing Ratios',
      },
      {
        type: 'paragraph',
        text: 'Because Vietnamese coffee is brewed strong and concentrated (comparable in density to a double espresso), getting the coffee-to-water ratio right is crucial for proper extraction.',
      },
      {
        type: 'list',
        ordered: false,
        items: [
          'Coffee Powder: 20 to 25 grams of coarse-ground Robusta or Robusta-Arabica blend (similar in texture to coarse sea salt or raw demerara sugar).',
          'Hot Water: 100 to 120 ml of fresh, filtered water heated to 93°C–96°C (just off the boil).',
          'Sweetened Condensed Milk: 1.5 to 2 tablespoons (approx. 25–30 ml) spooned into the bottom of the glass.',
          'Ice: Large, dense ice cubes if serving as Cà Phê Sữa Đá.',
        ],
      },
      {
        type: 'callout',
        title: 'Grind Size Is Everything',
        text: 'If your grind is too fine (like espresso), the damper holes will clog and water will pool without dripping. If it is too coarse (like French press), water will gush through in under 90 seconds without extracting the deep cacao and caramelized notes. Aim for a gritty, coarse sand texture.',
      },
      {
        type: 'heading',
        level: 2,
        text: 'Step-by-Step Brewing Instructions',
      },
      {
        type: 'heading',
        level: 3,
        text: 'Step 1: Prep Your Glass & Condensed Milk',
      },
      {
        type: 'paragraph',
        text: 'If you enjoy your coffee sweet and creamy, spoon 1.5 to 2 tablespoons of condensed milk into the bottom of a transparent heat-proof glass. For black coffee (Cà Phê Đen), simply preheat your glass with a splash of hot water.',
      },
      {
        type: 'heading',
        level: 3,
        text: 'Step 2: Add Coffee & Settle the Bed',
      },
      {
        type: 'paragraph',
        text: 'Assemble the Phin base plate and chamber onto the glass. Add 20–25g of ground coffee. Gently shake the chamber side to side to distribute the bed evenly. Place the gravity damper inside and press down gently with your finger. Do not tamp hard — a gentle nudge to level the bed is all that is needed.',
      },
      {
        type: 'heading',
        level: 3,
        text: 'Step 3: The 30-Second Bloom (Ủ Cà Phê)',
      },
      {
        type: 'paragraph',
        text: 'Pour approximately 20–25 ml of hot water (just enough to submerge the damper). Place the lid on top and allow the grounds to absorb the moisture for 30 to 45 seconds. This critical blooming phase expands the coffee particles, releases carbon dioxide gas, and primes the bed for optimal flavor extraction.',
      },
      {
        type: 'heading',
        level: 3,
        text: 'Step 4: The Main Pour & Slow Drip',
      },
      {
        type: 'paragraph',
        text: 'Remove the lid, pour the remaining 80–90 ml of hot water up to the brim of the chamber, and replace the lid. Within 15 to 20 seconds, the first glistening dark drops should begin to fall steadily into the glass — roughly one drop per second. The entire dripping cycle should take between 4 and 5 minutes.',
      },
      {
        type: 'quote',
        text: 'In Vietnam, the slow dripping of the Phin is a daily ritual called "Cà phê ngồi" — sitting, slowing down, and watching time dissolve drop by drop.',
        author: 'Saigon Street Wisdom',
      },
      {
        type: 'heading',
        level: 2,
        text: 'Step 5: Stir, Chill & Savor',
      },
      {
        type: 'paragraph',
        text: 'Once the final drops subside, flip the Phin lid upside down on your counter and rest the brew chamber on top of it to catch stray droplets. Use a long spoon to stir the deep, mahogany coffee concentrate into the velvety condensed milk until it transforms into a luscious caramel-hued nectar.',
      },
      {
        type: 'paragraph',
        text: 'Drink it piping hot as Cà Phê Sữa Nóng, or pour it over a tall glass filled with ice cubes to create the world-famous Cà Phê Sữa Đá. Sip slowly and enjoy the bold, buttery symphony of dark chocolate, hazelnut, and sweet cream.',
      },
    ],
  },
  {
    id: 'vietnamese-coffee-vs-regular-coffee-what-makes-it-different',
    slug: 'vietnamese-coffee-vs-regular-coffee-what-makes-it-different',
    title: 'Vietnamese Coffee vs. Regular Coffee: What Makes It Different?',
    excerpt: 'From heavy-body Robusta beans and buttery slow-roasting traditions to sweetened condensed milk, discover why Vietnamese coffee stands in a class of its own.',
    publishDate: 'September 12, 2024',
    dateISO: '2024-09-12T10:30:00Z',
    readTime: '5 min read',
    category: 'Coffee Knowledge',
    featuredImage: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Dark roasted Vietnamese Robusta beans compared to standard western drip coffee.',
    author: {
      name: 'Lê Thu Trang',
      role: 'Coffee Agronomist & Cupping Judge',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    },
    metaTitle: 'Vietnamese Coffee vs Regular Coffee: What Makes It Different?',
    metaDescription: 'Discover what sets Vietnamese coffee apart: potent Robusta beans, traditional butter-roast profiles, Phin slow gravity extraction, and sweet condensed milk.',
    tags: ['Robusta', 'Coffee Beans', 'Roasting', 'Condensed Milk', 'Caffeine'],
    content: [
      {
        type: 'paragraph',
        text: 'Anyone who has taken their very first sip of authentic Vietnamese coffee will tell you the same thing: it is not simply coffee with a bit of milk. It is an entirely distinct sensory category. Thick, viscous, intensely aromatic, and delivering an unmistakable surge of energy, Vietnamese coffee differs from western drip coffee, espresso, or pour-overs in almost every foundational metric.',
      },
      {
        type: 'heading',
        level: 2,
        text: '1. The Bean Species: Robusta Reigns Supreme',
      },
      {
        type: 'paragraph',
        text: 'While the western third-wave specialty movement has historically centered around Arabica beans, Vietnam is the world’s undisputed superpower of Coffea canephora (Robusta). More than 95% of Vietnam’s coffee harvest from the red volcanic soil of the Central Highlands consists of Robusta.',
      },
      {
        type: 'list',
        ordered: false,
        items: [
          'Double the Caffeine: Robusta contains 2.2% to 2.7% caffeine by weight, nearly double the 1.2% to 1.5% found in standard Arabica beans.',
          'Lower Acidity & Sugar: Arabica is cherished for floral, fruity, and citrusy acidity. Robusta, by contrast, has 60% less sugar and far lower acidity, delivering deep, earthy, dark chocolate, and smoky walnut notes.',
          'Thick Crema & Viscosity: Robusta possesses higher antioxidant chlorogenic acid levels and natural lipid solids, resulting in a notably heavier, velvety mouthfeel.',
        ],
      },
      {
        type: 'heading',
        level: 2,
        text: '2. The Roasting Craft: The Heritage "Bơ" Roast',
      },
      {
        type: 'paragraph',
        text: 'Traditional western coffee roasters emphasize light or medium roast curves to preserve floral acidity. In Vietnam, centuries-old roasters in Buôn Ma Thuột perfected a technique known as "Rang Bơ" (butter roasting).',
      },
      {
        type: 'paragraph',
        text: 'During the cooling phase of roasting, small amounts of clarified butter (ghee), touch of caramelized cane sugar, or cacao liquor are delicately introduced to coat the hot beans. This imparts an unmistakable aroma of dark fudge, hazelnut praline, and warm caramel, softening the harsh astringency of natural Robusta without masking its raw potency.',
      },
      {
        type: 'callout',
        title: 'Did You Know?',
        text: 'Because Robusta produces such high natural dissolved solids, it does not taste watered-down when poured over melting ice. It holds its bold profile from the first sip to the last drop.',
      },
      {
        type: 'heading',
        level: 2,
        text: '3. Extraction Method: Gravity Phin vs. Pressurized Steam',
      },
      {
        type: 'paragraph',
        text: 'Unlike espresso (which forces boiling water through compacted coffee at 9 bars of pressure in 25 seconds) or paper drip (which absorbs essential oils), the Vietnamese Phin operates by gentle gravity over 4 to 5 minutes.',
      },
      {
        type: 'paragraph',
        text: 'The micro-perforated metal damper allows all natural coffee oils to pass directly into your cup, producing a brew with the intense concentration of espresso, but the smooth, unburnt finish of a slow infusion.',
      },
      {
        type: 'heading',
        level: 2,
        text: '4. The Sweetened Condensed Milk Harmony',
      },
      {
        type: 'paragraph',
        text: 'Standard western coffee typically relies on fresh cold cow’s milk, half-and-half, or oat milk. In tropical Vietnam, fresh milk spoiled rapidly in the early 20th century, prompting the widespread adoption of canned sweetened condensed milk (Sữa đặc).',
      },
      {
        type: 'paragraph',
        text: 'The thick, syrupy consistency and caramelized lactose of condensed milk are uniquely suited to Robusta. Its heavy sweetness cuts straight through the bitter dark chocolate notes, creating a balanced, decadent dessert-like elixir.',
      },
      {
        type: 'quote',
        text: 'Arabica whispers, but Robusta commands attention. When paired with condensed milk, it is pure culinary alchemy.',
        author: 'Central Highlands Roasters Guild',
      },
    ],
  },
  {
    id: 'history-of-ca-phe-sua-da-vietnamese-iced-coffee',
    slug: 'history-of-ca-phe-sua-da-vietnamese-iced-coffee',
    title: 'The History of Cà Phê Sữa Đá (Vietnamese Iced Coffee)',
    excerpt: 'Explore how French colonial roots, tropical innovation, and dairy scarcity sparked the legendary invention of Vietnam’s iconic iced milk coffee.',
    publishDate: 'September 04, 2024',
    dateISO: '2024-09-04T08:00:00Z',
    readTime: '7 min read',
    category: 'Heritage & Culture',
    featuredImage: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'A bustling morning café in Saigon with iced coffee and condensed milk glasses.',
    author: {
      name: 'Đặng Quốc Bảo',
      role: 'Cultural Historian & Specialty Coffee Archivist',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
    metaTitle: "The History of Cà Phê Sữa Đá: Vietnam's Iconic Iced Milk Coffee",
    metaDescription: "From French Catholic missionaries in 1857 to Saigon's bustling street carts, uncover the fascinating story behind Vietnam's beloved Cà Phê Sữa Đá.",
    tags: ['History', 'Saigon Culture', 'Cà Phê Sữa Đá', 'Heritage', 'Origins'],
    content: [
      {
        type: 'paragraph',
        text: 'Walk through the sun-drenched alleys of Ho Chi Minh City at 7:00 AM on any given morning, and the rhythmic percussion of stainless steel spoons clinking against tall glass tumblers filled with crushed ice will greet you. This is Cà Phê Sữa Đá: the national heartbeat of Vietnam. But how did an ancient Southeast Asian culture become synonymous with one of the most celebrated iced coffee beverages on the planet?',
      },
      {
        type: 'heading',
        level: 2,
        text: '1857: The First Coffee Seedlings Land in Tonkin',
      },
      {
        type: 'paragraph',
        text: 'Coffee was first introduced to Vietnam in 1857 by a French Catholic priest who carried single Arabica seedlings from the Bourbon islands into northern Vietnam (Tonkin). Initially, coffee remained an aristocratic luxury reserved for French colonial administrators and expatriates who yearned for Parisian salon culture.',
      },
      {
        type: 'paragraph',
        text: 'However, Arabica struggled in the humid lowlands, succumbing to coffee leaf rust. It was not until colonial botanists explored the Central Highlands — specifically the plateau of Buôn Ma Thuột in Đắk Lắk province — that they struck gold. The high elevation (500–800m), rich red basaltic volcanic soils, and distinct dry/monsoon seasons made the region one of the finest natural ecosystems on earth for resilient Robusta (Coffea canephora).',
      },
      {
        type: 'heading',
        level: 2,
        text: 'The Dairy Dilemma & The Canned Milk Miracle',
      },
      {
        type: 'paragraph',
        text: 'The French brought with them a deep habit for café au lait — hot drip coffee mellowed with generous pours of fresh whole milk. However, in 19th-century Indochina, dairy farming was practically non-existent. The tropical humidity caused raw milk to curdle within hours, and electric refrigeration was decades away.',
      },
      {
        type: 'paragraph',
        text: 'The breakthrough arrived with the introduction of canned sweetened condensed milk by western merchant trading ships. Because water had been removed and high levels of natural sugar acted as a preservative, condensed milk stayed shelf-stable for months in humid climates without spoiling.',
      },
      {
        type: 'callout',
        title: 'Culinary Serendipity',
        text: 'What began as a logistical compromise soon became a stroke of culinary genius. While regular milk was too thin to balance Vietnam’s intensely bitter Robusta, the heavy, sweet, caramel-like density of condensed milk complemented the roast with perfection.',
      },
      {
        type: 'heading',
        level: 2,
        text: 'The Post-War Economic Miracle: Đổi Mới in 1986',
      },
      {
        type: 'paragraph',
        text: 'Following decades of conflict, Vietnam was struggling economically. In 1986, the government instituted sweeping economic reforms known as "Đổi Mới" (Restoration/Renovation), focusing agricultural development on the Central Highlands. Smallholder family farmers were granted rights to cultivate land, and coffee production exploded exponentially.',
      },
      {
        type: 'paragraph',
        text: 'Within two decades, Vietnam surged to become the #2 coffee producer globally (second only to Brazil) and the undisputed #1 producer of Robusta coffee worldwide, lifting hundreds of thousands of farming households out of poverty.',
      },
      {
        type: 'heading',
        level: 2,
        text: 'Sidewalk Cafés (Cà Phê Bệt) & The Modern Ritual',
      },
      {
        type: 'paragraph',
        text: 'In modern Vietnam, coffee is far more than a morning stimulant — it is a vibrant social canvas. "Đi cà phê" (let’s go for coffee) in Vietnamese culture is an invitation to converse, slow down, debate, conduct business, or simply watch the city hum by on low plastic stools.',
      },
      {
        type: 'paragraph',
        text: 'From traditional sidewalk stalls to sleek specialty roasters in Hanoi and Saigon, Cà Phê Sữa Đá remains the timeless bridge connecting Vietnam’s rich agricultural heritage with coffee lovers around the world.',
      },
      {
        type: 'quote',
        text: 'To drink Cà Phê Sữa Đá is to drink Vietnam’s history: resilient, inventive, deeply rich, and endlessly sweet.',
        author: 'Đặng Quốc Bảo',
      },
    ],
  },
];

/**
 * Helper to fetch a blog post by its URL-friendly slug
 */
export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  if (!slug) return undefined;
  const cleanSlug = slug.toLowerCase().trim();
  return BLOG_POSTS.find((p) => p.slug.toLowerCase() === cleanSlug);
}

/**
 * Helper to fetch all blog posts
 */
export function getAllBlogPosts(): BlogPost[] {
  return [...BLOG_POSTS];
}

/**
 * Helper to fetch recent or related posts excluding the current one
 */
export function getRecentBlogPosts(excludeSlug?: string, limit: number = 2): BlogPost[] {
  return BLOG_POSTS.filter((p) => p.slug !== excludeSlug).slice(0, limit);
}
