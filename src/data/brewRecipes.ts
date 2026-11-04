import type { BrewRecipe } from '../types.ts';

export const BREW_RECIPES: Record<string, BrewRecipe> = {
  // 1. Saigon Artisan Chocolate & Dark Cacao Phin Powder
  'saigon-artisan-dark-chocolate-cacao-powder': {
    name: 'Rich Dark Chocolate Phin Mocha',
    bestFor: 'Velvety Hot Mocha or Iced Dark Chocolate Phin',
    servingTemp: 'Hot or Iced',
    prepTime: '5 Minutes',
    equipment: ['Traditional 6oz Phin Dripper', 'Heatproof Glass Tumbler', 'Stirring Spoon'],
    ingredients: [
      { item: 'Chocolate Cacao Phin Powder', quantity: '20g (approx. 2.5 rounded tablespoons)' },
      { item: 'Hot Filtered Water (94°C)', quantity: '100ml total (20ml bloom + 80ml extraction)' },
      { item: 'Sweetened Condensed Milk', quantity: '20ml – 25ml (1.5 tablespoons)' },
      { item: 'Large Solid Ice Cubes (for iced)', quantity: '4 to 5 cubes' },
    ],
    waterTemp: '94°C (201°F)',
    steps: [
      {
        stepNumber: 1,
        title: 'Condensed Milk Base',
        instruction: 'Add 20ml sweetened condensed milk directly into the bottom of your glass tumbler.',
        duration: '30s',
      },
      {
        stepNumber: 2,
        title: 'Dosing & Gravity Plate',
        instruction: 'Place the Phin saucer on the glass. Add 20g of cacao coffee powder, tap gently to level, and seat the gravity press lightly on top without packing too hard.',
        duration: '30s',
      },
      {
        stepNumber: 3,
        title: 'The Hydraulic Bloom',
        instruction: 'Pour 20ml of 94°C hot water over the press. Cover with the lid and let the roasted cacao grounds bloom and swell for 40 seconds to release natural chocolate aromatics.',
        duration: '40s',
      },
      {
        stepNumber: 4,
        title: 'Slow Extraction Drip',
        instruction: 'Remove the lid, pour the remaining 80ml hot water to the top rim. Replace lid. Let it drip slowly for 4 minutes at roughly 1 drop per second.',
        duration: '4 min',
      },
      {
        stepNumber: 5,
        title: 'Stir & Serve',
        instruction: 'Remove the Phin. Stir vigorously until the dense dark brew and condensed milk swirl into a shimmering molten mocha. Enjoy hot, or pour over rock ice.',
        duration: '30s',
      },
    ],
    baristaTip:
      'Co-roasted cacao nibs release their richest oils between 93°C and 95°C. Never use boiling water directly from a rolling boil, which can scorch the raw cacao butter.',
  },

  // 2. Saigon 3-in-1 Dark Chocolate Mocha Instant Sachets
  'saigon-dark-chocolate-mocha-instant-box': {
    name: 'Quick Iced Velvet Chocolate Frappé',
    bestFor: 'Afternoon Refreshment or Quick Dessert Latte',
    servingTemp: 'Hot or Iced',
    prepTime: '60 Seconds',
    equipment: ['Tall Glass', 'Small Whisk or Frothing Wand', 'Measuring Spoon'],
    ingredients: [
      { item: 'Dark Chocolate Mocha Sachet', quantity: '1 packet (18g) for hot, 2 packets for iced' },
      { item: 'Hot Water (85°C – 90°C)', quantity: '80ml per sachet' },
      { item: 'Fresh Whole Milk or Oat Milk', quantity: '30ml (optional for extra silkiness)' },
      { item: 'Dense Rock Ice', quantity: '1 cup (for iced version)' },
    ],
    waterTemp: '85°C – 90°C',
    steps: [
      {
        stepNumber: 1,
        title: 'Dissolve the Crystals',
        instruction: 'Empty 1 sachet into a cup. Add 80ml hot water (not boiling) to preserve the cryo-freeze Robusta crystals and cacao powder.',
        duration: '15s',
      },
      {
        stepNumber: 2,
        title: 'Froth to Micro-Foam',
        instruction: 'Stir vigorously or use a handheld frother for 15 seconds until a delicate crema forms on top.',
        duration: '15s',
      },
      {
        stepNumber: 3,
        title: 'Ice Pour (For Iced Frappé)',
        instruction: 'For an iced drink, dissolve 2 sachets in 100ml hot water, then pour immediately over a glass filled to the brim with crystal-clear ice cubes.',
        duration: '20s',
      },
    ],
    baristaTip:
      'Because these sachets contain authentic Vietnamese dark cacao, whisking with a handheld milk frother creates a luxurious chocolate head identical to a hand-pulled café mocha.',
  },

  // 3. Hà Nội Heritage Egg Custard Coffee Powder
  'hanoi-egg-coffee-heritage-ground-powder': {
    name: 'Authentic Hà Nội Cà Phê Trứng (Egg Custard Sabayon)',
    bestFor: 'Decadent Morning Luxury or Signature Dinner Dessert',
    servingTemp: 'Hot (Traditional) or Over Chilled Ice',
    prepTime: '7 Minutes',
    equipment: ['6oz Phin Dripper', 'Electric Hand Whisk / Frother', 'Heatproof Ceramic Bowl or Glass'],
    ingredients: [
      { item: 'Hà Nội Egg Custard Coffee Powder', quantity: '22g (3 level tablespoons)' },
      { item: 'Fresh Egg Yolks (Pasteurized)', quantity: '2 large egg yolks (whites separated)' },
      { item: 'Sweetened Condensed Milk', quantity: '2 tablespoons (30ml)' },
      { item: 'Vanilla Extract', quantity: '2 drops (optional)' },
      { item: 'Hot Filtered Water (95°C)', quantity: '90ml' },
    ],
    waterTemp: '95°C (203°F)',
    steps: [
      {
        stepNumber: 1,
        title: 'Start the Slow Phin Extraction',
        instruction: 'Set up your Phin with 22g of powder over a small glass. Bloom with 25ml hot water for 45s, then add 65ml hot water and let drip into a concentrated, dark liquor.',
        duration: '4 min',
      },
      {
        stepNumber: 2,
        title: 'Whip the Golden Sabayon Cream',
        instruction: 'In a separate bowl, combine the 2 egg yolks and 2 tablespoons of condensed milk. Whisk on high speed for 3 to 4 minutes until it transforms into an ultra-thick, pale ivory cloud holding soft peaks.',
        duration: '3 min',
      },
      {
        stepNumber: 3,
        title: 'Assemble the Crown',
        instruction: 'Transfer the piping hot dark coffee into a warm glass. Gently float the whipped egg foam over the surface with a spoon so it rests in a thick, two-tone crown.',
        duration: '30s',
      },
      {
        stepNumber: 4,
        title: 'Sip Through the Cream',
        instruction: 'Do not stir immediately! Sip the hot, bittersweet dark Robusta directly through the rich, sweet velvet foam layer.',
        duration: 'Instant',
      },
    ],
    baristaTip:
      'To keep the drink hot the authentic Hà Nội way, set your coffee glass inside a shallow bowl filled with hot water while sipping.',
  },

  // 4. Hà Nội Golden Egg Sabayon Instant Dessert Latte
  'hanoi-egg-custard-instant-latte': {
    name: 'Instant Hà Nội Egg Sabayon Dessert Latte',
    bestFor: 'Quick Afternoon Gourmet Treat',
    servingTemp: 'Hot or Iced',
    prepTime: '2 Minutes',
    equipment: ['Mug or Heatproof Glass', 'Spoon or Handheld Frother'],
    ingredients: [
      { item: 'Egg Sabayon Instant Sachet', quantity: '1 sachet (20g)' },
      { item: 'Hot Water (85°C – 90°C)', quantity: '90ml' },
      { item: 'Hot Milk or Condensed Milk', quantity: '10ml (optional, for extra creaminess)' },
      { item: 'Ground Cinnamon or Cocoa Powder', quantity: 'Light dusting on top' },
    ],
    waterTemp: '85°C – 90°C',
    steps: [
      {
        stepNumber: 1,
        title: 'Warm Dissolution',
        instruction: 'Pour sachet into a ceramic mug. Add 90ml of hot water just off the boil.',
        duration: '15s',
      },
      {
        stepNumber: 2,
        title: 'Aerate the Foam',
        instruction: 'Whisk briskly for 20 seconds. Watch the dehydrated egg sabayon cream rehydrate and rise naturally to the surface in a glossy golden foam layer.',
        duration: '20s',
      },
      {
        stepNumber: 3,
        title: 'Garnish & Enjoy',
        instruction: 'Dust lightly with pure dark cocoa or cinnamon powder. Sip slowly to savor the caramelized custard notes.',
        duration: '15s',
      },
    ],
    baristaTip:
      'Using hot milk instead of water elevates this instant latte to the consistency of melted crème brûlée.',
  },

  // 5. Đà Nẵng Toasted Coconut Cream Drip Coffee Powder
  'danang-toasted-coconut-coffee-powder': {
    name: 'Đà Nẵng Coastal Cà Phê Cốt Dừa',
    bestFor: 'Chilled Coconut Granite or Hot Coconut Cream Drip',
    servingTemp: 'Iced (Best) or Warm',
    prepTime: '5 Minutes',
    equipment: ['Traditional Phin Dripper', 'Blender (for granite) or Glass', 'Bar Spoon'],
    ingredients: [
      { item: 'Toasted Coconut Coffee Powder', quantity: '22g (3 tablespoons)' },
      { item: 'Thick Coconut Cream (Cốt Dừa)', quantity: '40ml' },
      { item: 'Sweetened Condensed Milk', quantity: '20ml' },
      { item: 'Hot Water (94°C)', quantity: '90ml' },
      { item: 'Crushed Shaved Ice', quantity: '1 generous cup' },
    ],
    waterTemp: '94°C',
    steps: [
      {
        stepNumber: 1,
        title: 'Brew the Coconut Phin Base',
        instruction: 'Drip 22g of Toasted Coconut Coffee through your Phin (20ml bloom, 70ml slow extraction) into a small shot glass.',
        duration: '4 min',
      },
      {
        stepNumber: 2,
        title: 'Prepare the Coconut Ice Cloud',
        instruction: 'Blend the coconut cream, condensed milk, and crushed ice in a blender on pulse for 15 seconds until it forms a creamy, snow-like coconut granite.',
        duration: '30s',
      },
      {
        stepNumber: 3,
        title: 'Layer and Crown',
        instruction: 'Pour the hot, dark coconut-infused coffee over the frozen coconut cream peak and serve with a long spoon.',
        duration: '30s',
      },
    ],
    baristaTip:
      'Toast 1 teaspoon of shredded unsweetened coconut in a dry pan for 2 minutes and sprinkle on top as a crunchy aromatic garnish.',
  },

  // 6. Đà Nẵng Coconut Cream 3-in-1 Instant Latte
  'danang-coconut-instant-latte': {
    name: 'Chilled Coconut Cloud Instant Frappé',
    bestFor: 'Summer Refreshment & Tropical Coffee Breaks',
    servingTemp: 'Iced',
    prepTime: '90 Seconds',
    equipment: ['Cocktail Shaker or Mason Jar with Lid', 'Tall Highball Glass'],
    ingredients: [
      { item: 'Coconut Cream Instant Sachet', quantity: '2 sachets (for iced)' },
      { item: 'Warm Water (60°C)', quantity: '80ml' },
      { item: 'Cold Coconut Milk or Oat Milk', quantity: '50ml' },
      { item: 'Cracked Ice Cubes', quantity: 'Full glass' },
    ],
    waterTemp: '60°C – 70°C',
    steps: [
      {
        stepNumber: 1,
        title: 'Dissolve in Shaker',
        instruction: 'Dissolve 2 sachets in 80ml warm water inside your shaker until completely smooth.',
        duration: '20s',
      },
      {
        stepNumber: 2,
        title: 'Chill with Milk & Ice',
        instruction: 'Add 50ml cold coconut milk and 4 large ice cubes. Seal tightly and shake vigorously for 15 seconds.',
        duration: '15s',
      },
      {
        stepNumber: 3,
        title: 'Strain over Fresh Ice',
        instruction: 'Strain into a chilled highball glass packed with fresh ice cubes. A velvety, airy coconut crema will float on top.',
        duration: '15s',
      },
    ],
    baristaTip:
      'Shaking with ice emulsifies the spray-dried coconut oil crystals, delivering the airy, silky mouthfeel of a high-end specialty café.',
  },

  // 7. Huế Imperial Sea Salted Caramel Ground Powder
  'hue-sea-salted-caramel-phin-powder': {
    name: 'Huế Imperial Cà Phê Muối (Salted Cream Coffee)',
    bestFor: 'Sophisticated Sweet & Savory Layered Experience',
    servingTemp: 'Iced or Warm',
    prepTime: '6 Minutes',
    equipment: ['Phin Dripper', 'Small Whisk or Frother', 'Clear Glass'],
    ingredients: [
      { item: 'Huế Salted Caramel Phin Powder', quantity: '20g' },
      { item: 'Sweetened Condensed Milk', quantity: '15ml' },
      { item: 'Heavy Cream (35% fat) or Milk Foam', quantity: '40ml' },
      { item: 'Flaky Sea Salt (Fine Pink or Fleur de Sel)', quantity: 'A tiny pinch (approx. 0.5g)' },
      { item: 'Hot Water (94°C)', quantity: '90ml' },
    ],
    waterTemp: '94°C',
    steps: [
      {
        stepNumber: 1,
        title: 'Drip onto Condensed Milk',
        instruction: 'Pour 15ml condensed milk in your glass. Mount the Phin with 20g salted caramel powder. Bloom for 45s, then fill with 70ml water and let it drip slowly.',
        duration: '4 min',
      },
      {
        stepNumber: 2,
        title: 'Whip the Sea Salt Cream Cloud',
        instruction: 'In a separate cup, whip 40ml cold heavy cream with a tiny pinch of sea salt for 60 seconds until semi-thick (like melting ice cream, not stiff butter).',
        duration: '1 min',
      },
      {
        stepNumber: 3,
        title: 'Layer the Cream Float',
        instruction: 'Stir the coffee and condensed milk together with ice. Then gently ladle the chilled salted cream across the surface.',
        duration: '30s',
      },
    ],
    baristaTip:
      'Originating from the historic royal city of Huế, the delicate sea salt cuts through the bitterness of the dark Robusta, accentuating deep butterscotch and caramel undertones.',
  },

  // 8. Huế Imperial Sea Salted Caramel Instant Coffee
  'hue-sea-salted-instant-caramel': {
    name: 'Quick Huế Salted Caramel Cream Latte',
    bestFor: 'Desk-side Luxury Coffee in Under a Minute',
    servingTemp: 'Hot or Iced',
    prepTime: '60 Seconds',
    equipment: ['Ceramic Mug', 'Spoon'],
    ingredients: [
      { item: 'Huế Salted Caramel Instant Sachet', quantity: '1 sachet (18g)' },
      { item: 'Hot Water (85°C – 90°C)', quantity: '80ml' },
      { item: 'Steamed Milk (optional)', quantity: '30ml' },
      { item: 'Sea Salt Flakes', quantity: 'A solitary flake to finish' },
    ],
    waterTemp: '85°C – 90°C',
    steps: [
      {
        stepNumber: 1,
        title: 'Pour and Stir',
        instruction: 'Empty the sachet into your favorite cup. Add 80ml hot water and stir for 20 seconds.',
        duration: '20s',
      },
      {
        stepNumber: 2,
        title: 'Add Steamed Milk',
        instruction: 'Top with warm frothed milk if desired, or pour over ice cubes for an instant iced salted caramel latte.',
        duration: '20s',
      },
    ],
    baristaTip:
      'A solitary flake of sea salt perched atop the microfoam provides an extraordinary contrast with the first sip.',
  },

  // 9. Mekong Delta Ri6 King Durian Instant Coffee
  'mekong-ri6-durian-specialty-coffee': {
    name: 'Mekong Golden Ri6 Durian Affogato',
    bestFor: 'Connoisseurs of Exotic Tropical Flavors',
    servingTemp: 'Hot or Poured over Gelato',
    prepTime: '2 Minutes',
    equipment: ['Small Cup or Dessert Bowl', 'Spoon'],
    ingredients: [
      { item: 'Mekong King Durian Instant Sachet', quantity: '1 sachet (20g)' },
      { item: 'Hot Water (90°C)', quantity: '70ml (concentrated)' },
      { item: 'Vanilla Bean Gelato or Coconut Ice Cream', quantity: '1 large scoop (optional)' },
    ],
    waterTemp: '90°C',
    steps: [
      {
        stepNumber: 1,
        title: 'Concentrated Brew',
        instruction: 'Dissolve the sachet in just 70ml hot water to create a rich, dense tropical espresso liquor.',
        duration: '20s',
      },
      {
        stepNumber: 2,
        title: 'Aroma Release',
        instruction: 'Allow 30 seconds for the authentic Ri6 durian custard notes to bloom and interlock with the dark Robusta roasty sweetness.',
        duration: '30s',
      },
      {
        stepNumber: 3,
        title: 'Affogato Pour',
        instruction: 'Pour hot over a cold scoop of vanilla or coconut gelato, or sip hot as a luxurious after-dinner digestif.',
        duration: '20s',
      },
    ],
    baristaTip:
      'We use pure freeze-dried Ri6 durian pulp from the Mekong Delta; serving slightly cooler (around 70°C) reveals warm hints of almond, white chocolate, and sweet honey.',
  },

  // 10. Northwest Mountain Spiced Cinnamon & Star Anise Powder
  'hanoi-cinnamon-star-anise-spiced-powder': {
    name: 'Highland Spiced Winter Phin Elixir',
    bestFor: 'Chilly Mornings, Rainy Days & Warming Comfort',
    servingTemp: 'Hot (Recommended) or Iced',
    prepTime: '5 Minutes',
    equipment: ['Phin Dripper', 'Ceramic Mug', 'Cinnamon Stick (optional)'],
    ingredients: [
      { item: 'Spiced Cinnamon & Star Anise Powder', quantity: '20g' },
      { item: 'Raw Honey or Palm Sugar', quantity: '1 teaspoon (or 15ml condensed milk)' },
      { item: 'Hot Water (95°C)', quantity: '100ml' },
      { item: 'Whole Star Anise Pod', quantity: '1 for garnish' },
    ],
    waterTemp: '95°C',
    steps: [
      {
        stepNumber: 1,
        title: 'Sweeten the Cup',
        instruction: 'Place honey or palm sugar in your warmed mug.',
        duration: '20s',
      },
      {
        stepNumber: 2,
        title: 'Spice Bloom',
        instruction: 'Add 20g spiced powder to the Phin. Wet with 25ml of 95°C water. The steam will immediately release mountain cinnamon and wild star anise oils.',
        duration: '45s',
      },
      {
        stepNumber: 3,
        title: 'Slow Extraction',
        instruction: 'Fill with 75ml hot water and allow to drip slowly. Garnish with a floating star anise pod.',
        duration: '4 min',
      },
    ],
    baristaTip:
      'Co-roasting with cinnamon bark releases natural sweet aldehydes that satisfy cravings without requiring heavy sugar additions.',
  },

  // 11. Saigon Pandan Leaf (Lá Dứa) Vanilla Coffee Powder
  'saigon-pandan-leaf-vanilla-powder': {
    name: 'Saigon Emerald Pandan Iced Phin (Cà Phê Lá Dứa)',
    bestFor: 'Refreshing Herbal-Vanilla Tropical Cold Brew or Phin',
    servingTemp: 'Iced',
    prepTime: '5 Minutes',
    equipment: ['Phin Dripper', 'Tall Glass', 'Stirring Straw'],
    ingredients: [
      { item: 'Pandan Leaf Vanilla Coffee Powder', quantity: '20g' },
      { item: 'Sweetened Condensed Milk', quantity: '20ml' },
      { item: 'Hot Water (92°C – 94°C)', quantity: '90ml' },
      { item: 'Fresh Mint or Pandan Knot', quantity: '1 for garnish' },
      { item: 'Large Solid Ice Cubes', quantity: 'Full glass' },
    ],
    waterTemp: '93°C',
    steps: [
      {
        stepNumber: 1,
        title: 'Layer Condensed Milk',
        instruction: 'Pour 20ml condensed milk into your glass.',
        duration: '15s',
      },
      {
        stepNumber: 2,
        title: 'Phin Infusion',
        instruction: 'Brew 20g of pandan powder through the Phin with 90ml hot water (30s bloom, 4 min drip).',
        duration: '4.5 min',
      },
      {
        stepNumber: 3,
        title: 'Ice Chill & Swirl',
        instruction: 'Mix coffee and milk, fill the glass with crystal ice, and stir until condensation frosts the outer glass. The grassy sweet pandan fragrance will fill the room.',
        duration: '30s',
      },
    ],
    baristaTip:
      'Pandan (often dubbed the vanilla of Southeast Asia) contains aromatic compound 2-acetyl-1-pyrroline, matching the roasted notes of French butter-roasted Robusta beans.',
  },

  // 12. Đồng Tháp Pink Lotus Flower Scented Coffee Powder
  'dong-thap-lotus-flower-scented-powder': {
    name: 'Imperial Pink Lotus Ceremony Pour-Over',
    bestFor: 'Meditative Afternoon Tasting & Refined Black Coffee',
    servingTemp: 'Hot',
    prepTime: '4 Minutes',
    equipment: ['Phin Dripper or Ceramic V60 / Pour-Over', 'Fine Porcelain Teacup'],
    ingredients: [
      { item: 'Pink Lotus Scented Coffee Powder', quantity: '18g' },
      { item: 'Hot Spring Water (92°C)', quantity: '120ml' },
      { item: 'Cane Sugar', quantity: 'Optional (we suggest enjoying neat)' },
    ],
    waterTemp: '92°C (198°F)',
    steps: [
      {
        stepNumber: 1,
        title: 'Gentle Temperature Water',
        instruction: 'Heat water to 92°C. Lower temperatures preserve the delicate floral lotus pollen notes without bitterness.',
        duration: '1 min',
      },
      {
        stepNumber: 2,
        title: '30-Second Petal Bloom',
        instruction: 'Pour 30ml water gently over the lotus coffee grounds in circular motions. Inhale the floral tea-like bouquet as it blooms.',
        duration: '30s',
      },
      {
        stepNumber: 3,
        title: 'Slow Continuous Pour',
        instruction: 'Pour the remaining 90ml water steadily over 2 minutes. Sip pure and unadulterated from fine porcelain.',
        duration: '2 min',
      },
    ],
    baristaTip:
      'Traditionally reserved for the Nguyen Dynasty royalty in Huế, lotus flowers are harvested at 4 AM while the petals are closed around night mist to seal in the nectar.',
  },

  // 13. Saigon Heritage Phin Coffee Powder
  'saigon-heritage-phin-powder': {
    name: 'The Definitive Saigon Cà Phê Sữa Đá',
    bestFor: 'The Iconic Daily Vietnamese Ritual',
    servingTemp: 'Iced (Classic) or Piping Hot',
    prepTime: '5 Minutes',
    equipment: ['Traditional 6oz Phin Dripper', 'Classic Faceted Glass Tumbler', 'Long Metal Spoon'],
    ingredients: [
      { item: 'Saigon Heritage Phin Coffee Powder', quantity: '20g – 22g (3 level tablespoons)' },
      { item: 'Sweetened Condensed Milk (Lon Sữa Đặc)', quantity: '25ml (about 2 tablespoons)' },
      { item: 'Hot Water (94°C – 96°C)', quantity: '100ml total' },
      { item: 'Dense Rock Ice Cubes', quantity: 'Full glass to the brim' },
    ],
    waterTemp: '95°C',
    steps: [
      {
        stepNumber: 1,
        title: 'The Sweet Foundation',
        instruction: 'Spoon 25ml condensed milk into the bottom of your clear glass tumbler.',
        duration: '20s',
      },
      {
        stepNumber: 2,
        title: 'Phin Setup & Gravity Press',
        instruction: 'Rest the Phin filter over the glass. Add 20g ground coffee, shake gently side to side to distribute evenly, and drop the gravity damper lightly in place.',
        duration: '30s',
      },
      {
        stepNumber: 3,
        title: 'The 40-Second Bloom',
        instruction: 'Pour 25ml hot water (95°C) to wet the coffee grounds completely. Cover with lid and wait 40 seconds while the grounds absorb water and expand.',
        duration: '40s',
      },
      {
        stepNumber: 4,
        title: 'Full Extraction',
        instruction: 'Pour 75ml hot water up to the top brim of the Phin. Cover and let gravity extract 40 to 45 drops per minute over roughly 4 minutes.',
        duration: '4 min',
      },
      {
        stepNumber: 5,
        title: 'The Ritual Stir & Ice Cascade',
        instruction: 'Set the lid upside down as a coaster for the Phin. Stir the dark espresso into the condensed milk until silky tan, then pack the glass with crystal ice cubes.',
        duration: '30s',
      },
    ],
    baristaTip:
      'Do not press down forcefully on the inner gravity filter. Gentle placement allows the water to percolate through the butter-roasted grounds at the golden extraction rate.',
  },

  // 14. Culi Peaberry Powder
  'buon-ma-thuot-peaberry-powder': {
    name: 'Intense Highland Culi Peaberry Espresso Drip',
    bestFor: 'Maximum Morning Energy & Dark Cocoa Intensity',
    servingTemp: 'Hot Black (Cà Phê Đen Nóng) or with Condensed Milk',
    prepTime: '5 Minutes',
    equipment: ['Phin Dripper or Moka Pot', 'Thick-walled Espresso Cup'],
    ingredients: [
      { item: 'Culi Peaberry Ground Powder', quantity: '22g' },
      { item: 'Hot Water (96°C)', quantity: '90ml' },
      { item: 'Raw Cane Sugar or Condensed Milk', quantity: 'To taste' },
    ],
    waterTemp: '96°C',
    steps: [
      {
        stepNumber: 1,
        title: 'High-Temperature Extraction',
        instruction: 'Peaberry beans (rare single round beans) are denser than normal coffee beans. Use 96°C water to draw out their deep roasted nut and dark tobacco notes.',
        duration: '30s',
      },
      {
        stepNumber: 2,
        title: 'The Extended 50s Bloom',
        instruction: 'Wet with 25ml water and let bloom for 50 seconds under the Phin lid.',
        duration: '50s',
      },
      {
        stepNumber: 3,
        title: 'Percolation',
        instruction: 'Add remaining 65ml water. The resulting brew will be nearly as viscous as an Italian ristretto.',
        duration: '4 min',
      },
    ],
    baristaTip:
      'Only 5% of any coffee harvest yields peaberry beans (culi), where a single spherical seed absorbs all the plant nutrition rather than splitting into two flat beans.',
  },

  // 15. Highland Arabica Powder
  'dalat-highland-typica-powder': {
    name: 'Highland Cloud Mist Pour-Over / Phin',
    bestFor: 'Elegant Morning Pour-Over with Citrus & Honey Notes',
    servingTemp: 'Hot Neat or Light Iced Americano',
    prepTime: '4 Minutes',
    equipment: ['Phin Dripper or Hario V60 / Kalita Wave', 'Porcelain Server'],
    ingredients: [
      { item: 'Highland Arabica Powder', quantity: '18g' },
      { item: 'Hot Water (92°C)', quantity: '150ml (ratio 1:8 for Phin, 1:15 for V60)' },
      { item: 'Serving style', quantity: 'Black with optional dash of fresh milk' },
    ],
    waterTemp: '92°C',
    steps: [
      {
        stepNumber: 1,
        title: 'Rinse Filter',
        instruction: 'Warm your brewer and cup with hot water, then discard the rinse water.',
        duration: '20s',
      },
      {
        stepNumber: 2,
        title: '30-Second Bloom',
        instruction: 'Add 18g coffee and wet with 35ml water. Allow the citrus, jasmine, and caramel aromas to rise.',
        duration: '30s',
      },
      {
        stepNumber: 3,
        title: 'Smooth Drip Pour',
        instruction: 'Pour the remaining water in two slow pulses over 2.5 minutes for a bright, clean cup with a winey acidity.',
        duration: '2.5 min',
      },
    ],
    baristaTip:
      'Grown at 1,500m elevation in the volcanic mist of Mount Lang Biang, this high-grown Arabica offers a delicate, tea-like clarity contrasting with coastal Robusta.',
  },

  // 16. Saigon 3-in-1 Condensed Milk Instant Coffee
  'saigon-3in1-instant-sachets': {
    name: '30-Second Authentic Street-Style Cà Phê Sữa',
    bestFor: 'Instant Office Fuel & Busy Morning Commutes',
    servingTemp: 'Hot or Iced',
    prepTime: '30 Seconds',
    equipment: ['Coffee Mug or Travel Tumbler', 'Spoon'],
    ingredients: [
      { item: 'Saigon 3-in-1 Sachet', quantity: '1 sachet (for hot 100ml) or 2 sachets (for iced)' },
      { item: 'Hot Water (85°C – 90°C)', quantity: '80ml – 100ml' },
      { item: 'Ice Cubes (for iced)', quantity: '1 cup' },
    ],
    waterTemp: '85°C – 90°C',
    steps: [
      {
        stepNumber: 1,
        title: 'Tear & Pour',
        instruction: 'Empty sachet into your mug.',
        duration: '5s',
      },
      {
        stepNumber: 2,
        title: 'Dissolve Instantly',
        instruction: 'Add 80ml hot water and stir vigorously for 15 seconds until the micro-ground crystals and condensed milk powder blend smoothly.',
        duration: '15s',
      },
      {
        stepNumber: 3,
        title: 'Ice Chill (Optional)',
        instruction: 'If preparing iced, double the sachet dosage to prevent dilution from melting ice.',
        duration: '10s',
      },
    ],
    baristaTip:
      'Never boil water to 100°C for instant blends; 85°C produces a noticeably sweeter, smoother taste profile.',
  },

  // 17. Pure Freeze-Dried Black Robusta (100g Glass Jar)
  'freeze-dried-pure-black-robusta-jar': {
    name: 'Pure Robusta Tonic Spritz & Cold Drip',
    bestFor: 'Afternoon Sparkling Coffee Tonic or Clean Black Espresso',
    servingTemp: 'Iced & Sparkling',
    prepTime: '90 Seconds',
    equipment: ['Highball Glass', 'Bar Spoon'],
    ingredients: [
      { item: 'Freeze-Dried Pure Robusta Crystals', quantity: '2 teaspoons (approx. 4g)' },
      { item: 'Warm Water to Dissolve', quantity: '25ml' },
      { item: 'Chilled Tonic Water or Club Soda', quantity: '120ml' },
      { item: 'Fresh Lime or Orange Slice', quantity: '1 wheel' },
      { item: 'Large Clear Ice Cubes', quantity: 'Full glass' },
    ],
    waterTemp: 'Warm (50°C to dissolve)',
    steps: [
      {
        stepNumber: 1,
        title: 'Create the Black Concentrate',
        instruction: 'Dissolve 2 teaspoons of freeze-dried crystals in 25ml warm water inside a small shot glass.',
        duration: '15s',
      },
      {
        stepNumber: 2,
        title: 'Build the Tonic Base',
        instruction: 'Fill a highball glass with ice, squeeze a fresh slice of lime, and pour 120ml chilled tonic water.',
        duration: '15s',
      },
      {
        stepNumber: 3,
        title: 'The Espresso Float',
        instruction: 'Slowly pour the concentrated dark Robusta over the back of a bar spoon onto the tonic. Watch the cascading dark crema settle on top.',
        duration: '20s',
      },
    ],
    baristaTip:
      'Our cryo-freeze-drying process preserves the authentic dark chocolate and cedar notes of the beans without heat degradation.',
  },

  // 18. Highland Whole Beans (250g)
  'buon-ma-thuot-whole-bean-robusta': {
    name: 'Artisan Fresh-Cracked Phin Drip',
    bestFor: 'Purists Who Grind Fresh for Ultimate Aromatics',
    servingTemp: 'Hot or Iced with Condensed Milk',
    prepTime: '6 Minutes',
    equipment: ['Burr Grinder (Coarse Sand Grind)', 'Traditional Phin Dripper', 'Kitchen Scale'],
    ingredients: [
      { item: 'Whole Bean Robusta', quantity: '20g freshly ground to coarse kosher salt texture' },
      { item: 'Hot Water (94°C)', quantity: '100ml' },
      { item: 'Sweetened Condensed Milk', quantity: '20ml (optional)' },
    ],
    waterTemp: '94°C',
    steps: [
      {
        stepNumber: 1,
        title: 'Coarse Burr Grind',
        instruction: 'Grind 20g whole beans on a coarse setting (similar to rough beach sand or sea salt flakes) so grounds don’t slip through the Phin perforations.',
        duration: '30s',
      },
      {
        stepNumber: 2,
        title: 'Hydraulic Bloom',
        instruction: 'Add to Phin, tap level, drop press. Wet with 25ml water at 94°C for 45s.',
        duration: '45s',
      },
      {
        stepNumber: 3,
        title: 'Gravity Extraction',
        instruction: 'Top with 75ml hot water. Let it drip into your cup over 4 minutes for maximum sweetness and dense hazelnut crema.',
        duration: '4 min',
      },
    ],
    baristaTip:
      'Grinding fresh right before brewing yields up to 300% more volatile aromatic oils than pre-ground coffee.',
  },

  // 19. Typica Whole Roasted Beans (250g)
  'dalat-arabica-whole-beans': {
    name: 'Slow French Press Citrus Floral Bloom',
    bestFor: 'Relaxed Weekend Brunch & Pour-Over Rituals',
    servingTemp: 'Hot',
    prepTime: '5 Minutes',
    equipment: ['French Press or Chemex', 'Burr Grinder', 'Kitchen Scale'],
    ingredients: [
      { item: 'Typica Whole Beans', quantity: '25g ground coarse' },
      { item: 'Hot Water (93°C)', quantity: '350ml (ratio 1:14)' },
    ],
    waterTemp: '93°C (200°F)',
    steps: [
      {
        stepNumber: 1,
        title: 'Coarse Grind',
        instruction: 'Grind 25g beans to coarse breadcrumb consistency and place in French press.',
        duration: '30s',
      },
      {
        stepNumber: 2,
        title: 'Full Immersion Pour',
        instruction: 'Pour 350ml of 93°C water vigorously over the grounds. Stir gently with a wooden spoon for 5 seconds.',
        duration: '30s',
      },
      {
        stepNumber: 3,
        title: 'Steep and Press',
        instruction: 'Place lid with plunger pulled up. Steep undisturbed for 4 minutes, then press down slowly and pour immediately.',
        duration: '4 min',
      },
    ],
    baristaTip:
      'Pour all the brewed coffee immediately into your serving mugs or carafe rather than leaving it in the press, preventing over-extraction.',
  },

  // 20. Complete Vietnamese Home Barista Starter Kit
  'vietnamese-barista-starter-bundle': {
    name: 'Complete Master Barista 4-Stage Phin Ceremony',
    bestFor: 'Initiation into Authentic Vietnamese Coffee Culture',
    servingTemp: 'Hot or Iced Cà Phê Sữa Đá',
    prepTime: '5 Minutes',
    equipment: ['Solid Phin Dripper', 'Lon Sữa Đặc Condensed Milk', 'Glass Tumbler', 'Measuring Spoon'],
    ingredients: [
      { item: 'Included Heritage Coffee Powder', quantity: '20g' },
      { item: 'Included Condensed Milk', quantity: '20ml – 25ml' },
      { item: 'Hot Water (94°C – 96°C)', quantity: '100ml' },
      { item: 'Glass packed with ice cubes', quantity: 'For iced version' },
    ],
    waterTemp: '95°C',
    steps: [
      {
        stepNumber: 1,
        title: 'Assemble Your Phin',
        instruction: 'Place the sparge plate / saucer over your glass tumbler.',
        duration: '15s',
      },
      {
        stepNumber: 2,
        title: 'Dose the Coffee',
        instruction: 'Spoon 20g ground coffee into the brewing chamber. Level gently.',
        duration: '20s',
      },
      {
        stepNumber: 3,
        title: 'Seat the Damper & Bloom',
        instruction: 'Place the filter damper on the coffee bed. Pour 20ml hot water into the lid (set Phin on lid to pre-wet bottom) and 20ml over top. Bloom 40s.',
        duration: '40s',
      },
      {
        stepNumber: 4,
        title: 'Percolate & Serve',
        instruction: 'Fill chamber with 80ml hot water, cover with lid, and watch the meditative gravity drip. Stir and enjoy.',
        duration: '4 min',
      },
    ],
    baristaTip:
      'This starter kit unlocks all traditional Vietnamese recipes: Cà Phê Đen (black), Cà Phê Sữa (sweet milk), and Cà Phê Trứng (egg sabayon).',
  },

  // 21. Artisan Solid Brass Vietnamese Phin Dripper (6 oz)
  'artisan-solid-brass-phin-6oz': {
    name: 'Solid Brass Thermal Retention Phin Ritual',
    bestFor: 'Connoisseur Gravity Extraction with Superior Thermal Mass',
    servingTemp: 'Hot or Iced',
    prepTime: '5 Minutes',
    equipment: ['Artisan Solid Brass Phin (6 oz)', 'Pre-warmed Glass Tumbler'],
    ingredients: [
      { item: 'Coarse Phin Coffee Powder', quantity: '20g' },
      { item: 'Hot Water (95°C)', quantity: '110ml' },
      { item: 'Condensed Milk', quantity: '20ml' },
    ],
    waterTemp: '95°C',
    steps: [
      {
        stepNumber: 1,
        title: 'Preheat the Brass Body',
        instruction: 'Rinse the solid brass chamber and damper with hot water. Solid brass retains heat significantly longer than thin aluminum, keeping brew temperatures locked at 92°C+ throughout the 4-minute extraction.',
        duration: '30s',
      },
      {
        stepNumber: 2,
        title: 'Dose and Level',
        instruction: 'Add 20g of coffee. Gently spin the gravity damper clockwise twice to settle the bed evenly.',
        duration: '20s',
      },
      {
        stepNumber: 3,
        title: '40-Second Bloom & Pour',
        instruction: 'Bloom with 25ml water for 40 seconds. Top with 85ml hot water and cover.',
        duration: '4 min',
      },
    ],
    baristaTip:
      'Brass develops a natural patina over time that reflects your brewing history. Wash with warm water and soft cloth only—avoid abrasive dish sponges.',
  },

  // 22. Matte Obsidian Black Stainless Steel Phin (8 oz)
  'matte-obsidian-stainless-phin-8oz': {
    name: 'Double-Portion Obsidian Cold Drip',
    bestFor: 'Sharing for Two or Extra-Large Morning Cups',
    servingTemp: 'Iced for Two or Double Strength Mug',
    prepTime: '6 Minutes',
    equipment: ['Matte Obsidian Stainless Steel Phin (8 oz)', 'Two Glasses or Large Carafe'],
    ingredients: [
      { item: 'Coarse Phin Coffee Powder', quantity: '30g (approx. 4 tablespoons)' },
      { item: 'Sweetened Condensed Milk', quantity: '40ml (split between two glasses)' },
      { item: 'Hot Water (95°C)', quantity: '160ml' },
      { item: 'Rock Ice', quantity: '2 glasses filled with ice' },
    ],
    waterTemp: '95°C',
    steps: [
      {
        stepNumber: 1,
        title: 'Dose for Two',
        instruction: 'Add 30g coffee powder into the large 8 oz obsidian chamber. Settle the damper evenly.',
        duration: '30s',
      },
      {
        stepNumber: 2,
        title: 'Deep 45-Second Bloom',
        instruction: 'Pour 35ml hot water to wet the larger coffee bed. Wait 45 seconds.',
        duration: '45s',
      },
      {
        stepNumber: 3,
        title: 'Double Extraction',
        instruction: 'Pour remaining 125ml hot water and cover. Drips steadily for 4.5 minutes.',
        duration: '4.5 min',
      },
      {
        stepNumber: 4,
        title: 'Divide & Serve',
        instruction: 'Stir and divide the rich dark brew between two glasses over fresh ice.',
        duration: '30s',
      },
    ],
    baristaTip:
      'The 8 oz volume is tailored for double servings or for brewing concentrated Vietnamese cold-brew bases to keep in the refrigerator.',
  },
};

export function getRecipeForProduct(productId: string): BrewRecipe | undefined {
  return BREW_RECIPES[productId];
}
