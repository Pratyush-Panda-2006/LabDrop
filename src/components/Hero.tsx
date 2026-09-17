import React from 'react';
import { VaultMode } from '../types';

interface HeroProps {
  mode: VaultMode;
}

export const Hero: React.FC<HeroProps> = ({ mode }) => {
  return (
    <div className="flex flex-col items-center justify-center pt-8 pb-4 max-md:pt-4">
      {/* Dynamic Headline */}
      <h1 className="font-sans text-[clamp(40px,6vw,68px)] font-medium text-vault-text leading-[1.05] tracking-[-0.04em] max-w-[820px] mb-5 text-center transition-all duration-300">
        {mode === 'upload' ? 'Drop your lab notebook safely.' : 'Retrieve your code at hostel.'}
      </h1>

      {/* Subtitle */}
      <p className="font-sans text-xl font-medium text-vault-muted leading-relaxed max-w-[550px] mb-8 text-center px-4">
        {mode === 'upload'
          ? 'Zero personal login risks on public lab computers. Securely vault your .ipynb files and unlock them anytime with your master PIN.'
          : 'Instant decryption and download with your 6-digit master PIN. Your code is ready right where you left off.'}
      </p>
    </div>
  );
};
