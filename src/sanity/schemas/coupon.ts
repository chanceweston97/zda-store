const coupon = {
  name: "coupon",
  title: "Coupon",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Code Name",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "discount",
      title: "Discount (%)",
      type: "number",
    },
    {
      name: "code",
      title: "Code",
      type: "string",
    },

    {
      name: "maxRedemptions",
      title: "Max Redemptions",
      type: "number",
    },
    {
      name: "timesRedemed",
      title: "Times Redeemed",
      type: "number",
    },
  ],
};

export default coupon;
