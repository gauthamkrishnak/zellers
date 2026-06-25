import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

import Products from "../data/products";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");

  const product = Products.find((product) => product.id === Number(id));

  if (!product) {
    return <h1 className="text-center text-2xl mt-10">Product Not Found</h1>;
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:underline mb-6"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT SECTION */}
          <div className="lg:col-span-2">
            {/* Product Image */}
            <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-64 md:h-96 lg:h-[500px] object-contain"
              />
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mt-6">
              <h2 className="text-xl md:text-2xl font-bold mb-4">
                Description
              </h2>

              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                {product.desc}
              </p>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div>
            {/* Product Info Card */}
            <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
                {product.title}
              </h1>

              <p className="text-2xl md:text-3xl font-bold text-blue-600 mt-3">
                ₹{product.price}
              </p>

              <p className="text-gray-600 mt-3">📍 {product.location}</p>

              <p className="text-gray-500 text-sm mt-2">
                Listed {product.listed}
              </p>

              <button className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                Buy Now
              </button>

              <div className="flex flex-col sm:flex-row gap-3 mt-3">
                <button className="flex-1 border rounded-lg py-2 hover:bg-gray-100 transition">
                  Chat
                </button>

                <button className="flex-1 border rounded-lg py-2 hover:bg-gray-100 transition">
                  Contact
                </button>
              </div>
            </div>

            {/* Seller Card */}
            <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mt-6">
              <h3 className="text-xl font-semibold mb-3">Seller Information</h3>

              <div className="space-y-2">
                <p className="text-gray-700">✓ Verified Seller</p>

                <p className="text-gray-500">Member since 2023</p>
              </div>

              <button className="w-full mt-4 border rounded-lg py-2 hover:bg-gray-100 transition">
                View Profile
              </button>
            </div>

            {/* Safety Tips */}
            <div className="bg-blue-50 rounded-xl p-5 mt-6">
              <h3 className="font-semibold text-blue-800 mb-2">Safety Tips</h3>

              <ul className="text-sm text-blue-700 space-y-2">
                <li>• Meet in public places.</li>
                <li>• Verify the item before payment.</li>
                <li>• Avoid advance payments.</li>
                <li>• Do not share sensitive information.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductDetails;
