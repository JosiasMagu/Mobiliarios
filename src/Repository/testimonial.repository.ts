import type { Testimonial } from "@model/testimonial.model";
import testimonials from "@data/testimonial.mock.json";

const DB = testimonials as Testimonial[];

export async function listTestimonials(): Promise<Testimonial[]> {
  return DB;
}
