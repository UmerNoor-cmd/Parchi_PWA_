export const MERCHANT_CATEGORY_MAP: Record<string, string[]> = {
  "Food & Beverage": ["Fast Food", "Cafe", "Restaurant", "Bakery", "Desserts"],
  Retail: ["Fashion", "Electronics", "Grocery", "Home & Living", "Beauty"],
  Health: ["Pharmacy", "Clinic", "Gym & Fitness", "Wellness", "Diagnostics"],
  Services: ["Salon", "Laundry", "Auto Service", "Education", "Repairs"],
  Entertainment: ["Gaming", "Cinema", "Travel", "Sports", "Events"],
};

export const MERCHANT_CATEGORIES = Object.keys(MERCHANT_CATEGORY_MAP);

export function getSubcategoriesForCategory(category: string): string[] {
  return MERCHANT_CATEGORY_MAP[category] || [];
}
