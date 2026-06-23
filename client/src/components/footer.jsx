function Footer() {
  return (
    <div className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-10 py-12 grid grid-cols-4 gap-8">
        <div>
          <h2 className="text-2xl font-bold text-blue-400">ZELLERS</h2>

          <p className="mt-4 text-gray-400">
            Buy and sell products locally with ease. Discover amazing deals from
            trusted sellers.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-4">Quick Links</h3>

          <ul className="space-y-2 text-gray-400">
            <li>Home</li>
            <li>Categories</li>
            <li>Sell Item</li>
            <li>Featured Products</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-4">Support</h3>

          <ul className="space-y-2 text-gray-400">
            <li>Help Center</li>
            <li>Contact Us</li>
            <li>FAQs</li>
            <li>Terms & Conditions</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-4">Contact</h3>

          <ul className="space-y-2 text-gray-400">
            <li>support@zellers.com</li>
            <li>+91 9876543210</li>
            <li>Kochi, Kerala</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-700 py-4 text-center text-gray-400">
        © 2025 Zellers. All rights reserved.
      </div>
    </div>
  );
}

export default Footer;
