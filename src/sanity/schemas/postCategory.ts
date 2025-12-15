const postCategory = {
    name: "postCategory",
    title: "Post Category",
    type: "document",
    fields: [
      {
        name: "title",
        title: "Title",
        type: "string",
      },
      {
        name: "image",
        title: "Image",
        type: "image",
        options: {
          hotspot: true,
        },
      },
   
      {
        name: "slug",
        title: "Slug",
        type: "slug",
        options: {
          source: "title",
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
      },
      {
        name: "description",
        title: "Description",
        type: "text",
      },
  
      
    ],
  };
  export default postCategory;
  