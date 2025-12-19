import algoliasearch from "algoliasearch";
import { load } from "cheerio";

const appID = process.env.NEXT_PUBLIC_ALGOLIA_PROJECT_ID ?? "";
const apiKEY = process.env.NEXT_PUBLIC_ALGOLIA_API_KEY ?? "";
const INDEX = process.env.NEXT_PUBLIC_ALGOLIA_INDEX ?? "";

// Only initialize Algolia if all required env vars are present
const isAlgoliaConfigured = appID && apiKEY && INDEX;
const client = isAlgoliaConfigured ? algoliasearch(appID, apiKEY) : null;
const index = isAlgoliaConfigured && client ? client.initIndex(INDEX) : null;

export const structuredAlgoliaHtmlData = async ({
  pageUrl = "",
  htmlString = "",
  title = "",
  type = "",
  imageURL = "",
  price = 0,
  discountedPrice = 0,
  reviews = 0,
  category = "",
  colors = [],
  sizes = [],
  _id = "",
  tags = [],
  description = [],
  thumbnails = [],
  previewImages = [],
  additionalInformation = {},
  customAttributes = {},
  status = true,
  offers = [],
}) => {
  try {
    const c$ = load(htmlString).text();
    const data = {
      objectID: pageUrl,
      name: title,
      url: pageUrl,
      shortDescription: c$.slice(0, 7000),
      type: type,
      imageURL: imageURL,
      updatedAt: new Date().toISOString(),
      price: price,
      discountedPrice: discountedPrice,
      reviews: reviews,
      category: category,
      colors: colors,
      sizes: sizes,
      tags: tags,
      _id: _id,
      thumbnails: thumbnails,
      previewImages: previewImages,
      additionalInformation: additionalInformation,
      customAttributes: customAttributes,
      status: status,
      offers: offers,
      description: description,
    };

    await addToAlgolia(data);
    return data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("error in structuredAlgoliaHtmlData", error);
  }
};

async function addToAlgolia(record: any) {
  if (!index) {
    console.warn("Algolia is not configured. Skipping index update. Set NEXT_PUBLIC_ALGOLIA_PROJECT_ID, NEXT_PUBLIC_ALGOLIA_API_KEY, and NEXT_PUBLIC_ALGOLIA_INDEX environment variables.");
    return;
  }
  try {
    await index.saveObject(record, {
      autoGenerateObjectIDIfNotExist: true,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("error in addToAlgolia", error);
  }
}

export const updateIndex = async (data: any) => {
  if (!index) {
    console.warn("Algolia is not configured. Skipping index update. Set NEXT_PUBLIC_ALGOLIA_PROJECT_ID, NEXT_PUBLIC_ALGOLIA_API_KEY, and NEXT_PUBLIC_ALGOLIA_INDEX environment variables.");
    return;
  }
  try {
    await index.partialUpdateObject(data);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log("error in updateIndex", error);
  }
};
