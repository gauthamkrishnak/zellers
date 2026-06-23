function Hero() {
  return (
    <div className="mx-4 md:mx-8 lg:mx-10 mt-8 rounded-md bg-linear-to-r from-blue-600 to-blue-500">
      <div className="flex items-center justify-between px-6 md:px-10 lg:px-16 py-12 md:py-16 lg:py-20">
        <div>
          <h1 className="text-white text-3xl md:text-5xl lg:text-6xl font-bold max-w-xl">
            Discover your next favourite item
          </h1>

          <p className="text-blue-100 text-base md:text-lg lg:text-xl mt-6 max-w-lg">
            Browse millions of quality listings from trusted sellers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button className="bg-white text-blue-600 font-semibold px-6 md:px-8 py-3 md:py-4 rounded-xl cursor-pointer hover:scale-105 transition">
              Explore Now
            </button>

            <button className="border border-white text-white px-6 md:px-8 py-3 md:py-4 rounded-xl cursor-pointer hover:scale-105 transition">
              How it Works
            </button>
          </div>
        </div>

        {/* Future Hero Image */}
        {/* 
        <img
          src="/marketplace.png"
          alt="Marketplace"
          className="hidden lg:block w-96"
        />
        */}
      </div>
    </div>
  );
}

export default Hero;
