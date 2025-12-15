const cableSeries = {
  name: "cableSeries",
  title: "Cable Series",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Series Name",
      type: "string",
      validation: (Rule: any) => Rule.required(),
      description: "e.g., 'RG Series' or 'LMR Series'",
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        unique: true,
        slugify: (input: any) => {
          return input
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]+/g, "");
        },
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Order in which this series appears in the dropdown (lower numbers appear first)",
      initialValue: 0,
    },
  ],
  preview: {
    select: {
      title: "name",
    },
  },
};

export default cableSeries;

