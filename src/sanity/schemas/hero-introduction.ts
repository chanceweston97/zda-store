const heroIntroduction = {
  name: "heroIntroduction",
  type: "document",
  title: "Hero Introduction",
  fields: [
    {
      name: "name",
      title: "Section Name",
      type: "string",
      description: "Internal name for this section (e.g., 'Homepage Introduction')",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "isActive",
      title: "Active",
      type: "boolean",
      description: "Only one active introduction will be displayed on the homepage",
      initialValue: false,
    },
    {
      name: "title",
      title: "Title",
      type: "string",
      description: "Main heading text (e.g., 'Enabling Wireless Networks Since 2008')",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "description",
      title: "Description",
      type: "text",
      description: "Main paragraph text describing the company",
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
              description: "URL path (e.g., /about, /shop)",
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
      name: "image",
      title: "Image",
      type: "image",
      options: {
        hotspot: true,
      },
      description: "Right side image",
      validation: (Rule: any) => Rule.required(),
    },
  ],
  preview: {
    select: {
      name: "name",
      isActive: "isActive",
      title: "title",
      image: "image",
    },
    prepare(selection: any) {
      const { name, isActive, title, image } = selection;
      return {
        title: `${name}${isActive ? " (Active)" : ""}`,
        subtitle: title,
        media: image,
      };
    },
  },
};

export default heroIntroduction;

