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
      // Fetch 15 random available shoes to keep the loop fresh
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_available", true)
        .neq("id", currentProductId) // Don't show the shoe they are currently viewing
        .limit(15);

      if (data) setProducts(data);
    }
    fetchAllDrops();
  }, [currentProductId]);

  if (products.length === 0) return null;

  return (
    <section className="bg-jungli-green py-24 border-y-8 border-black sawtooth overflow-hidden">
      <div className="max-w-[100vw]">
        <h2 className="text-5xl md:text-7xl font-[1000] uppercase italic tracking-tighter text-white mb-16 text-center px-6">
          KEEP <span className="text-yellow-400 underline decoration-8 decoration-black">HUNTING</span>
        </h2>

        <Swiper
          slidesPerView={1.5}
          spaceBetween={20}
          loop={true}
          freeMode={true}
          autoplay={{
            delay: 1,
            disableOnInteraction: false,
          }}
          speed={5000} // Slow, smooth continuous crawl
          modules={[Autoplay, FreeMode]}
          breakpoints={{
            640: { slidesPerView: 2.5, spaceBetween: 30 },
            1024: { slidesPerView: 4.5, spaceBetween: 40 },
          }}
          className="product-swiper"
        >
          {products.map((item) => (
            <SwiperSlide key={item.id} className="py-10">
              <div className="hover:rotate-2 transition-transform duration-300">
                <ProductCard
                  id={item.id}
                  name={item.name}
                  brand={item.brand}
                  luxuryPrice={item.luxury_price}
                  jungliPrice={item.jungli_price}
                  image={item.image_url}
                  tag={item.tag}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        /* This makes the slider move continuously like a marquee */
        .product-swiper .swiper-wrapper {
          transition-timing-function: linear !important;
        }
      `}</style>
    </section>
  );
}