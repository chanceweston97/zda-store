const product = {
  name: "product",
  title: "Product",
  type: "document",
  groups: [
    { name: "basic", title: "Basic Info", default: true },
    { name: "pricing", title: "Pricing" },
    { name: "media", title: "Images & Datasheet" },
    { name: "details", title: "Details" },
  ],
  fields: [
    // ───────── BASIC INFO (ALL PRODUCT TYPES) ─────────
    {
      name: "name",
      title: "Product Name",
      type: "string",
      validation: (Rule: any) => Rule.required(),
      group: "basic",
    },
    {
      name: "productType",
      title: "Product Type",
      type: "string",
      options: {
        list: [
          { title: "Antenna", value: "antenna" },
          { title: "Cable", value: "cable" },
          { title: "Connector", value: "connector" },
        ],
        layout: "dropdown",
      },
      initialValue: "antenna",
      validation: (Rule: any) => Rule.required(),
      group: "basic",
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
      validation: (Rule: any) =>
        Rule.required().custom((fields: any) => {
          if (
            fields?.current !== fields?.current?.toLowerCase() ||
            fields?.current.split(" ").includes("")
          ) {
            return "Slug must be lowercase and not be included space";
          }
          return true;
        }),
      group: "basic",
    },
    {
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      validation: (Rule: any) =>
        Rule.custom((category: any) => {
          if (!category) {
            return "Category is required";
          }
          return true;
        }),
      description: "Select the appropriate product category.",
      group: "basic",
    },

    // ───────── ANTENNA & CABLE: SKU ─────────
    {
      name: "sku",
      title: "SKU",
      type: "string",
      description: "Product SKU (Stock Keeping Unit) identifier",
      hidden: ({ parent }: any) => parent?.productType === "connector",
      group: "basic",
    },

    // ───────── ANTENNA ONLY: Tags ─────────
    {
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string", title: "Tag" }],
      hidden: ({ parent }: any) => parent?.productType !== "antenna",
      group: "basic",
    },

    // ───────── ANTENNA ONLY: Published At ─────────
    {
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      hidden: ({ parent }: any) => parent?.productType !== "antenna",
      validation: (Rule: any) =>
        Rule.custom((value: any, context: any) => {
          if (context.parent?.productType === "antenna" && !value) {
            return "Published date is required for antenna products";
          }
          return true;
        }),
      group: "basic",
    },

    // ───────── ANTENNA ONLY: Stock Status ─────────
    {
      name: "status",
      title: "Stock Status",
      type: "boolean",
      initialValue: true,
      hidden: ({ parent }: any) => parent?.productType !== "antenna",
      group: "basic",
    },

    // ───────── CONNECTOR ONLY: Active ─────────
    {
      name: "isActive",
      title: "Active",
      type: "boolean",
      initialValue: true,
      description: "Uncheck to hide this connector from the customizer",
      hidden: ({ parent }: any) => parent?.productType !== "connector",
      group: "basic",
    },

    // ───────── CONNECTOR ONLY: Display Order ─────────
    {
      name: "displayOrder",
      title: "Display Order",
      type: "number",
      description: "Order in which this product appears in listings (lower numbers appear first)",
      initialValue: 0,
      hidden: ({ parent }: any) => parent?.productType !== "connector",
      group: "basic",
    },

    // ═══════════════════════════════════════════════════════════════
    // PRICING GROUP
    // ═══════════════════════════════════════════════════════════════

    // ───────── ANTENNA ONLY: Default Price ─────────
    {
      name: "price",
      title: "Default Price",
      type: "number",
      description: "Default price shown on shop and category pages. Base price before gain selection.",
      hidden: ({ parent }: any) => parent?.productType !== "antenna",
      validation: (Rule: any) =>
        Rule.custom((price: any, context: any) => {
          if (context.parent?.productType === "antenna" && (!price || price <= 0)) {
            return "Price is required for antenna products";
          }
          return true;
        }),
      group: "pricing",
    },

    // ───────── ANTENNA ONLY: Gain Options ─────────
    {
      name: "gainOptions",
      title: "Gain Options",
      type: "array",
      hidden: ({ parent }: any) => parent?.productType !== "antenna",
      validation: (Rule: any) =>
        Rule.custom((gainOptions: any, context: any) => {
          if (context.parent?.productType === "antenna" && (!gainOptions || gainOptions.length === 0)) {
            return "At least one Gain Option is required for antenna products";
          }
          return true;
        }),
      of: [
        {
          type: "object",
          name: "gainOption",
          title: "Gain Option",
          fields: [
            {
              name: "gain",
              title: "Gain Value (dBi)",
              type: "string",
              description: "Gain value (e.g., '6', '8', '12')",
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: "price",
              title: "Price",
              type: "number",
              description: "Price for this gain option.",
              validation: (Rule: any) => Rule.required().min(0),
            },
          ],
          preview: {
            select: {
              gain: "gain",
              price: "price",
            },
            prepare(selection: any) {
              const { gain, price } = selection;
              return {
                title: `${gain} dBi`,
                subtitle: `$${price?.toFixed(2) || "0.00"}`,
              };
            },
          },
        },
      ],
      description: "Multiple selectable gain values with their corresponding prices.",
      group: "pricing",
    },

    // ───────── CABLE ONLY: Cable Series ─────────
    {
      name: "cableSeries",
      title: "Cable Series",
      type: "reference",
      to: [{ type: "cableSeries" }],
      hidden: ({ parent }: any) => parent?.productType !== "cable",
      description: "Which series does this cable belong to? (RG Series or LMR Series)",
      group: "pricing",
    },

    // ───────── CABLE ONLY: Connector A ─────────
    {
      name: "connectorA",
      title: "Connector A",
      type: "reference",
      to: [{ type: "connector" }],
      hidden: ({ parent }: any) => parent?.productType !== "cable",
      description: "Select the first connector for this cable",
      group: "pricing",
    },

    // ───────── CABLE ONLY: Connector B ─────────
    {
      name: "connectorB",
      title: "Connector B",
      type: "reference",
      to: [{ type: "connector" }],
      hidden: ({ parent }: any) => parent?.productType !== "cable",
      description: "Select the second connector for this cable",
      group: "pricing",
    },

    // ───────── CABLE ONLY: Length Options ─────────
    {
      name: "lengthOptions",
      title: "Length Options",
      type: "array",
      hidden: ({ parent }: any) => parent?.productType !== "cable",
      of: [
        {
          type: "object",
          name: "lengthOption",
          title: "Length Option",
          fields: [
            {
              name: "length",
              title: "Length (ft)",
              type: "string",
              description: "Cable length (e.g., '10', '25', '50')",
            },
            {
              name: "price",
              title: "Price ($)",
              type: "number",
              description: "Price for this length option",
              validation: (Rule: any) => Rule.min(0),
            },
          ],
          preview: {
            select: {
              length: "length",
              price: "price",
            },
            prepare(selection: any) {
              const { length, price } = selection;
              return {
                title: `${length} ft`,
                subtitle: price ? `$${price.toFixed(2)}` : "No price set",
              };
            },
          },
        },
      ],
      description: "Multiple selectable cable lengths with their prices.",
      group: "pricing",
    },

    // ───────── CONNECTOR ONLY: Price ─────────
    {
      name: "connectorPrice",
      title: "Price",
      type: "number",
      hidden: ({ parent }: any) => parent?.productType !== "connector",
      validation: (Rule: any) =>
        Rule.custom((price: any, context: any) => {
          if (context.parent?.productType === "connector" && (!price || price <= 0)) {
            return "Price is required for connector products";
          }
          return true;
        }),
      description: "Price for this connector",
      group: "pricing",
    },

    // ───────── ANTENNA & CABLE: Quantity ─────────
    {
      name: "quantity",
      title: "Default Quantity",
      type: "number",
      description: "Default quantity shown on the product page (e.g. 1).",
      initialValue: 1,
      hidden: ({ parent }: any) => parent?.productType === "connector",
      group: "basic",
    },

    // ═══════════════════════════════════════════════════════════════
    // MEDIA GROUP
    // ═══════════════════════════════════════════════════════════════

    // ───────── CABLE ONLY: Single Cable Image ─────────
    {
      name: "cableImage",
      title: "Cable Image",
      type: "image",
      options: { hotspot: true },
      hidden: ({ parent }: any) => parent?.productType !== "cable",
      description: "Image of the cable",
      group: "media",
    },

    // ───────── CONNECTOR ONLY: Single Connector Image ─────────
    {
      name: "connectorImage",
      title: "Connector Image",
      type: "image",
      options: { hotspot: true },
      hidden: ({ parent }: any) => parent?.productType !== "connector",
      validation: (Rule: any) =>
        Rule.custom((image: any, context: any) => {
          if (context.parent?.productType === "connector" && !image) {
            return "Connector image is required";
          }
          return true;
        }),
      description: "Image of the connector",
      group: "media",
    },

    // ───────── ANTENNA ONLY: Thumbnails Array ─────────
    {
      name: "thumbnails",
      title: "Thumbnails",
      type: "array",
      hidden: ({ parent }: any) => parent?.productType !== "antenna",
      validation: (Rule: any) =>
        Rule.custom((thumbnails: any, context: any) => {
          if (context.parent?.productType === "antenna" && (!thumbnails || thumbnails.length === 0)) {
            return "At least one thumbnail is required for antenna products";
          }
          return true;
        }),
      of: [
        {
          type: "object",
          name: "thumbnail",
          title: "Thumbnail",
          fields: [
            {
              name: "image",
              title: "Image",
              type: "image",
              options: { hotspot: true },
            },
            {
              name: "color",
              title: "Color",
              type: "string",
            },
          ],
          preview: {
            select: {
              title: "color",
              media: "image",
            },
            prepare(selection: any) {
              const { title, media } = selection;
              return {
                title: title || "Thumbnail",
                media,
              };
            },
          },
        },
      ],
      group: "media",
    },

    // ───────── ANTENNA ONLY: Preview Images Array ─────────
    {
      name: "previewImages",
      title: "Preview Images",
      type: "array",
      hidden: ({ parent }: any) => parent?.productType !== "antenna",
      validation: (Rule: any) =>
        Rule.custom((images: any, context: any) => {
          if (context.parent?.productType === "antenna" && (!images || images.length === 0)) {
            return "At least one preview image is required for antenna products";
          }
          return true;
        }),
      of: [
        {
          type: "object",
          name: "previewImage",
          title: "Preview Image",
          fields: [
            {
              name: "image",
              title: "Image",
              type: "image",
              options: { hotspot: true },
            },
            {
              name: "color",
              title: "Color",
              type: "string",
            },
          ],
          preview: {
            select: {
              title: "color",
              media: "image",
            },
            prepare(selection: any) {
              const { title, media } = selection;
              return {
                title: title || "Preview Image",
                media,
              };
            },
          },
        },
      ],
      group: "media",
    },

    // ───────── ANTENNA ONLY: Datasheet Image ─────────
    {
      name: "datasheetImage",
      title: "Datasheet Image",
      type: "image",
      options: { hotspot: true },
      hidden: ({ parent }: any) => parent?.productType !== "antenna",
      description: "Preview image of the datasheet shown on the product page (bottom left).",
      group: "media",
    },

    // ───────── ANTENNA ONLY: Datasheet PDF ─────────
    {
      name: "datasheetPdf",
      title: "Datasheet PDF",
      type: "file",
      options: { accept: "application/pdf" },
      hidden: ({ parent }: any) => parent?.productType !== "antenna",
      description: "PDF file of the datasheet for the Download Data Sheet button.",
      group: "media",
    },

    // ═══════════════════════════════════════════════════════════════
    // DETAILS GROUP
    // ═══════════════════════════════════════════════════════════════

    // ───────── ANTENNA ONLY: Feature Title ─────────
    {
      name: "featureTitle",
      title: "Feature Title",
      type: "string",
      hidden: ({ parent }: any) => parent?.productType !== "antenna",
      group: "details",
    },

    // ───────── ALL PRODUCT TYPES: Features ─────────
    {
      name: "features",
      title: "Features",
      type: "array",
      of: [{ type: "string" }],
      group: "details",
    },

    // ───────── ANTENNA ONLY: Applications ─────────
    {
      name: "applications",
      title: "Applications",
      type: "array",
      of: [{ type: "string" }],
      hidden: ({ parent }: any) => parent?.productType !== "antenna",
      group: "details",
    },

    // ───────── ANTENNA ONLY: Description ─────────
    {
      name: "description",
      title: "Description",
      type: "blockContent",
      hidden: ({ parent }: any) => parent?.productType !== "antenna",
      description: "Rich text content for the Description tab.",
      group: "details",
    },

    // ───────── ANTENNA ONLY: Specifications ─────────
    {
      name: "specifications",
      title: "Specifications",
      type: "blockContent",
      hidden: ({ parent }: any) => parent?.productType !== "antenna",
      description: "Rich text content for the Specifications tab.",
      group: "details",
    },
  ],

  preview: {
    select: {
      title: "name",
      productType: "productType",
      category: "category.title",
      antennaThumbnail: "thumbnails.0.image",
      cableImage: "cableImage",
      connectorImage: "connectorImage",
    },
    prepare(selection: any) {
      const { title, productType, category, antennaThumbnail, cableImage, connectorImage } = selection;
      const typeLabel = productType ? productType.charAt(0).toUpperCase() + productType.slice(1) : "Product";
      
      // Select the appropriate image based on product type
      let media = antennaThumbnail;
      if (productType === "cable") media = cableImage;
      if (productType === "connector") media = connectorImage;
      
      return {
        title,
        subtitle: `${typeLabel} - ${category || "No Category"}`,
        media,
      };
    },
  },
};

export default product;
