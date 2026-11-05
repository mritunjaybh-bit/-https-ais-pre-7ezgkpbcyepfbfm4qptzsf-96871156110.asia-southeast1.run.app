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
    publishDate: '',
    dateISO: '',
    readTime: '6 min read',
    category: 'Brewing Guides',
    featuredImage: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'The stainless steel Phin filter: gravity drip brewing over a layer of sweetened condensed milk.',
    author: {
      name: 'Cà Phê Editorial',
      role: 'Vietnamese Coffee Tradition',
      avatar: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=200&q=80',
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
    publishDate: '',
    dateISO: '',
    readTime: '5 min read',
    category: 'Coffee Knowledge',
    featuredImage: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Dark roasted Vietnamese Robusta beans compared to standard western drip coffee.',
    author: {
      name: 'Cà Phê Editorial',
      role: 'Vietnamese Coffee Tradition',
      avatar: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=200&q=80',
    },
    metaTitle: 'Vietnamese Coffee vs Regular Coffee: What Makes It Different?',
    metaDescription: 'Discover what sets Vietnamese coffee apart: potent Robusta beans, traditional butter-roast profiles, Phin slow gravity extraction, and sweet condensed milk.',
    tags: ['Robusta', 'Coffee Beans', 'Roasting', 'Condensed Milk', 'Coffee Tradition'],
    content: [
      {
        type: 'paragraph',
        text: 'Anyone who has taken their very first sip of authentic Vietnamese coffee will tell you the same thing: it is not simply coffee with a bit of milk. It is an entirely distinct sensory category. Thick, viscous, intensely aromatic, and delivering an unmistakable character, Vietnamese coffee differs from western drip coffee, espresso, or pour-overs in almost every foundational metric.',
      },
      {
        type: 'heading',
        level: 2,
        text: '1. The Bean Species: Robusta Tradition',
      },
      {
        type: 'paragraph',
        text: 'While the western third-wave specialty movement has historically centered around Arabica beans, Vietnam is the world’s leading producer of Coffea canephora (Robusta). The vast majority of Vietnam’s coffee harvest consists of Robusta.',
      },
      {
        type: 'list',
        ordered: false,
        items: [
          'High Intensity: Robusta contains naturally higher caffeine density than standard Arabica beans, giving it a commanding bold character.',
          'Lower Acidity: Robusta is known for low perceived acidity, delivering deep, earthy, dark chocolate, and smoky notes.',
          'Rich Body & Viscosity: Robusta possesses natural body and soluble solids, resulting in a notably heavier, velvety mouthfeel.',
        ],
      },
      {
        type: 'heading',
        level: 2,
        text: '2. The Roasting Craft: The Heritage "Bơ" Roast',
      },
      {
        type: 'paragraph',
        text: 'Traditional western coffee roasters emphasize light or medium roast curves to preserve floral acidity. In Vietnam, traditional roasters developed a technique known as "Rang Bơ" (butter roasting).',
      },
      {
        type: 'paragraph',
        text: 'During roasting, small amounts of clarified butter, caramelized sugar, or cacao liquor were traditionally introduced to coat the beans. This imparts an aroma of dark cocoa, toasted nuts, and warm caramel, complementing the natural strength of Robusta.',
      },
      {
        type: 'callout',
        title: 'Did You Know?',
        text: 'Because Robusta produces high dissolved solids, it does not taste watered-down when poured over melting ice. It holds its bold profile from the first sip to the last drop.',
      },
      {
        type: 'heading',
        level: 2,
        text: '3. Extraction Method: Gravity Phin vs. Pressurized Steam',
      },
      {
        type: 'paragraph',
        text: 'Unlike espresso (which forces boiling water through compacted coffee at high pressure in 25 seconds) or paper drip (which absorbs essential oils), the Vietnamese Phin operates by gentle gravity over 4 to 5 minutes.',
      },
      {
        type: 'paragraph',
        text: 'The micro-perforated metal damper allows all natural coffee oils to pass directly into your cup, producing a brew with concentration and a smooth finish.',
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
        text: 'The thick consistency and caramelized profile of condensed milk are uniquely suited to Robusta. Its sweetness balances the dark coffee notes, creating an iconic dessert-like cup.',
      },
      {
        type: 'quote',
        text: 'Robusta commands attention. When paired with condensed milk, it is pure culinary harmony.',
        author: 'Vietnamese Tradition',
      },
    ],
  },
  {
    id: 'history-of-ca-phe-sua-da-vietnamese-iced-coffee',
    slug: 'history-of-ca-phe-sua-da-vietnamese-iced-coffee',
    title: 'The History of Cà Phê Sữa Đá (Vietnamese Iced Coffee)',
    excerpt: 'Explore how French colonial roots, tropical innovation, and dairy scarcity sparked the legendary invention of Vietnam’s iconic iced milk coffee.',
    publishDate: '',
    dateISO: '',
    readTime: '7 min read',
    category: 'Heritage & Culture',
    featuredImage: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'A morning café scene in Vietnam with iced coffee and condensed milk glasses.',
    author: {
      name: 'Cà Phê Editorial',
      role: 'Vietnamese Coffee Tradition',
      avatar: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=200&q=80',
    },
    metaTitle: "The History of Cà Phê Sữa Đá: Vietnam's Iconic Iced Milk Coffee",
    metaDescription: "From early coffee introduction to vibrant street cafés, uncover the story behind Vietnam's beloved Cà Phê Sữa Đá.",
    tags: ['History', 'Vietnamese Coffee', 'Cà Phê Sữa Đá', 'Heritage', 'Origins'],
    content: [
      {
        type: 'paragraph',
        text: 'Walk through the sun-drenched alleys of Vietnamese cities on any given morning, and the rhythmic percussion of spoons clinking against tall glasses filled with ice will greet you. This is Cà Phê Sữa Đá: the national heartbeat of Vietnam.',
      },
      {
        type: 'heading',
        level: 2,
        text: 'The Introduction of Coffee to Vietnam',
      },
      {
        type: 'paragraph',
        text: 'Coffee was introduced to Vietnam in the mid-19th century. While early attempts focused on delicate varieties, botanists and growers soon found that the climate and geography of the inland plateaus were uniquely suited for hearty Robusta.',
      },
      {
        type: 'paragraph',
        text: 'The warm tropical climate and distinct seasons established the region as an ideal home for resilient Robusta (Coffea canephora).',
      },
      {
        type: 'heading',
        level: 2,
        text: 'The Dairy Scarcity & Condensed Milk Tradition',
      },
      {
        type: 'paragraph',
        text: 'Early European coffee traditions often relied on fresh dairy. However, in tropical climates prior to widespread refrigeration, fresh dairy was difficult to store. This prompted the widespread adoption of canned sweetened condensed milk (Sữa đặc).',
      },
      {
        type: 'paragraph',
        text: 'Because water is removed and sugar acts as a natural stabilizer, condensed milk remained shelf-stable for long journeys and humid environments without spoiling.',
      },
      {
        type: 'callout',
        title: 'A Natural Pairing',
        text: 'What began as practical ingenuity became a celebrated pairing. The thick, caramelized sweetness of condensed milk balances the bold intensity of Robusta.',
      },
      {
        type: 'heading',
        level: 2,
        text: 'Development of the Vietnamese Coffee Industry',
      },
      {
        type: 'paragraph',
        text: 'Over recent decades, focused agricultural development transformed Vietnam into the world’s second-largest coffee producer and the undisputed leader in Robusta production.',
      },
      {
        type: 'paragraph',
        text: 'Smallholder farming communities across the coffee-growing regions became the foundation of an expansive coffee economy.',
      },
      {
        type: 'heading',
        level: 2,
        text: 'Sidewalk Cafés (Cà Phê Bệt) & The Modern Ritual',
      },
      {
        type: 'paragraph',
        text: 'In modern Vietnam, coffee is far more than a morning beverage — it is a vibrant social tradition. "Đi cà phê" (let’s go for coffee) is an invitation to converse, slow down, and enjoy time with companions.',
      },
      {
        type: 'paragraph',
        text: 'From traditional sidewalk stalls to contemporary specialty cafés, Cà Phê Sữa Đá remains a timeless bridge connecting Vietnam’s coffee heritage with enthusiasts around the world.',
      },
      {
        type: 'quote',
        text: 'To drink Cà Phê Sữa Đá is to drink Vietnam’s coffee story: inventive, deeply rich, and balanced.',
        author: 'Cà Phê Editorial',
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
