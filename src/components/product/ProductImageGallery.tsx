'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

const FALLBACK =
  'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1200&auto=format&fit=crop';

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const all = images.length > 0 ? images : [FALLBACK];
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div
        className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-100 cursor-zoom-in"
        onClick={() => setZoomed(true)}
      >
        <Image
          key={active}
          src={all[active]}
          alt={`${productName} — ${active + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 hover:scale-105"
          priority
        />
      </div>

      {/* Thumbnails — horizontal row */}
      {all.length > 1 && (
        <div className="flex gap-3">
          {all.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative flex-1 aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                i === active
                  ? 'border-neutral-900 opacity-100'
                  : 'border-transparent opacity-60 hover:opacity-80'
              }`}
            >
              <Image
                src={src}
                alt={`${productName} thumbnail ${i + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {zoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6 cursor-zoom-out"
          onClick={() => setZoomed(false)}
        >
          <div className="relative w-full max-w-2xl aspect-[3/4]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={all[active]}
              alt={`${productName} zoomed`}
              fill
              sizes="100vw"
              className="object-contain rounded-2xl"
            />
            <button
              onClick={() => setZoomed(false)}
              className="absolute top-3 right-3 bg-white/20 text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-white/40 transition text-lg"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
