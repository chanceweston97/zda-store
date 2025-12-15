const proudPartners = {
  name: "proudPartners",
  type: "document",
  title: "Proud Partners",
  fields: [
    {
      name: "name",
      title: "Section Name",
      type: "string",
      description: "Internal name for this section (e.g., 'Homepage Partners')",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "isActive",
      title: "Active",
      type: "boolean",
      description: "Only one active partners section will be displayed on the homepage",
      initialValue: false,
    },
    {
      name: "title",
      title: "Title",
      type: "string",
      description: "Section heading (e.g., 'Proud Partners Of')",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "partners",
      title: "Partners",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "name",
              title: "Partner Name",
              type: "string",
              description: "Name of the partner/brand",
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: "logo",
              title: "Logo",
              type: "image",
              options: {
                hotspot: true,
              },
              description: "Partner logo image",
              validation: (Rule: any) => Rule.required(),
            },
          ],
          preview: {
            select: {
              name: "name",
              logo: "logo",
            },
            prepare({ name, logo }: any) {
              return {
                title: name,
                media: logo,
              };
            },
          },
        },
      ],
      description: "List of partner brands to display in the carousel",
      validation: (Rule: any) => Rule.min(1),
    },
  ],
  preview: {
    select: {
      name: "name",
      isActive: "isActive",
      title: "title",
      partnerCount: "partners",
    },
    prepare(selection: any) {
      const { name, isActive, title, partnerCount } = selection;
      const count = partnerCount?.length || 0;
      return {
        title: `${name}${isActive ? " (Active)" : ""}`,
        subtitle: `${title} - ${count} partner${count !== 1 ? "s" : ""}`,
      };
    },
  },
};

export default proudPartners;

