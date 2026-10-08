// Marketing copy and photos from the Juiced By Jay flyers. Prices, names and
// availability live in the database; this file holds the long-form content.

export type Item = { name: string; text: string };

export type JuiceContent = {
  bottle: string;
  poster: string;
  bg: string;
  accent: string;
  cat: string;
  alt: string;
  ingredients: Item[];
  benefits: Item[];
};

export const JUICE_CONTENT: Record<string, JuiceContent> = {
  "citrus-beet": {
    bottle: "/images/citrus_bottle.jpg",
    poster: "/images/citrus_poster.jpg",
    bg: "#F6EBD9",
    accent: "#7A1E3C",
    cat: "CITRUS · BEET",
    alt: "Bottle of Citrus Beet juice with oranges, grapefruit and beets",
    ingredients: [
      { name: "Oranges", text: "Rich in vitamin C, antioxidants & potassium to support immunity, heart health & glowing skin." },
      { name: "Grapefruit", text: "Packed with vitamin C and antioxidants to support immunity and overall well-being." },
      { name: "Beet", text: "Naturally rich in nitrates, folate & antioxidants to support circulation, energy & detox." },
    ],
    benefits: [
      { name: "Immune support", text: "High in vitamin C to help support a strong immune system and overall wellness." },
      { name: "Heart & circulation", text: "Beets help support healthy blood flow and blood pressure. Potassium from citrus supports heart health." },
      { name: "Natural energy", text: "Natural sugars from citrus provide quick energy. Great for a pre-workout boost or afternoon pick-me-up." },
      { name: "Healthy blood support", text: "Beets are a good source of folate and essential nutrients that support healthy red blood cells." },
      { name: "Antioxidant power", text: "Loaded with antioxidants from citrus and beets to help fight free radicals and support overall health." },
      { name: "Hydration", text: "Citrus fruits are high in water content to help keep your body hydrated and refreshed." },
      { name: "Digestive support", text: "Citrus provides natural compounds that may support digestion and gut health." },
    ],
  },
  "green-power": {
    bottle: "/images/green_bottle.jpg",
    poster: "/images/green_poster.jpg",
    bg: "#EEF0DD",
    accent: "#3F5A22",
    cat: "GREEN APPLE · SPINACH · CUCUMBER · LEMON",
    alt: "Bottle of Green Power juice with spinach, green apple, cucumber and lemon",
    ingredients: [
      { name: "Green apples", text: "Crisp, refreshing & packed with antioxidants and natural sweetness." },
      { name: "Spinach", text: "Rich in vitamins, minerals & plant-based nutrients to support your body." },
      { name: "Cucumber", text: "Ultra-hydrating to help refresh, cool & hydrate your body." },
      { name: "Lemon", text: "Naturally detoxifying and rich in Vitamin C to support immunity." },
    ],
    benefits: [
      { name: "Immune boost", text: "High in Vitamin C and antioxidants to help strengthen your immune system." },
      { name: "Hydration", text: "Cucumber & green apples help keep your body refreshed and hydrated." },
      { name: "Natural energy", text: "Provides clean, natural energy to help you power through your day." },
      { name: "Detox & cleanse", text: "Supports your body's natural detox process and helps flush out toxins." },
      { name: "Heart health", text: "Potassium and antioxidants support healthy heart function and blood pressure." },
      { name: "Glowing skin", text: "Vitamin C and antioxidants help promote clear, healthy, glowing skin." },
    ],
  },
};

export const GINGER = {
  image: "/images/ginger_shot.jpg",
  poster: "/images/ginger_poster.jpg",
  bg: "#EEE6CF",
  alt: "Citrus Beet and Green Power bottles with fresh ginger and lemon",
  benefits: [
    { name: "Supports immune health", text: "Packed with antioxidants and anti-inflammatory properties." },
    { name: "Aids digestion", text: "Helps soothe the digestive tract and supports healthy gut function." },
    { name: "Reduces inflammation", text: "Contains powerful compounds that may help reduce inflammation." },
    { name: "Boosts energy & focus", text: "Supports better blood flow and oxygen delivery." },
    { name: "Natural nausea relief", text: "Known to ease nausea and may help with motion sickness." },
  ] as Item[],
};

export const INSTAGRAM_URL = "https://instagram.com/juicedbyjay";
