export type Menu = {
  id: number;
  title: string;
  path?: string;
  newTab: boolean;
  submenu?: Menu[];
};

export const menuData: Menu[] = [
  {
    id: 1,
    title: "Products",
    newTab: false,
    path: "/store",
    submenu: [
      {
        id: 61,
        title: "Antennas",
        newTab: false,
        path: "/store?category=antennas",
        submenu: [
          {
            id: 611,
            title: "Yagi Antennas",
            newTab: false,
            path: "/store?category=yagi-antennas",
          },
          {
            id: 612,
            title: "Omni Antennas",
            newTab: false,
            path: "/store?category=omni-antennas",
          },
          {
            id: 613,
            title: "Parabolic Antennas",
            newTab: false,
            path: "/store?category=parabolic-antennas",
          },
        ],
      },
      {
        id: 62,
        title: "Cables",
        newTab: false,
        path: "/store?category=cables",
      },
      {
        id: 64,
        title: "Connectors",
        newTab: false,
        path: "/store?category=connectors",
      },
    ],
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


