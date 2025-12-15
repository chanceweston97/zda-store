import { createClient } from "next-sanity";
import clientConfig from "../config/client-config";

const order = {
  name: "order",
  title: "Order",
  type: "document",
  fields: [
    {
      name: "orderTitle",
      title: "Order Title",
      type: "string",
    },
    {
      name: "orderId",
      title: "Order Id",
      type: "string",
    },
    {
      name: "status",
      title: "Shipping Satus",
      type: "string",
      options: {
        list: [
          { title: "Processing", value: "processing" },
          { title: "On Hold", value: "on-hold" },
          { title: "Delivered", value: "delivered" },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "totalPrice",
      title: "Total Price",
      type: "number",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "productQuantity",
      title: "Product Quantity",
      type: "string",
    },
    {
      name: "userId",
      title: "User Id",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "userEmail",
      title: "User Email",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "country",
      title: "Country",
      type: "string",
    },
    {
      name: "city",
      title: "City",
      type: "string",
    },
    {
      name: "postalCode",
      title: "Postal Code",
      type: "string",
    },
    {
      name: "line1",
      title: "Line 1",
      type: "string",
    },
    {
      name: "line2",
      title: "Line 2",
      type: "string",
    },
    {
      name: "orderDescription",
      title: "Order Description",
      type: "string",
    },
  ],

  preview: {
    select: {
      orderTitle: "orderTitle",
      orderId: "orderId",
    },
    prepare(selection: any) {
      const { orderId, orderTitle } = selection;
      return Object.assign({}, selection, {
        title: `${orderTitle}`,
        subtitle: `${orderId}`,
      });
    },
  },
};
export default order;
