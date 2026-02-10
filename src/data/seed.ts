import { supabase } from '../lib/supabase';
import caterersData from './caterers.json';
import menusData from './menus.json';

const reviews = [
  { caterer_id: 'cat-001', overall: 5, taste: 5, service: 5, value: 4, cleanliness: 5, text: 'Absolutely amazing food! The tandoor station was a hit at our wedding.' },
  { caterer_id: 'cat-001', overall: 4, taste: 5, service: 4, value: 4, cleanliness: 5, text: 'Great flavors. Service was prompt. Would recommend for large events.' },
  { caterer_id: 'cat-001', overall: 5, taste: 5, service: 5, value: 5, cleanliness: 5, text: 'Best caterer we have used. Everything was perfect!' },
  { caterer_id: 'cat-002', overall: 5, taste: 5, service: 4, value: 5, cleanliness: 5, text: 'Loved the banana leaf setup! Authentic South Indian flavors.' },
  { caterer_id: 'cat-002', overall: 4, taste: 4, service: 4, value: 5, cleanliness: 4, text: 'Good value for money. Filter coffee was excellent.' },
  { caterer_id: 'cat-003', overall: 4, taste: 5, service: 4, value: 4, cleanliness: 5, text: 'The pasta counter was incredible. Very professional team.' },
  { caterer_id: 'cat-003', overall: 5, taste: 5, service: 5, value: 4, cleanliness: 5, text: 'Outstanding multi-cuisine spread. Guests were thrilled!' },
  { caterer_id: 'cat-004', overall: 4, taste: 4, service: 4, value: 5, cleanliness: 4, text: 'Simple, honest food. Perfect for our housewarming.' },
  { caterer_id: 'cat-005', overall: 5, taste: 5, service: 5, value: 4, cleanliness: 5, text: 'Luxury dining experience. Worth every penny.' },
  { caterer_id: 'cat-005', overall: 5, taste: 5, service: 5, value: 5, cleanliness: 5, text: 'The truffle risotto was to die for. Best caterer in Mumbai!' },
  { caterer_id: 'cat-005', overall: 5, taste: 5, service: 5, value: 4, cleanliness: 5, text: 'Michelin-quality food at our corporate event. Impressed everyone.' },
  { caterer_id: 'cat-006', overall: 5, taste: 5, service: 4, value: 5, cleanliness: 4, text: 'The biryani was phenomenal! Authentic Old Delhi taste.' },
  { caterer_id: 'cat-006', overall: 4, taste: 5, service: 4, value: 5, cleanliness: 4, text: 'Kebabs were melting in mouth. Great for non-veg lovers.' },
  { caterer_id: 'cat-008', overall: 5, taste: 5, service: 4, value: 5, cleanliness: 4, text: 'Best Hyderabadi biryani we have ever had at an event.' },
  { caterer_id: 'cat-008', overall: 4, taste: 5, service: 4, value: 5, cleanliness: 4, text: 'The dum biryani was cooked to perfection. Highly recommend!' },
  { caterer_id: 'cat-009', overall: 4, taste: 4, service: 5, value: 4, cleanliness: 5, text: 'Super trendy setup! Perfect for our startup party.' },
  { caterer_id: 'cat-010', overall: 5, taste: 5, service: 5, value: 5, cleanliness: 5, text: 'The chaat counter was a highlight. Amazing vegetarian spread.' },
  { caterer_id: 'cat-010', overall: 4, taste: 5, service: 4, value: 5, cleanliness: 5, text: 'Modern take on classic dishes. Very creative menu.' },
];

export async function seedDatabase() {
  try {
    // Seed caterers
    for (const caterer of caterersData) {
      const { error } = await supabase
        .from('caterers')
        .upsert(caterer, { onConflict: 'id' });
      if (error) console.error('Error seeding caterer:', caterer.name, error);
    }

    // Seed menu categories and items
    const menus = menusData as Record<string, { categories: any[] }>;
    for (const [catererId, menu] of Object.entries(menus)) {
      for (const category of menu.categories) {
        const { error: catError } = await supabase
          .from('menu_categories')
          .upsert({
            id: category.id,
            caterer_id: catererId,
            name: category.name,
            sort_order: category.sort_order,
          }, { onConflict: 'id' });
        if (catError) console.error('Error seeding category:', category.name, catError);

        for (const item of category.items) {
          const { error: itemError } = await supabase
            .from('menu_items')
            .upsert({
              ...item,
              category_id: category.id,
              caterer_id: catererId,
              image_url: null,
            }, { onConflict: 'id' });
          if (itemError) console.error('Error seeding item:', item.name, itemError);
        }
      }
    }

    // Seed reviews (using a dummy user_id and booking_id)
    for (const review of reviews) {
      const { error } = await supabase
        .from('reviews')
        .insert({
          caterer_id: review.caterer_id,
          user_id: '00000000-0000-0000-0000-000000000000',
          booking_id: '00000000-0000-0000-0000-000000000000',
          overall_rating: review.overall,
          taste_rating: review.taste,
          service_rating: review.service,
          value_rating: review.value,
          cleanliness_rating: review.cleanliness,
          text: review.text,
          images: [],
        });
      if (error && !error.message.includes('duplicate')) {
        console.error('Error seeding review:', error);
      }
    }

    console.log('Database seeded successfully!');
    return true;
  } catch (error) {
    console.error('Seed error:', error);
    return false;
  }
}
