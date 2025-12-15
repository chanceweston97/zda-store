const whatWeOffer = {
  name: "whatWeOffer",
  type: "document",
  title: "What We Offer",
  fields: [
    {
      name: "name",
      title: "Section Name",
      type: "string",
      description: "Internal name for this section (e.g., 'Homepage What We Offer')",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "isActive",
      title: "Active",
      type: "boolean",
      description: "Only one active section will be displayed on the homepage",
      initialValue: false,
    },
    {
      name: "title",
      title: "Section Title",
      type: "string",
      description: "Main heading (e.g., 'What We Offer')",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "headerButton",
      title: "Header Button",
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
          title: "Button Link",
          type: "string",
          description: "URL path (e.g., /products, /shop)",
          validation: (Rule: any) => Rule.required(),
        },
      ],
    },
    {
      name: "offerItems",
      title: "Offer Items",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "title",
              title: "Item Title",
              type: "string",
              description: "Title of the offer (e.g., 'Antennas', 'Coaxial Cables')",
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: "tags",
              title: "Tags",
              type: "array",
              of: [{ type: "string" }],
              description: "List of tags to display (e.g., ['Yagi', 'Omnidirectional'])",
            },
            {
              name: "description",
              title: "Description",
              type: "text",
              description: "Description text for this offer",
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: "button",
              title: "Button",
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
                  title: "Button Link",
                  type: "string",
                  description: "URL path (e.g., /products/antennas)",
                  validation: (Rule: any) => Rule.required(),
                },
              ],
            },
            {
              name: "image",
              title: "Image",
              type: "image",
              options: {
                hotspot: true,
              },
              description: "Image for this offer item",
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: "imagePosition",
              title: "Image Position",
              type: "string",
              options: {
                list: [
                  { title: "Right", value: "right" },
                  { title: "Left", value: "left" },
                ],
              },
              description: "Position of the image relative to the card",
              initialValue: "right",
              validation: (Rule: any) => Rule.required(),
            },
          ],
          preview: {
            select: {
              title: "title",
              image: "image",
              position: "imagePosition",
            },
            prepare({ title, image, position }: any) {
              return {
                title: title,
                subtitle: `Image: ${position || "right"}`,
                media: image,
              };
            },
          },
        },
      ],
      description: "List of offer items to display (typically 3 items)",
      validation: (Rule: any) => Rule.min(1).max(5),
    },
  ],
  preview: {
    select: {
      name: "name",
      isActive: "isActive",
      title: "title",
      itemCount: "offerItems",
    },
    prepare(selection: any) {
      const { name, isActive, title, itemCount } = selection;
      const count = itemCount?.length || 0;
      return {
        title: `${name}${isActive ? " (Active)" : ""}`,
        subtitle: `${title} - ${count} item${count !== 1 ? "s" : ""}`,
      };
    },
  },
};

export default whatWeOffer;

