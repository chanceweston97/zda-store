const faq = {
  name: "faq",
  type: "document",
  title: "FAQ",
  fields: [
    {
      name: "name",
      title: "Section Name",
      type: "string",
      description: "Internal name for this FAQ section (e.g., 'Homepage FAQ')",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "isActive",
      title: "Active",
      type: "boolean",
      description: "Only one active FAQ section will be displayed",
      initialValue: false,
    },
    {
      name: "title",
      title: "Section Title",
      type: "string",
      description: "Main heading (e.g., 'Frequently Asked Questions')",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "contactButton",
      title: "Contact Button",
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
          description: "URL path or action (e.g., /contact, #contact)",
          validation: (Rule: any) => Rule.required(),
        },
      ],
    },
    {
      name: "items",
      title: "FAQ Items",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "question",
              title: "Question",
              type: "string",
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: "answer",
              title: "Answer",
              type: "text",
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: "order",
              title: "Display Order",
              type: "number",
              description: "Order in which this FAQ appears (lower numbers appear first)",
              validation: (Rule: any) => Rule.required().min(1),
            },
          ],
          preview: {
            select: {
              question: "question",
              order: "order",
            },
            prepare({ question, order }: any) {
              return {
                title: question,
                subtitle: `Order: ${order || "Not set"}`,
              };
            },
          },
        },
      ],
      description: "List of FAQ items",
      validation: (Rule: any) => Rule.min(1),
    },
  ],
  preview: {
    select: {
      name: "name",
      isActive: "isActive",
      title: "title",
      itemCount: "items",
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

export default faq;

