function Navbar() {
  return (
    <nav className="bg-brown-100 border-b border-brown-300 px-6 w-full h-[48px] lg:h-[80px] lg:px-20 ">
      <div className=" mx-auto flex justify-between items-center h-full">
        {/* Logo */}
        <div className=" text-2xl font-semibold lg:w-[44px] md:h-[44px] flex items-center justify-center">
          <span className="text-brown-600">hh</span>
          <span className="text-green text-2xl">.</span>
        </div>

        {/* Desktop Menu - Log in & Sign up */}
        <div className="hidden lg:flex gap-3 items-center">
          <button className="bg-white border border-brown-600 text-brown-600 px-6 py-2 rounded-4xl text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-brown-100 hover:border-brown-500 w-[127px] h-[48px]">
            Log in
          </button>
          <button className="bg-brown-600 border-none text-white px-6 py-2 rounded-4xl text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-brown-500 w-[127px] h-[48px]">
            Sign up
          </button>
        </div>

        {/* Mobile Hamburger Menu */}
        <button
          className="lg:hidden flex flex-col gap-1 items-center justify-center p-3 bg-transparent border-none cursor-pointer"
          aria-label="Menu"
        >
          <span className="w-6 h-0.5 bg-brown-600 rounded-sm transition-all duration-300"></span>
          <span className="w-6 h-0.5 bg-brown-600 rounded-sm transition-all duration-300"></span>
          <span className="w-6 h-0.5 bg-brown-600 rounded-sm transition-all duration-300"></span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
