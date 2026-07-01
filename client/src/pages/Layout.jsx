import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { useState } from "react";
import { Outlet } from "react-router-dom";

function Layout() {
  const [searchTerm, setSearchTerm] = useState("");
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <main className="flex-grow pt-28 lg:pt-24 pb-12">
        <Outlet context={{ searchTerm, setSearchTerm }} />
      </main>

      <Footer />
    </div>
  );
}
export default Layout;
