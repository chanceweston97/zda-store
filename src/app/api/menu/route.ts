import { getCategoriesWithSubcategories } from "@/lib/data/unified-data";
import { Menu } from "@/types/Menu";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const categories = await getCategoriesWithSubcategories();
    
    // If no categories, return empty array (frontend uses static menu)
    if (!categories || categories.length === 0) {
      console.warn("[Menu API] No categories found, returning empty menu");
      return NextResponse.json([], {
        status: 200, // Return 200 with empty array
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      });
    }
    
    // Build Products submenu from categories
    // Use handle if available (for Medusa), otherwise use slug.current
    const productsSubmenu: Menu[] = (categories || []).map((category, index) => {
      const categoryHandle = (category as any).handle || category.slug?.current || category.slug;
      const categoryMenu: Menu = {
        id: 60 + index + 1,
        title: category.title,
        newTab: false,
        path: `/categories/${categoryHandle}`,
      };

      // Add subcategories if they exist
      if (category.subcategories && category.subcategories.length > 0) {
        categoryMenu.submenu = category.subcategories.map((sub, subIndex) => {
          const subHandle = (sub as any).handle || sub.slug?.current || sub.slug;
          return {
            id: (60 + index + 1) * 10 + subIndex + 1,
            title: sub.title,
            newTab: false,
            path: `/categories/${subHandle}`,
          };
        });
      }

      return categoryMenu;
    });

    const menuData: Menu[] = [
      {
        id: 1,
        title: "Products",
        newTab: false,
        path: "/shop",
        submenu: productsSubmenu,
      },
      {
        id: 2,
        title: "Cable Customizer",
        newTab: false,
        path: "/cable-customizer",
      },
      {
        id: 3,
        title: "Request a Quote",
        newTab: false,
        path: "/request-a-quote",
      },
      {
        id: 4,
        title: "Our Story",
        newTab: false,
        path: "/our-story",
      },
      {
        id: 5,
        title: "Contact Us",
        newTab: false,
        path: "/contact",
      },
    ];

    return NextResponse.json(menuData, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error("[Menu API] Error fetching menu data:", error);
    // Return empty array instead of 500 error to prevent frontend crashes
    // Frontend will fall back to static menu
    return NextResponse.json([], { 
      status: 200, // Return 200 with empty array, not 500
      headers: {
        'Cache-Control': 'no-store', // Don't cache errors
      },
    });
  }
}
