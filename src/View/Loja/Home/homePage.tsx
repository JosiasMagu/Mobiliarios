import React from "react";
import { useHomeController } from "@controller/Loja/home.controller";
import { Navbar } from "@comp/home/Navbar";
import { Hero } from "@comp/home/Hero";
import { Features } from "@comp/home/Features";
import { ProductGrid } from "@comp/home/ProductGrid";
import { Testimonials } from "@comp/home/Testimonials";
import { TrustBar } from "@comp/home/TrustBar";
import { Newsletter } from "@comp/home/Newsletter";
import { Footer } from "@comp/home/Footer";

const MobiliarioHomePage: React.FC = () => {
  const {
    testimonials,
    cartCount,
    wishlistCount,
    searchQuery,
    currentTestimonial,
    email,
    active,
    menuOpen,
    setSearchQuery,
    setCurrentTestimonial,
    setEmail,
    setMenuOpen,
    refCb,
    smoothScrollTo,
    list,
    addCart,
    addWish,
    sections,
  } = useHomeController();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar
        sections={sections}
        active={active}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        smoothScrollTo={smoothScrollTo}
      />

      <div ref={refCb["home"] as any}>
        <Hero smoothScrollTo={smoothScrollTo} />
      </div>

      <div ref={refCb["features"] as any}>
        <Features />
      </div>

      <div ref={refCb["products"] as any}>
        <ProductGrid
          list={list}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onAddCart={addCart}
          onAddWish={addWish}
        />
      </div>

      <div ref={refCb["testimonials"] as any}>
        <Testimonials
          testimonials={testimonials}
          current={currentTestimonial}
          setCurrent={setCurrentTestimonial}
        />
      </div>

      <TrustBar />
      <div ref={refCb["newsletter"] as any}>
        <Newsletter email={email} setEmail={setEmail} />
      </div>
      <Footer />
    </div>
  );
};

export default MobiliarioHomePage;
