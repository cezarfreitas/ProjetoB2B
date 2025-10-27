'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import HeroSlider from '@/components/HeroSlider'
import ProductShelf from '@/components/ProductShelf'
import SEO from '@/components/SEO'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SEO />
      <Header />

      {/* Hero Slider */}
      <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
        <HeroSlider />
      </section>

      {/* Product Shelves */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Produtos em Destaque */}
        <ProductShelf 
          title="Produtos em Destaque" 
          subtitle="Confira nossas ofertas especiais"
          limit={5}
        />

        {/* Lançamentos */}
        <ProductShelf 
          title="Lançamentos" 
          subtitle="Novidades que acabaram de chegar"
          limit={5}
        />
      </section>


      {/* Footer */}
      <Footer />
    </div>
  );
}
