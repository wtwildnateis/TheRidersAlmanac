import { useRef } from "react";
import Navbar from "../../components/Navbar/Navbar";
import TitleHero from "./TitleHero";

export default function Landing() {
  const navRef = useRef(null);
  const scrollToNav = () => navRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <main className="bg-black text-white">
      <TitleHero onClick={scrollToNav} />
      <div ref={navRef} className="sticky top-0 z-50">
        <Navbar />
      </div>
    </main>
  );
}