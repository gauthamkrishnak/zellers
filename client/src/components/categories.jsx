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
import { useState } from "react";

function Categories(props) {
  const { setselectedcategory, selectedcategory } = props;
  const [showcategoriess, setshowcategories] = useState(false);

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
    <>
      <h1 className="text-3xl font-bold mb-4">Categories</h1>

      <div className="flex flex-col gap-4">
        {categories.map((category) => {
          const Icon = category.icon;

          return (
            <div
              key={category.name}
              onClick={() => setselectedcategory(category.name)}
              className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition
 
        ${
          selectedcategory === category.name
            ? "bg-blue-500 text-white shadow-md"
            : "hover:bg-blue-100"
        }`}
            >
              <Icon
                size={20}
                className={
                  selectedcategory === category.name
                    ? "text-white"
                    : "text-blue-400"
                }
              />
              <span>{category.name}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default Categories;
