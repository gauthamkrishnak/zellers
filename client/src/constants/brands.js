// Canonical Category -> Brand Mapping for Frontend components
import {
  Layers,
  Smartphone,
  Laptop,
  Car,
  Bike,
  Sofa,
  Shirt,
  BookOpen,
  Trophy,
  Home,
  Package,
} from "lucide-react";

export const CATEGORIES = [
  "Mobiles",
  "Electronics",
  "Vehicles",
  "Cycles",
  "Furniture",
  "Fashion",
  "Books",
  "Sports",
  "Home Appliances",
  "Others",
];

export const CATEGORY_ICONS = {
  All: Layers,
  Mobiles: Smartphone,
  Electronics: Laptop,
  Vehicles: Car,
  Cycles: Bike,
  Furniture: Sofa,
  Fashion: Shirt,
  Books: BookOpen,
  Sports: Trophy,
  "Home Appliances": Home,
  Others: Package,
};

export const CATEGORY_ITEMS = [
  { name: "All", icon: Layers },
  { name: "Mobiles", icon: Smartphone },
  { name: "Electronics", icon: Laptop },
  { name: "Vehicles", icon: Car },
  { name: "Cycles", icon: Bike },
  { name: "Furniture", icon: Sofa },
  { name: "Fashion", icon: Shirt },
  { name: "Books", icon: BookOpen },
  { name: "Sports", icon: Trophy },
  { name: "Home Appliances", icon: Home },
  { name: "Others", icon: Package },
];

export const CATEGORY_BRAND_MAPPING = {
  Electronics: [
    "Apple",
    "Samsung",
    "Sony",
    "Dell",
    "HP",
    "Lenovo",
    "Asus",
    "LG",
    "OnePlus",
    "Xiaomi",
    "Realme",
    "Acer",
    "MSI",
  ],
  Mobiles: [
    "Apple",
    "Samsung",
    "OnePlus",
    "Xiaomi",
    "Realme",
    "Sony",
    "Asus",
    "LG",
  ],
  Cycles: [
    "Hero",
    "Firefox",
    "Montra",
    "Btwin",
    "Trek",
    "Giant",
    "Scott",
  ],
  Furniture: [
    "Nilkamal",
    "Godrej",
    "IKEA",
    "Urban Ladder",
    "Wakefit",
    "Durian",
  ],
  Fashion: [
    "Nike",
    "Adidas",
    "Puma",
    "Zara",
    "H&M",
    "Levi's",
  ],
  Books: [
    "Penguin Random House",
    "HarperCollins",
    "Macmillan",
    "Simon & Schuster",
    "Hachette",
    "Oxford University Press",
    "Cambridge University Press",
    "Scholastic",
  ],
  Vehicles: [
    "Toyota",
    "Honda",
    "BMW",
    "Hyundai",
    "Suzuki",
    "Tesla",
    "Mahindra",
    "Tata",
  ],
  Sports: [
    "Yonex",
    "Cosco",
    "Nivia",
    "SS",
    "MRF",
    "SG",
    "Wilson",
    "Spalding",
    "Decathlon",
  ],
  "Home Appliances": [
    "LG",
    "Samsung",
    "Whirlpool",
    "Bosch",
    "IFB",
    "Godrej",
    "Panasonic",
    "Philips",
  ],
  Others: [
    "Generic",
    "Handmade",
    "Custom",
    "Unbranded",
  ],
};

/**
 * Returns canonical brands for a given category name.
 * Falls back to all unique canonical brands if "All" or invalid category.
 */
export const getBrandsForCategory = (category) => {
  if (!category || category === "All") {
    const allBrands = new Set();
    Object.values(CATEGORY_BRAND_MAPPING).forEach((brands) => {
      brands.forEach((b) => allBrands.add(b));
    });
    return Array.from(allBrands).sort();
  }
  return CATEGORY_BRAND_MAPPING[category] || CATEGORY_BRAND_MAPPING["Others"];
};
