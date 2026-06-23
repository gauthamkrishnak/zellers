function Navbar({ searchTerm, setSearchTerm }) {
  return (
    <>
      <div className="bg-white flex flex-col lg:flex-row px-4 md:px-8 py-4 items-center gap-3.5 shadow-2xl">
        <h1 className="font-bold text-blue-600 text-3xl md:text-5xl">
          Zellers
        </h1>

        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-2 border-blue-500 py-2 px-4 rounded-md w-full md:w-80 lg:w-96"
        />

        <button className="px-5 py-2 border bg-blue-500 text-white rounded-md cursor-pointer hover:scale-105 transition w-full md:w-auto">
          Search
        </button>

        <div className="flex flex-wrap justify-center items-center gap-4 lg:ml-auto">
          <button className="cursor-pointer hover:scale-105 transition">
            Mobiles
          </button>

          <button className="cursor-pointer hover:scale-105 transition">
            Vehicles
          </button>

          <button className="cursor-pointer hover:scale-105 transition">
            Fashion
          </button>

          <button className="cursor-pointer hover:scale-105 transition">
            <img src="/heart-duotone.svg" alt="Wishlist" />
          </button>

          <button className="cursor-pointer hover:scale-105 transition">
            <img src="/bell.svg" alt="Notifications" />
          </button>
        </div>

        <button className="bg-white rounded-full px-6 py-2 font-bold text-blue-700 shadow-md border border-blue-700 cursor-pointer hover:scale-105 transition w-full md:w-auto">
          + SELL
        </button>
      </div>
    </>
  );
}

export default Navbar;
