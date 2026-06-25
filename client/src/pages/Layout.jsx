import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { useState } from "react";
import { Outlet } from "react-router-dom";

function Layout() {
  const [searchTerm, setSearchTerm] = useState("");
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <main className="flex-grow">
        <Outlet context={{ searchTerm, setSearchTerm }} />
      </main>

      <Footer />
    </div>
  );
}
export default Layout;
