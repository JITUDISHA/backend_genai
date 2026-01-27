import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Spotlight } from "@/components/ui/spotlight";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { Bokor } from 'next/font/google';

const boko_font = Bokor({
  subsets: ['latin'],
  weight: "400",
  variable: "--font-bokor",
});

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect('/chat');
  }

  return (
    /* MAIN DIV: 'h-screen' locks the height to exactly the window size.
       'flex-col' stacks the children vertically.
       'overflow-hidden' prevents the browser's 2nd scrollbar.
    */
    <div className={`${boko_font.variable} h-screen w-full bg-[#8B2510] relative flex flex-col overflow-hidden text-white selection:bg-[#EBB048] selection:text-[#8B2510]`}>

      {/* --- BACKGROUND LAYERS (Fixed behind content) --- */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-[#9e3a22] via-[#8B2510] to-[#5a1608] z-0" />
      <div className="absolute inset-0 z-[1] opacity-20 bg-[radial-gradient(#ffffff_2px,transparent_2px)] [background-size:24px_24px] pointer-events-none" />
      <div className="fixed inset-0 opacity-[0.05] z-[2] pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />
      <Spotlight className="-top-20 left-0 md:left-20 z-[3]" fill="white" />

      {/* --- 1. NAVBAR (Top of Main Div) --- */}
      <header className="relative z-50 w-full px-4 pt-6 pb-2 shrink-0">
        <div className="max-w-7xl mx-auto bg-[#8B2510]/90 backdrop-blur-sm border-2 border-black rounded-xl px-4 md:px-6 py-3 flex justify-between items-center shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-[#EBB048] border-2 border-black rounded-lg flex items-center justify-center shadow-[3px_3px_0_0_#000]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl md:text-2xl pt-1 text-white tracking-tighter" style={{ fontFamily: 'var(--font-bokor)' }}>
              Post<span className="text-[#EBB048]">Pilot</span>
            </span>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <Link href="/sign-in">
              <button className="px-4 md:px-6 py-2 bg-white text-black font-black border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transition-all uppercase text-[10px] md:text-xs">Login</button>
            </Link>
            <Link href="/sign-up">
              <button className="px-4 md:px-6 py-2 bg-[#ff5f2e] text-white font-black border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transition-all uppercase text-[10px] md:text-xs">Join Free</button>
            </Link>
          </div>
        </div>
      </header>

      {/* --- SCROLLABLE CONTENT AREA (Hero + Cards) --- */}
      {/* 'flex-1' makes this fill the space between Nav and Footer. 
          'overflow-y-auto' creates ONE clean scrollbar here. */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 w-full">

        <main className="max-w-[1400px] mx-auto w-full px-4 md:px-8 lg:px-16">

          {/* --- 2. HERO SECTION --- */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center py-12 md:py-10">
            <div className="order-2 lg:order-1 relative flex justify-center items-center group">
              <div className="absolute w-[250px] h-[250px] lg:w-[480px] lg:h-[480px] bg-[#EBB048] rounded-full blur-3xl opacity-30 transition-transform duration-500 group-hover:scale-110" />
              <div className="relative z-10 w-full max-w-[420px] aspect-[3/4] bg-[#af005e] rounded-t-full rounded-b-[2.5rem] border-dashed border-4 border-[#e0f374] shadow-[20px_20px_0px_0px_rgba(0,0,0,0.4)] overflow-hidden transition-all duration-500 group-hover:shadow-[30px_30px_0px_0px_rgba(0,0,0,0.3)]">
                <video
                  autoPlay loop muted playsInline
                  className="w-full h-full object-cover grayscale contrast-[1.2] brightness-[0.9] transition-all duration-700 group-hover:grayscale-0 group-hover:contrast-100"
                >
                  <source src="https://res.cloudinary.com/dlrhikaak/video/upload/v1769184044/Video_Generation_From_GIF_Request_ocllix.mp4" type="video/mp4" />
                </video>
              </div>
            </div>

            <div className="order-1 lg:order-2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
              <h1 className="text-6xl md:text-7xl lg:text-[5.5rem] font-black text-white leading-[0.9] tracking-tighter drop-shadow-xl">
                Take your <br className="hidden lg:block" />
                designs to <br className="hidden lg:block" />
                <span className="text-[#EBB048] italic">the next level</span>
              </h1>
              <div className="max-w-lg border-l-0 lg:border-l-4 border-[#EBB048] lg:pl-8 py-2">
                <TextGenerateEffect
                  words="Experience real-time messaging that feels natural. Designed for creators, built for speed, and styled for you."
                  className="text-lg md:text-2xl font-medium text-white/90 leading-relaxed"
                />
              </div>
              <Link href="/sign-up">
                <button className="px-12 py-5 bg-[#EBB048] text-black font-black text-xl border-2 border-black rounded-2xl shadow-[8px_8px_0px_0px_#000] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all uppercase italic tracking-tighter">
                  Explore Now
                </button>
              </Link>
            </div>
          </section>

          {/* --- 3. CARD SECTION --- */}
          <section className="py-20">
            <div className="flex items-center gap-4 mb-16">
              <div className="h-[2px] flex-1 bg-white/20"></div>
              <h2 className="text-3xl font-black text-white uppercase italic tracking-widest" style={{ fontFamily: 'var(--font-bokor)' }}>
                Our Services
              </h2>
              <div className="h-[2px] flex-1 bg-white/20"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { t: "Instant Sync", d: "Messages delivered in under 100ms across global edges.", icon: "⚡" },
                { t: "Secure Core", d: "Military grade AES-256 bit encryption as standard.", icon: "🔐" },
                { t: "Open API", d: "Build your own custom integrations effortlessly.", icon: "🛠️" }
              ].map((item, i) => (
                <div key={i} className="group bg-black/30 backdrop-blur-md border-2 border-black p-8 rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] hover:bg-[#EBB048] transition-all duration-300 transform hover:-translate-y-2">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
                  <h3 className="text-2xl font-black mb-3 uppercase tracking-tighter text-[#EBB048] group-hover:text-black">{item.t}</h3>
                  <p className="text-sm md:text-base opacity-80 font-medium group-hover:text-black/80">{item.d}</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>

{  /* - py-2: Minimum vertical padding for a "strip" look.
      - mt-auto: Ensures it stays at the bottom of the content flow.
      - border-t-2: Maintains the Neo-Brutalism border style.
      */ }
      <footer className="relative z-20 w-full shrink-0 border-t-2 border-black bg-[#5a1608]/95 backdrop-blur-xl mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-2 flex flex-col md:flex-row justify-between items-center gap-4">

          {/* Left Section: Branding */}
          <div className="flex items-center gap-3">
            <span className="text-lg font-black text-white" style={{ fontFamily: 'var(--font-bokor)' }}>
              Post<span className="text-[#EBB048]">Pilot</span>
            </span>
            <span className="hidden md:block h-4 w-[1px] bg-white/20"></span>
            <span className="text-white/40 text-[9px] font-bold tracking-[0.2em] uppercase">
              © 2026 C.dOT Protocol
            </span>
          </div>

          {/* Center Section: Links */}
          <div className="flex gap-6 text-[9px] font-black uppercase tracking-widest text-white/60">
            <Link href="#" className="hover:text-[#EBB048] transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-[#EBB048] transition-colors">Terms</Link>
            <Link href="#" className="hover:text-[#EBB048] transition-colors">Contact</Link>
          </div>

          {/* Right Section: Credit */}
          <div className="flex items-center gap-2">
            <span className="text-[#EBB048] font-black tracking-[0.1em] uppercase text-[9px] gap-0.5" style={{ fontFamily: 'var(--font-bokor)' }}>
              Crafted by<div className="h-0.5 w-12 bg-[#EBB048] rounded-full"></div> <h1 className=' font-mono text-[12px]' >DIsha</h1>
            </span>
            
          </div>

        </div>
      </footer>
    </div>
  );
}