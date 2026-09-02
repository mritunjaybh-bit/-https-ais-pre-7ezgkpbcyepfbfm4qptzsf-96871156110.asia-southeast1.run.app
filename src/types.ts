export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'SGD' | 'VND';

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  rate: number; // relative to INR (base 1)
  name: string;
  label: string;
}

export type ProductCategory =
  | 'all'
  | 'flavoured-coffee'
  | 'coffee-powder'
  | 'instant-coffee'
  | 'whole-bean'
  | 'brewing-gear';

export type GrindOption =
  | 'Authentic Phin Grind (Coarse)'
  | 'Espresso & Moka Pot (Fine)'
  | 'Pour Over & Drip (Medium)'
  | 'French Press / Cold Brew (Coarse)'
  | 'Whole Beans (Un-ground)';

export type PackageSize =
  | '100g Glass Jar'
  | '250g Valve Pouch'
  | '500g Fresh Pack'
  | '1kg Roastery Bag'
  | 'Box of 20 Sachets'
  | 'Box of 50 Sachets (Value Pack)'
  | 'Single Set'
  | 'Gift Bundle Box';

export interface ProductItem {
  id: string;
  name: string;
  vietnameseName: string;
  tagline: string;
  description: string;
  category: 'flavoured-coffee' | 'coffee-powder' | 'instant-coffee' | 'whole-bean' | 'brewing-gear';
  flavorType?: 'Egg Custard' | 'Chocolate & Cacao' | 'Toasted Coconut' | 'Sea Salt Caramel' | 'Mekong Durian' | 'Spiced Cinnamon' | 'Pandan Leaf' | 'Lotus Blossom' | 'Highland Avocado' | 'Traditional Caramel Butter';
  basePriceINR: number;
  imageUrl: string;
  badge?: string;
  roastLevel?: 'Light' | 'Medium' | 'Medium-Dark' | 'Dark' | 'French Butter Roast';
  beanBlend?: string;
  caffeineScore: number; // 1 to 5
  tastingNotes: string[];
  originRegion?: string;
  elevation?: string;
  process?: string;
  availableSizes: {
    size: PackageSize;
    priceMultiplier: number;
    weightGrams?: number;
    sachets?: number;
  }[];
  availableGrinds?: GrindOption[];
  isInstant?: boolean;
  isFlavoured?: boolean;
  shelfLife?: string;
  rating: number;
  reviewsCount: number;
  brewingRecommendation?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  vietnameseName: string;
  unitPriceINR: number;
  quantity: number;
  imageUrl: string;
  selectedSize: PackageSize;
  selectedGrind?: GrindOption;
  category: 'flavoured-coffee' | 'coffee-powder' | 'instant-coffee' | 'whole-bean' | 'brewing-gear';
}

export type ActiveTab = 'shop' | 'flavoured' | 'instant' | 'brew-studio' | 'flavor-matcher' | 'heritage';

export type OrderState = 'Order Placed & Roasting' | 'Packaged & Sealed' | 'In Transit' | 'Delivered';

export interface PlacedOrder {
  orderId: string;
  shippingType: 'standard' | 'express' | 'same-day';
  shippingAddress: string;
  cityPincode: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  giftMessage?: string;
  discountINR: number;
  finalTotalINR: number;
  items: CartItem[];
  createdAt: number;
  timestamp: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
  paymentId?: string;
  paymentMethod?: string;
  status: OrderState;
  trackingNumber?: string;
  courierPartner?: string;
  emailSentSuccess?: boolean;
  emailMessage?: string;
}
