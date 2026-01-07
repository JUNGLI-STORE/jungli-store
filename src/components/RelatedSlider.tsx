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
      // Fetch up to 15 shoes to keep the loop visually full
      const { data } = await supabase
        .from("products")
        .select("*")
        .neq("id", currentProductId)
        .limit(15);

      if (data) setProducts(data);
    }
    if (currentProductId) fetchAllDrops();
  }, [currentProductId]);

  if (products.length === 0) return null;

  return (
    <section className="bg-jungli-green py-20 border-y-8 border-black sawtooth overflow-hidden relative">
      {/* 1. CONTAINER: Now constrained to max-width so it doesn't feel bulky */}
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* 2. REFINED TYPOGRAPHY: Scaled down from 8xl to 6xl for better balance */}
        <h2 className="text-4xl md:text-6xl font-[1000] uppercase italic tracking-tighter text-white mb-12 text-center leading-none">
          KEEP <span className="text-yellow-400 underline decoration-black decoration-4 underline-offset-4">HUNTING</span>
        </h2>

        <Swiper
          // 3. REFINED CARD SIZING: Increased slidesPerView to make cards smaller
          slidesPerView={1.3}
          spaceBetween={15}
          loop={products.length > 5}
          freeMode={true}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          speed={7000} // Slightly slower for a more premium feel
          modules={[Autoplay, FreeMode]}
          breakpoints={{
            // Tablet: show 3 cards
            640: { slidesPerView: 2.5, spaceBetween: 20 },
            // Desktop: show 4 cards
            1024: { slidesPerView: 4, spaceBetween: 25 },
            // Large Desktop: show 5 cards (keeps cards small and sharp)
            1280: { slidesPerView: 4.5, spaceBetween: 30 },
          }}
          className="product-swiper"
        >
          {products.map((item) => {
            if (!item || !item.id) return null;

            return (
              <SwiperSlide key={item.id} className="py-6">
                {/* Scale effect is now subtle to avoid the 'zoomed' look */}
                <div className="scale-95 hover:scale-100 transition-transform duration-300">
                  <ProductCard
                    id={item.id}
                    name={item.name}
                    brand={item.brand}
                    luxuryPrice={item.luxury_price}
                    jungliPrice={item.jungli_price}
                    image={item.image_url}
                    tag={item.tag}
                    is_available={item.is_available}
                  />
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      <style jsx global>{`
        /* Perfectly linear movement for the 'conveyor belt' effect */
        .product-swiper .swiper-wrapper {
          transition-timing-function: linear !important;
          display: flex;
        }
        
        /* Clean grab cursor */
        .product-swiper {
          cursor: grab;
          padding-bottom: 20px;
        }
        .product-swiper:active {
          cursor: grabbing;
        }
      `}</style>
    </section>
  );
}