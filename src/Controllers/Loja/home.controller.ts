import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@model/product.model";
import type { Testimonial } from "@model/testimonial.model";
import { listProducts } from "@repo/product.repository";
import { listTestimonials } from "@repo/testimonial.repository";
import { useCartStore } from "@state/cart.store";
import { useUIStore } from "@state/ui.store";

export const sections = [
  { id: "home", label: "Início" },
  { id: "features", label: "Benefícios" },
  { id: "products", label: "Produtos" },
  { id: "testimonials", label: "Clientes" },
  { id: "newsletter", label: "Novidades" }
] as const;

export function useHomeController() {
  const [products, setProducts] = useState<Product[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [email, setEmail] = useState("");
  const [active, setActive] = useState<string>("home");

  // stores
  const wishlistCount = useCartStore((s) => s.wishlistCount);
  const addWish = useCartStore((s) => s.addWish);
  const addItem = useCartStore((s) => s.addItem);
  const totalQty = useCartStore((s) => s.totalQty);

  const menuOpen = useUIStore((s) => s.menuOpen);
  const setMenuOpen = useUIStore((s) => s.setMenuOpen);

  // carregar dados
  useEffect(() => {
    let alive = true;
    (async () => {
      const [p, t] = await Promise.all([listProducts(), listTestimonials()]);
      if (!alive) return;
      setProducts(p);
      setTestimonials(t);
    })();
    return () => {
      alive = false;
    };
  }, []);

  // refs para seções
  const mapRefs = useRef<Record<string, HTMLElement | null>>({});
  const refCb = useMemo(
    () =>
      sections.reduce<Record<string, (el: HTMLElement | null) => void>>((acc, s) => {
        acc[s.id] = (el) => {
          mapRefs.current[s.id] = el;
        };
        return acc;
      }, {}),
    []
  );

  // navegação suave
  const HEADER_H = 72;
  const smoothScrollTo = (id: string) => {
    const el = mapRefs.current[id];
    if (!el) return;
    const top = el.offsetTop - HEADER_H;
    window.scrollTo({ top, behavior: "smooth" });
    setMenuOpen(false);
  };

  // link ativo por interseção
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const v = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (v?.target && (v.target as HTMLElement).id)
          setActive((v.target as HTMLElement).id);
      },
      { rootMargin: `-${HEADER_H + 1}px 0px -60% 0px`, threshold: [0.3, 0.6] }
    );
    Object.values(mapRefs.current).forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  // autoplay depoimentos
  useEffect(() => {
    if (!testimonials.length) return;
    const it = setInterval(
      () => setCurrentTestimonial((p) => (p + 1) % testimonials.length),
      6000
    );
    return () => clearInterval(it);
  }, [testimonials.length]);

  // lista filtrada
  const list = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return !q ? products : products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, searchQuery]);

  // ações
  const addCart = (id: number) => {
    const p = products.find((x) => x.id === id);
    if (!p || !p.inStock) return;
    addItem({ productId: p.id, name: p.name, price: p.price, image: p.image }, 1);
  };

  return {
    // dados
    products,
    testimonials,

    // contadores derivados
    cartCount: totalQty,
    wishlistCount,

    // estado local
    searchQuery,
    currentTestimonial,
    email,
    active,
    menuOpen,

    // setters
    setSearchQuery,
    setCurrentTestimonial,
    setEmail,
    setMenuOpen,

    // refs e navegação
    refCb,
    smoothScrollTo,

    // derivados e ações
    list,
    addCart,
    addWish,

    sections,
  };
}
