import { getCategoriesWithSubcategories } from "@/lib/data/unified-data";
import { Menu } from "@/types/Menu";
import { NextResponse } from "next/server";

export async function GET() {
  const timerLabel = `[Menu API] GET|${crypto.randomUUID()}`;
  console.time(timerLabel);
  try {
    console.log("[Menu API] Fetching categories...");
    const categories = await getCategoriesWithSubcategories();
    
    console.log(`[Menu API] Received ${categories?.length || 0} categories`);
    if (categories && categories.length > 0) {
      console.log("[Menu API] Category names:", categories.map((c: any) => c.title || c.name).slice(0, 5));
    }
    
    // If no categories, return empty array (frontend uses static menu)
    if (!categories || categories.length === 0) {
      console.warn("[Menu API] No categories found, returning empty menu");
      console.warn("[Menu API] This means getCategoriesWithSubcategories() returned empty. Check WooCommerce connection.");
      return NextResponse.json([], {
        status: 200, // Return 200 with empty array
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      });
    }
    
    // Build Products submenu from categories
    // Use handle if available, otherwise use slug.current
    const productsSubmenu: Menu[] = (categories || []).map((category, index) => {
      const categoryHandle = (category as any).handle || category.slug?.current || category.slug;
      const categoryMenu: Menu = {
        id: 60 + index + 1,
        title: category.title || category.name || `Category ${index + 1}`,
        newTab: false,
        path: `/categories/${categoryHandle}`,
      };

      // Add subcategories if they exist
      if (category.subcategories && category.subcategories.length > 0) {
        console.log(`[Menu API] Category "${categoryMenu.title}" has ${category.subcategories.length} subcategories`);
        categoryMenu.submenu = category.subcategories.map((sub, subIndex) => {
          const subHandle = (sub as any).handle || sub.slug?.current || sub.slug;
          return {
            id: (60 + index + 1) * 10 + subIndex + 1,
            title: sub.title || sub.name || `Subcategory ${subIndex + 1}`,
            newTab: false,
            path: `/categories/${subHandle}`,
          };
        });
      }

      return categoryMenu;
    });
    
    console.log(`[Menu API] Built menu with ${productsSubmenu.length} category items`);

    const menuData: Menu[] = [
      {
        id: 1,
        title: "Products",
        newTab: false,
        path: "/products",
        submenu: productsSubmenu,
      },
      {
        id: 2,
        title: "Cable Builder",
        newTab: false,
        path: "/cable-builder",
      },
      {
        id: 3,
        title: "Catalog",
        newTab: false,
        path: "/catalog",
      },
      {
        id: 4,
        title: "Company",
        newTab: false,
        path: "/company",
      },
    ];

    console.timeEnd(timerLabel);
    return NextResponse.json(menuData, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // 5 min cache, 10 min stale
      },
    });
  } catch (error) {
    try { console.timeEnd(timerLabel); } catch { /* no-op */ }
    console.error("[Menu API] Error fetching menu data:", error);
    // Return empty array instead of 500 error to prevent frontend crashes
    // Frontend will fall back to static menu
    return NextResponse.json([], {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  }
}
