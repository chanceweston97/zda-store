const heroBanner = {
  name: "heroBanner",
  type: "document",
  title: "Hero Banner",
  fields: [
    {
      name: "name",
      title: "Banner Name",
      type: "string",
      description: "Internal name for this hero banner (e.g., 'Homepage Hero')",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "isActive",
      title: "Active",
      type: "boolean",
      description: "Only one active banner will be displayed on the homepage",
      initialValue: false,
    },
    {
      name: "backgroundImage",
      title: "Background Image",
      type: "image",
      options: {
        hotspot: true,
      },
      description: "Main hero background image",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "title",
      title: "Main Title",
      type: "string",
      description: "Large heading text displayed on the hero (supports line breaks with <br>)",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "buttons",
      title: "Buttons",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "text",
              title: "Button Text",
              type: "string",
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: "link",
              title: "Link",
              type: "string",
              description: "URL path (e.g., /shop, /cable-customizer)",
      validation: (Rule: any) => Rule.required(),
            },
          ],
          preview: {
            select: {
              text: "text",
              link: "link",
            },
            prepare({ text, link }: any) {
              return {
                title: text,
                subtitle: link,
              };
            },
          },
        },
      ],
      validation: (Rule: any) => Rule.max(3),
    },
    {
      name: "brandName",
      title: "Brand Name",
      type: "string",
      description: "Brand name displayed at bottom left (e.g., 'ZDA Communications')",
      initialValue: "ZDA Communications",
    },
    {
      name: "card",
      title: "Right Side Card",
      type: "object",
      fields: [
        {
          name: "image",
          title: "Card Image",
          type: "image",
          options: {
            hotspot: true,
          },
          description: "Product/image displayed in the card",
        },
        {
          name: "title",
          title: "Card Title",
          type: "string",
          description: "Title text in the card (e.g., 'Precision & Performance')",
        },
        {
          name: "description",
          title: "Card Description",
          type: "text",
          description: "Description text in the card",
        },
      ],
    },
  ],
  preview: {
    select: {
      name: "name",
      isActive: "isActive",
      image: "backgroundImage",
    },
    prepare(selection: any) {
      const { name, isActive, image } = selection;
      return {
        title: `${name}${isActive ? " (Active)" : ""}`,
        media: image,
      };
    },
  },
};

export default heroBanner;
