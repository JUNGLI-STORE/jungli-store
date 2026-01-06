"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ProductCard from "./ProductCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";

export default function RelatedSlider({ currentProductId }: { currentProductId: string }) {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAllDrops() {
      // Fetch up to 15 shoes to keep the infinite loop visually full
      const { data } = await supabase
        .from("products")
        .select("*")
        .neq("id", currentProductId) // Don't show the shoe currently on screen
        .limit(15);

      if (data) setProducts(data);
    }
    if (currentProductId) fetchAllDrops();
  }, [currentProductId]);

  if (products.length === 0) return null;

  return (
    <section className="bg-jungli-green py-24 border-y-8 border-black sawtooth overflow-hidden relative">
      {/* Decorative background stripes */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[repeating-linear-gradient(45deg,transparent,transparent_40px,rgba(0,0,0,0.1)_40px,rgba(0,0,0,0.1)_80px)]"></div>

      <div className="max-w-[100vw] relative z-10">
        <h2 className="text-5xl md:text-8xl font-[1000] uppercase italic tracking-tighter text-white mb-16 text-center px-6 leading-none">
          KEEP <span className="text-yellow-400 underline decoration-black decoration-8 underline-offset-[-4px]">HUNTING</span>
        </h2>

        <Swiper
          slidesPerView={1.2}
          spaceBetween={20}
          loop={products.length > 5} // Only loop if we have enough items
          freeMode={true}
          autoplay={{
            delay: 0, // 0 delay for continuous movement
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          speed={6000} // Speed of the marquee crawl (higher = slower)
          modules={[Autoplay, FreeMode]}
          breakpoints={{
            640: { slidesPerView: 2.2, spaceBetween: 30 },
            1024: { slidesPerView: 4.2, spaceBetween: 40 },
          }}
          className="product-swiper"
        >
          {products.map((item) => {
            // THE CRITICAL SAFETY CHECK:
            if (!item || !item.id) return null;

            return (
              <SwiperSlide key={item.id} className="py-10">
                <div className="hover:scale-105 transition-transform duration-500">
                  <ProductCard
                    id={item.id}
                    name={item.name}
                    brand={item.brand}
                    luxuryPrice={item.luxury_price}
                    jungliPrice={item.jungli_price}
                    image={item.image_url}
                    tag={item.tag}
                    is_available={item.is_available} // Ensures 'Sold Out' shows in slider
                  />
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      <style jsx global>{`
        /* This CSS ensures the slider moves like a smooth continuous belt */
        .product-swiper .swiper-wrapper {
          transition-timing-function: linear !important;
          display: flex;
        }
        /* Custom scrollbar for desktop browsing */
        .product-swiper {
          cursor: grab;
        }
        .product-swiper:active {
          cursor: grabbing;
        }
      `}</style>
    </section>
  );
}