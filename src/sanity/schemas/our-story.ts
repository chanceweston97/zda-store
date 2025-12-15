const ourStory = {
  name: "ourStory",
  type: "document",
  title: "Our Story",
  fields: [
    {
      name: "name",
      title: "Section Name",
      type: "string",
      description: "Internal name for this section (e.g., 'Our Story Page')",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "isActive",
      title: "Active",
      type: "boolean",
      description: "Only one active Our Story will be displayed",
      initialValue: false,
    },
    {
      name: "heroSection",
      title: "Hero Section",
      type: "object",
      fields: [
        {
          name: "title",
          title: "Title",
          type: "string",
          description: "Main heading (e.g., 'Our Story')",
          validation: (Rule: any) => Rule.required(),
        },
        {
          name: "description",
          title: "Description",
          type: "text",
          description: "Main paragraph text",
          validation: (Rule: any) => Rule.required(),
        },
      ],
    },
    {
      name: "whatWeFocusOn",
      title: "What We Focus On Section",
      type: "object",
      fields: [
        {
          name: "title",
          title: "Title",
          type: "string",
          description: "Section title (e.g., 'What We Focus On')",
          validation: (Rule: any) => Rule.required(),
        },
        {
          name: "introText",
          title: "Intro Text",
          type: "text",
          description: "Text before the bullet list",
          validation: (Rule: any) => Rule.required(),
        },
        {
          name: "items",
          title: "Focus Items",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                {
                  name: "title",
                  title: "Item Title",
                  type: "string",
                  description: "Bold title (e.g., 'Antennas')",
                  validation: (Rule: any) => Rule.required(),
                },
                {
                  name: "description",
                  title: "Description",
                  type: "string",
                  description: "Description text after the title",
                  validation: (Rule: any) => Rule.required(),
                },
              ],
              preview: {
                select: {
                  title: "title",
                  description: "description",
                },
                prepare({ title, description }: any) {
                  return {
                    title: title,
                    subtitle: description?.substring(0, 60) + "...",
                  };
                },
              },
            },
          ],
          validation: (Rule: any) => Rule.min(1).max(10),
        },
        {
          name: "closingText",
          title: "Closing Text",
          type: "text",
          description: "Text after the bullet list",
          validation: (Rule: any) => Rule.required(),
        },
        {
          name: "image",
          title: "Image",
          type: "image",
          options: {
            hotspot: true,
          },
          description: "Image for this section (appears on the right)",
          validation: (Rule: any) => Rule.required(),
        },
      ],
    },
    {
      name: "letsWorkTogether",
      title: "Let's Work Together Section",
      type: "object",
      fields: [
        {
          name: "title",
          title: "Title",
          type: "string",
          description: "Section title (e.g., 'Let's Work Together')",
          validation: (Rule: any) => Rule.required(),
        },
        {
          name: "introText",
          title: "Intro Text",
          type: "text",
          description: "Text before the bullet list",
          validation: (Rule: any) => Rule.required(),
        },
        {
          name: "subtitle",
          title: "Subtitle",
          type: "string",
          description: "Subtitle before the list (e.g., 'That includes:')",
        },
        {
          name: "items",
          title: "Work Items",
          type: "array",
          of: [{ type: "string" }],
          description: "List of items",
          validation: (Rule: any) => Rule.min(1).max(20),
        },
        {
          name: "closingText",
          title: "Closing Text",
          type: "text",
          description: "Text after the bullet list",
          validation: (Rule: any) => Rule.required(),
        },
        {
          name: "image",
          title: "Image",
          type: "image",
          options: {
            hotspot: true,
          },
          description: "Image for this section (appears on the left)",
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
                  description: "URL path (e.g., /shop, /contact)",
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
          validation: (Rule: any) => Rule.min(1).max(2),
          description: "Two buttons at the bottom of this section",
        },
      ],
    },
  ],
  preview: {
    select: {
      name: "name",
      isActive: "isActive",
      title: "heroSection.title",
      image: "whatWeFocusOn.image",
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

export default ourStory;

