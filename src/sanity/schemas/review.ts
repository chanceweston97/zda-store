const review = {
  name: "review",
  type: "document",
  title: "Review",
  fields: [
    {
      name: "name",
      type: "string",
      readonly: true,
    },
    {
      name: "email",
      type: "string",
      readonly: true,
    },
    {
      name: "comment",
      type: "text",
      readonly: true,
    },
    {
      name: "ratings",
      type: "number",
      readonly: true,
    },
    {
      name: "product",
      type: "reference",
      to: [{ type: "product" }],
    },
  ],
  preview: {
    select: {
      name: "name",
      comment: "comment",
      product: "product.name",
    },
    prepare({ name, comment, product }: any) {
      return {
        title: `${name} on ${product}`,
        subtitle: comment,
      };
    },
  },
};

export default review;
