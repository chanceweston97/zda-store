const cart = {
  name: "cart",
  title: "Cart",
  type: "document",
  fields: [
    {
      name: "userId",
      title: "User ID",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "price",
      title: "Price",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "discountedPrice",
      title: "Discounted Price",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "quantity",
      title: "Quantity",
      type: "number",
      validation: (Rule: any) => Rule.required(),
    },

    {
      name: "thumbnails",
      title: "Thumbnails",
      type: "array",
      of: [
        {
          type: "object",
          name: "cartThumbnail",
          title: "Cart Thumbnail",
          fields: [
            {
              name: "image",
              title: "Image",
              type: "image",
              options: {
                hotspot: true,
              },
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
    },
    {
      name: "previewImages",
      title: "Preview Images",
      type: "array",
      of: [
        {
          type: "object",
          name: "cartPreviewImage",
          title: "Cart Preview Image",
          fields: [
            {
              name: "image",
              title: "Image",
              type: "image",
              options: {
                hotspot: true,
              },
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
    },
  ],

  preview: {
    select: {
      title: "title",
    },
    prepare(selection: any) {
      return Object.assign({}, selection, {
        subtitle: `by`,
      });
    },
  },
};
export default cart;
