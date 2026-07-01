import {
  Laptop,
  Smartphone,
  Car,
  Sofa,
  Shirt,
  BookOpen,
  Trophy,
  Menu,
  Ellipsis,
} from "lucide-react";
import { motion } from "framer-motion";

function Categories(props) {
  const { setselectedcategory, selectedcategory } = props;

  const categories = [
    { name: "All", icon: Menu },
    { name: "Electronics", icon: Laptop },
    { name: "Mobiles", icon: Smartphone },
    { name: "Vehicles", icon: Car },
    { name: "Furniture", icon: Sofa },
    { name: "Fashion", icon: Shirt },
    { name: "Books", icon: BookOpen },
    { name: "Sports", icon: Trophy },
    { name: "Others", icon: Ellipsis },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/50 p-5 shadow-sm lg:sticky lg:top-24">
      <h2 className="text-lg font-bold text-slate-800 tracking-tight mb-4">
        Categories
      </h2>

      <div className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = selectedcategory === category.name;

          return (
            <button
              key={category.name}
              onClick={() => setselectedcategory(category.name)}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-left font-medium text-sm transition-all duration-200 shrink-0 outline-none ${
                isActive
                  ? "text-white font-semibold"
                  : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeCategoryIndicator"
                  className="absolute inset-0 bg-indigo-600 rounded-xl shadow-md shadow-indigo-600/10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon
                size={18}
                className={`relative z-10 transition-colors duration-200 ${
                  isActive ? "text-white" : "text-slate-400"
                }`}
              />
              <span className="relative z-10">{category.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Categories;
