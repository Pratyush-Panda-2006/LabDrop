import { useState, useRef, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { VaultMode } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { LiquidGlassCard } from './components/LiquidGlassCard';
import { Dashboard } from './pages/Dashboard';

const LinkedinIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64a1.66 1.66 0 1 0 0 3.32 1.66 1.66 0 0 0 0-3.32Z"/>
  </svg>
);


function LabDropHome() {
  const [mode, setMode] = useState<VaultMode>('upload');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Ensure mobile browsers (iOS Safari / Android Chrome) autoplay muted video
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If low-power mode or battery-saver blocks video autoplay,
          // the CSS poster background image remains instantly visible.
        });
      }
    }
  }, []);

  return (
    <section
      className="relative min-h-svh w-full overflow-hidden bg-[#ebe6df] bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url(/bg-poster.webp)',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
    >
      {/* Looping Background Video (z-0) with faststart streaming */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/bg-poster.webp"
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source
          src="https://zjskhqgggcnvtzkurolh.supabase.co/storage/v1/object/public/lab-notebooks/assets/bg-loop.mp4"
          type="video/mp4"
        />
        <source
          src="https://pollen-batch-41236914.figma.site/_components/v2/f0ee2dae7671c170c34f12e31c4cb41418976c98/769c564298c132f7919405cd9f17c1b1231f341d.769c5642.mp4"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>

      {/* Top Gradient Overlay (z-1) */}
      <div
        className="absolute inset-x-0 top-0 h-[687px] pointer-events-none z-[1]"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
        }}
      />

      {/* Content wrapper (z-2) */}
      <div className="relative z-[2] max-w-[1360px] mx-auto min-h-svh flex flex-col justify-between py-2">
        {/* Navigation Bar */}
        <Navbar mode={mode} onModeChange={setMode} />

        {/* Hero & Interactive Liquid-Glass Card Section */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-md:py-4">
          <Hero mode={mode} />
          <LiquidGlassCard mode={mode} onModeSwitch={setMode} />
        </main>

        {/* Footer showing only creator name and accounts */}
        <footer className="w-full px-6 py-4 flex items-center justify-center text-xs text-vault-muted border-t border-black/5 bg-white/20 backdrop-blur-md rounded-t-2xl">
          <div className="flex items-center gap-4">
            <span className="font-sans font-medium text-vault-dark text-sm">
              Created by <span className="font-semibold">Pratyush Panda</span>
            </span>

            <div className="flex items-center gap-2">
              <a
                href="https://www.linkedin.com/in/pratyush-panda2006"
                target="_blank"
                rel="noopener noreferrer"
                title="Pratyush Panda on LinkedIn"
                className="w-8 h-8 rounded-full bg-white/70 hover:bg-white border border-black/10 flex items-center justify-center text-[#0A66C2] hover:scale-110 active:scale-95 transition-all shadow-sm"
              >
                <LinkedinIcon />
              </a>

            </div>
          </div>
        </footer>
      </div>
    </section>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LabDropHome />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
