import { CableCategoryInput } from "../components/CableCategoryInput";

const cableType = {
  name: "cableType",
  title: "Cable Type",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Cable Type Name",
      type: "string",
      description: "e.g., 'LMR 195', 'RG 58', 'LMR 400 UltraFlex' - Optional",
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
            ?.toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]+/g, "") || "";
        },
      },
      description: "Auto-generated from name - Optional",
    },
    {
      name: "series",
      title: "Cable Series",
      type: "reference",
      to: [{ type: "cableSeries" }],
      description: "Which series does this cable belong to? (RG Series or LMR Series) - Optional",
    },
    {
      name: "pricePerFoot",
      title: "Price Per Foot ($)",
      type: "number",
      validation: (Rule: any) => Rule.min(0),
      description: "Price per foot for this cable type - Optional",
    },
    {
      name: "image",
      title: "Cable Image",
      type: "image",
      options: {
        hotspot: true,
      },
      description: "Image of the cable type (optional)",
    },
    {
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Order in which this cable type appears in the dropdown (lower numbers appear first)",
      initialValue: 0,
    },
    {
      name: "isActive",
      title: "Active",
      type: "boolean",
      initialValue: true,
      description: "Uncheck to hide this cable type from the customizer",
    },
    {
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      description: "Product category for this cable type. Defaults to 'Cables' category.",
      components: {
        input: CableCategoryInput,
      },
    },
    {
      name: "sku",
      title: "SKU",
      type: "string",
      description: "Product SKU (Stock Keeping Unit) identifier (optional)",
    },
    {
      name: "lengthOptions",
      title: "Length Options",
      type: "array",
      of: [
        {
          type: "object",
          name: "lengthOption",
          title: "Length Option",
          fields: [
            {
              name: "length",
              title: "Length",
              type: "string",
              description: "Cable length (e.g., '10 ft', '25 ft', '50 ft'). Price will be calculated on the frontend as Price Per Foot × Length.",
            },
          ],
          preview: {
            select: {
              length: "length",
            },
            prepare(selection: any) {
              const { length } = selection;
              return {
                title: length || "Length",
                subtitle: "Price calculated on frontend",
              };
            },
          },
        },
      ],
      description:
        "Multiple selectable cable lengths. Price will be calculated on the frontend as Price Per Foot × Length when a length is selected.",
    },
    {
      name: "quantity",
      title: "Default Quantity",
      type: "number",
      description: "Default quantity shown on the product page (e.g. 1). - Optional",
      initialValue: 1,
    },
    {
      name: "description",
      title: "Description",
      type: "blockContent",
      description: "Rich text content for the Description tab (optional)",
    },
    {
      name: "specifications",
      title: "Specifications",
      type: "blockContent",
      description: "Rich text content for the Specifications tab (optional)",
    },
  ],
  preview: {
    select: {
      title: "name",
      series: "series.name",
      price: "pricePerFoot",
      media: "image",
    },
    prepare(selection: any) {
      const { title, series, price } = selection;
      return {
        title,
        subtitle: `${series || "No Series"} - $${price?.toFixed(2) || "0.00"}/ft`,
      };
    },
  },
};

export default cableType;

