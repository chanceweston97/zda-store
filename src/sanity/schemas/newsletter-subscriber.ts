const newsletterSubscriber = {
  name: "newsletterSubscriber",
  title: "Newsletter Subscriber",
  type: "document",
  fields: [
    {
      name: "email",
      title: "Email",
      type: "string",
      readOnly: true,
    },
    {
      name: "createdAt",
      title: "Subscribed Date",
      type: "datetime",
      readOnly: true,
    },
  ],
  preview: {
    select: {
      email: "email",
      createdAt: "createdAt",
    },
    prepare(selection: any) {
      const { email, createdAt } = selection;
      const date = createdAt
        ? new Date(createdAt).toLocaleDateString()
        : "No date";
      return {
        title: email || "No email",
        subtitle: `Subscribed: ${date}`,
      };
    },
  },
};

export default newsletterSubscriber;

