"use client";

import CircularFade from "@/components/CircularFade";
import Link from "next/link";
import { useState } from "react";

// import MatrixGrid from './components/MatrixGrid';

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main
      className="
        relative
        w-full
        min-h-screen
        overflow-hidden
        text-gray-900
        font-sans
      "
      style={{ fontFamily: 'var(--font-neutrino), sans-serif' }}
    >
      {/* Background Design Components (Behind everything) */}
      {/* <MatrixGrid /> */}

      <CircularFade />

      <div
        className="
          absolute
          lg:top-[-45%] 
          md:top-[-30%]
          top-[-15%]
          right-0
          w-[60vw]
          z-0
          transform
          rotate-90
        "
        style={{ height: 'auto' }}
      >
        <img
          src="logo.svg"
          alt="Abstract"
          className="w-full h-auto"
        />
      </div>

      <header
        className="
          relative
          z-10
          flex
          items-center
          justify-between
          py-5
          px-5
          md:px-10
          lg:px-20
          mb-[50px]
        "
      >
        <div
          className="text-left text-4xl cursor-pointer font-bold"
          style={{ fontFamily: 'var(--font-neutrino), sans-serif' }}
        >
          neutrino
        </div>

        <nav className="hidden lg:flex space-x-10 text-base">
          <a href="#" className="hover:underline">
            Github
          </a>
          <a href="/neutrino-test" className="hover:underline">
            Get Started
          </a>
          <a
            href="#"
            className="
              px-2
              border
              border-black
              rounded-[4px]
            "
          >
            Stars
          </a>
        </nav>

        <div className="lg:hidden">
          <button
            className="
              p-2
              rounded-md
              hover:bg-white
            "
            aria-label="Open Menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </header>

      <div
        className="
          relative
          z-10
          w-full
          flex
          flex-wrap
          px-5
          md:px-10
          lg:px-20
          mb-15
        ">

        <div className="w-full flex flex-col lg:flex-row">
          <h1
            className="
              w-full
              lg:w-1/2
              text-6xl
              md:text-8xl
              lg:text-9xl
              font-bold
              mb-8
              lg:mb-12
              ">
            Your AI QA Engineer.
          </h1>
          <div className="w-full lg:w-1/2"></div>
          <p className="w-full lg:w-1/2 text-2xl md:text-4xl mb-8 lg:mb-12 text-black md:text-right font-medium">
            Neutrino is the end-to-end platform for your testing app.
          </p>
        </div>

        <Link href="/neutrino-test">
          <button
            className="
                bg-black
                text-white
                py-3
                px-4
                rounded-[8px]
                hover:opacity-90
                w-fit
                text-base
              ">
            Get started
          </button>
        </Link>

      </div>
    </main>
  );
}
