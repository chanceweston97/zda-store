const connector = {
  name: "connector",
  title: "Connector",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Connector Name",
      type: "string",
      validation: (Rule: any) => Rule.required(),
      description: "e.g., 'N-Male', 'SMA-Female', 'BNC-Male'",
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
      name: "image",
      title: "Connector Image",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (Rule: any) => Rule.required(),
      description: "Image of the connector",
    },
    {
      name: "pricing",
      title: "Pricing by Cable Type",
      type: "array",
      validation: (Rule: any) => Rule.required().min(1),
      description: "Set the price for this connector for each cable type",
      of: [
        {
          type: "object",
          name: "cablePricing",
          title: "Cable Type Pricing",
          fields: [
            {
              name: "cableType",
              title: "Cable Type",
              type: "reference",
              to: [{ type: "cableType" }],
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: "price",
              title: "Price ($)",
              type: "number",
              validation: (Rule: any) => Rule.required().min(0),
              description: "Price for this connector when used with the selected cable type",
            },
          ],
          preview: {
            select: {
              cableType: "cableType.name",
              price: "price",
            },
            prepare(selection: any) {
              const { cableType, price } = selection;
              return {
                title: cableType || "No Cable Type",
                subtitle: `$${price?.toFixed(2) || "0.00"}`,
              };
            },
          },
        },
      ],
    },
    {
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Order in which this connector appears in the dropdown (lower numbers appear first)",
      initialValue: 0,
    },
    {
      name: "isActive",
      title: "Active",
      type: "boolean",
      initialValue: true,
      description: "Uncheck to hide this connector from the customizer",
    },
    {
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      validation: (Rule: any) => Rule.required(),
      description: "Select the product category for this connector",
    },
  ],
  preview: {
    select: {
      title: "name",
      media: "image",
    },
  },
};

export default connector;

