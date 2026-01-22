import { Menu } from "@/types/Menu";

export const menuData: Menu[] = [
  {
    id: 1,
    title: "Products",
    newTab: false,
    path: "/products",
    submenu: [
      {
        id: 61,
        title: "Antennas",
        newTab: false,
        path: "/categories/antennas",
        submenu: [
          {
            id: 611,
            title: "Yagi Antennas",
            newTab: false,
            path: "/categories/yagi-antennas",
          },
          {
            id: 612,
            title: "Omni Antennas",
            newTab: false,
            path: "/categories/omni-antennas",
          },
          {
            id: 613,
            title: "Parabolic Antennas",
            newTab: false,
            path: "/categories/grid-parabolic-antennas",
          },
        ],
      },
      {
        id: 62,
        title: "Cables",
        newTab: false,
        path: "/categories/cables",
      },
      {
        id: 64,
        title: "Connectors",
        newTab: false,
        path: "/categories/connectors",
      },
    
    
    ]
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
