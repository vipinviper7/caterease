import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useFilterStore } from '../stores/filterStore';
import { Caterer, MenuCategory, MenuItem } from '../types/database';
import caterersJson from '../data/caterers.json';
import menusJson from '../data/menus.json';

// Fallback to local data if Supabase isn't configured
const useLocalFallback = !process.env.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co';

export function useCaterers() {
  const filters = useFilterStore();

  return useQuery({
    queryKey: ['caterers', filters.city, filters.searchQuery, filters.cuisines, filters.budgetRange, filters.minRating, filters.isVegOnly, filters.isVerifiedOnly, filters.sortBy],
    queryFn: async (): Promise<Caterer[]> => {
      if (useLocalFallback) {
        return filterLocalCaterers(caterersJson as unknown as Caterer[], filters);
      }

      let query = supabase
        .from('caterers')
        .select('*')
        .eq('city', filters.city);

      if (filters.searchQuery) {
        query = query.or(`name.ilike.%${filters.searchQuery}%,cuisines.cs.{${filters.searchQuery}}`);
      }
      if (filters.cuisines.length > 0) {
        query = query.overlaps('cuisines', filters.cuisines);
      }
      if (filters.budgetRange[0] > 0) {
        query = query.gte('min_price_per_plate', filters.budgetRange[0]);
      }
      if (filters.budgetRange[1] < 2000) {
        query = query.lte('min_price_per_plate', filters.budgetRange[1]);
      }
      if (filters.minRating > 0) {
        query = query.gte('rating_avg', filters.minRating);
      }
      if (filters.isVegOnly) {
        query = query.eq('is_pure_veg', true);
      }
      if (filters.isVerifiedOnly) {
        query = query.eq('is_verified', true);
      }

      if (filters.sortBy === 'price_low') {
        query = query.order('min_price_per_plate', { ascending: true });
      } else if (filters.sortBy === 'price_high') {
        query = query.order('min_price_per_plate', { ascending: false });
      } else {
        query = query.order('rating_avg', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Caterer[];
    },
  });
}

export function useFeaturedCaterers() {
  return useQuery({
    queryKey: ['caterers', 'featured'],
    queryFn: async (): Promise<Caterer[]> => {
      if (useLocalFallback) {
        return (caterersJson as unknown as Caterer[])
          .filter(c => c.is_verified && c.rating_avg >= 4.5)
          .slice(0, 6);
      }
      const { data, error } = await supabase
        .from('caterers')
        .select('*')
        .eq('is_verified', true)
        .gte('rating_avg', 4.5)
        .order('rating_avg', { ascending: false })
        .limit(6);
      if (error) throw error;
      return (data || []) as Caterer[];
    },
  });
}

export function useCaterer(id: string) {
  return useQuery({
    queryKey: ['caterer', id],
    queryFn: async (): Promise<Caterer | null> => {
      if (useLocalFallback) {
        return (caterersJson as unknown as Caterer[]).find(c => c.id === id) || null;
      }
      const { data, error } = await supabase
        .from('caterers')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Caterer;
    },
    enabled: !!id,
  });
}

export function useCatererMenu(catererId: string) {
  return useQuery({
    queryKey: ['caterer-menu', catererId],
    queryFn: async (): Promise<{ categories: (MenuCategory & { items: MenuItem[] })[] }> => {
      if (useLocalFallback) {
        const menus = menusJson as Record<string, { categories: any[] }>;
        const menu = menus[catererId];
        if (!menu) return { categories: [] };
        return {
          categories: menu.categories.map(cat => ({
            id: cat.id,
            caterer_id: catererId,
            name: cat.name,
            sort_order: cat.sort_order,
            items: cat.items.map((item: any) => ({
              ...item,
              category_id: cat.id,
              caterer_id: catererId,
              image_url: null,
              description: item.description || null,
            })),
          })),
        };
      }

      const { data: categories, error: catError } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('caterer_id', catererId)
        .order('sort_order');

      if (catError) throw catError;

      const { data: items, error: itemError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('caterer_id', catererId);

      if (itemError) throw itemError;

      const categoriesWithItems = (categories || []).map(cat => ({
        ...cat,
        items: (items || []).filter(item => item.category_id === cat.id),
      }));

      return { categories: categoriesWithItems };
    },
    enabled: !!catererId,
  });
}

function filterLocalCaterers(caterers: Caterer[], filters: any): Caterer[] {
  let result = [...caterers];

  if (filters.city) {
    result = result.filter(c => c.city === filters.city);
  }
  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    result = result.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.cuisines.some((cuisine: string) => cuisine.toLowerCase().includes(q))
    );
  }
  if (filters.cuisines.length > 0) {
    result = result.filter(c =>
      c.cuisines.some((cuisine: string) => filters.cuisines.includes(cuisine))
    );
  }
  if (filters.budgetRange[0] > 0) {
    result = result.filter(c => c.min_price_per_plate >= filters.budgetRange[0]);
  }
  if (filters.budgetRange[1] < 2000) {
    result = result.filter(c => c.min_price_per_plate <= filters.budgetRange[1]);
  }
  if (filters.minRating > 0) {
    result = result.filter(c => c.rating_avg >= filters.minRating);
  }
  if (filters.isVegOnly) {
    result = result.filter(c => c.is_pure_veg);
  }
  if (filters.isVerifiedOnly) {
    result = result.filter(c => c.is_verified);
  }

  if (filters.sortBy === 'price_low') {
    result.sort((a, b) => a.min_price_per_plate - b.min_price_per_plate);
  } else if (filters.sortBy === 'price_high') {
    result.sort((a, b) => b.min_price_per_plate - a.min_price_per_plate);
  } else {
    result.sort((a, b) => b.rating_avg - a.rating_avg);
  }

  return result;
}
