// Named quotes for the landing page. The proof strip and testimonial
// section stay hidden while this list is empty; small or anonymous proof
// reads worse than none. Add entries only with the person's permission.

export type Testimonial = {
  quote: string;
  name: string;
  role: string; // e.g. "Product designer, Acme"
  url?: string; // optional link to the person
};

export const TESTIMONIALS: Testimonial[] = [];
