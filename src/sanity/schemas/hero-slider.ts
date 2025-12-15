const heroSlider = {
  name: "heroSlider",
  type: "document",
  title: "Hero Slider",
  fields: [
    {
      name: "name",
      title: "name",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "discount",
      title: "Discount Rate",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "image",
      title: "Image",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "product",
      type: "reference",
      to: [{ type: "product" }],
      validation: (Rule: any) => Rule.required(),
    },
  ],
  preview: {
    select: {
      title: "name",
      image: "image",
    },
    prepare(selection: any) {
      const { title, image } = selection;
      return {
        title: title,
        media: image,
      };
    },
  },
};

export default heroSlider;
