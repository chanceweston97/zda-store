/**
 * Script to extract all Sanity data to local JSON/TS files
 * This allows us to remove Sanity dependency gradually
 * 
 * Run: tsx scripts/extract-sanity-to-local.ts
 */

import { createClient } from "next-sanity";
import * as fs from "fs";
import * as path from "path";
import clientConfig from "../src/sanity/config/client-config";

const client = createClient(clientConfig);

// Output directory for extracted data
const DATA_DIR = path.join(process.cwd(), "data", "extracted");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

async function extractProducts() {
  console.log("Extracting products...");
  const products = await client.fetch(`
    *[_type == "product"] | order(displayOrder asc, _createdAt desc) {
      _id,
      _type,
      name,
      "slug": slug.current,
      productType,
      category-> {
        _id,
        title,
        "slug": slug.current
      },
      price,
      discountedPrice,
      connectorPrice,
      gainOptions,
      lengthOptions,
      cableSeries-> {
        _id,
        name,
        "slug": slug.current
      },
      cableType-> {
        _id,
        name,
        "slug": slug.current
      },
      connectorA-> {
        _id,
        name,
        "slug": slug.current
      },
      connectorB-> {
        _id,
        name,
        "slug": slug.current
      },
      reviews,
      tags,
      description,
      shortDescription,
      colors,
      thumbnails,
      previewImages,
      additionalInformation,
      customAttributes,
      status,
      offers,
      price_id,
      currency,
      body,
      sizes,
      inStock,
      featureTitle,
      features,
      applications,
      datasheetImage,
      datasheetPdf,
      datasheetPdfUrl,
      specifications
    }
  `);

  // Save as JSON
  fs.writeFileSync(
    path.join(DATA_DIR, "products.json"),
    JSON.stringify(products, null, 2)
  );

  // Also create TypeScript file
  const tsContent = `// Auto-generated from Sanity
// Run: tsx scripts/extract-sanity-to-local.ts

import { Product } from "@/types/product";

export const products: Product[] = ${JSON.stringify(products, null, 2)} as Product[];

export default products;
`;

  fs.writeFileSync(
    path.join(DATA_DIR, "products.ts"),
    tsContent
  );

  console.log(`✓ Extracted ${products.length} products`);
}

async function extractCategories() {
  console.log("Extracting categories...");
  const categories = await client.fetch(`
    *[_type == "category"] {
      _id,
      title,
      "slug": slug.current,
      image,
      description,
      parent-> {
        _id,
        title,
        "slug": slug.current
      },
      subcategories[]-> {
        _id,
        title,
        "slug": slug.current
      }
    }
  `);

  fs.writeFileSync(
    path.join(DATA_DIR, "categories.json"),
    JSON.stringify(categories, null, 2)
  );

  const tsContent = `// Auto-generated from Sanity
import { Category } from "@/types/category";

export const categories: Category[] = ${JSON.stringify(categories, null, 2)} as Category[];

export default categories;
`;

  fs.writeFileSync(
    path.join(DATA_DIR, "categories.ts"),
    tsContent
  );

  console.log(`✓ Extracted ${categories.length} categories`);
}

async function extractContent() {
  console.log("Extracting content (hero, FAQ, etc.)...");
  
  // Hero Banners
  const heroBanners = await client.fetch(`
    *[_type == "heroBanner"] | order(order asc) {
      _id,
      title,
      subtitle,
      image,
      link,
      buttonText,
      order,
      brandName,
      card {
        image,
        title,
        description
      }
    }
  `);

  // Hero Introduction
  const heroIntroduction = await client.fetch(`
    *[_type == "heroIntroduction"][0] {
      _id,
      title,
      description,
      image
    }
  `);

  // Proud Partners
  const proudPartners = await client.fetch(`
    *[_type == "proudPartners"][0] {
      _id,
      title,
      partners[] {
        name,
        logo,
        link
      }
    }
  `);

  // What We Offer
  const whatWeOffer = await client.fetch(`
    *[_type == "whatWeOffer"][0] {
      _id,
      title,
      headerButton {
        text,
        link
      },
      offerItems[] {
        title,
        tags,
        description,
        button {
          text,
          link
        },
        image,
        imagePosition
      }
    }
  `);

  // FAQ
  const faqs = await client.fetch(`
    *[_type == "faq"] | order(order asc) {
      _id,
      question,
      answer,
      order
    }
  `);

  const content = {
    heroBanners,
    heroIntroduction,
    proudPartners,
    whatWeOffer,
    faqs,
  };

  fs.writeFileSync(
    path.join(DATA_DIR, "content.json"),
    JSON.stringify(content, null, 2)
  );

  const tsContent = `// Auto-generated from Sanity
export const content = ${JSON.stringify(content, null, 2)};

export default content;
`;

  fs.writeFileSync(
    path.join(DATA_DIR, "content.ts"),
    tsContent
  );

  console.log(`✓ Extracted content data`);
}

async function extractCableCustomizer() {
  console.log("Extracting cable customizer data...");
  
  // Cable Series
  const cableSeries = await client.fetch(`
    *[_type == "cableSeries"] | order(order asc) {
      _id,
      name,
      "slug": slug.current,
      order
    }
  `);

  // Cable Types
  const cableTypes = await client.fetch(`
    *[_type == "cableType"] {
      _id,
      name,
      "slug": slug.current,
      series-> {
        _id,
        name,
        "slug": slug.current
      },
      pricePerFoot,
      image,
      order,
      isActive,
      sku,
      lengthOptions,
      description,
      specifications
    }
  `);

  // Connectors
  const connectors = await client.fetch(`
    *[_type == "connector"] {
      _id,
      name,
      "slug": slug.current,
      image,
      pricing[] {
        cableType-> {
          _id,
          name,
          "slug": slug.current
        },
        price
      },
      order,
      isActive
    }
  `);

  const cableData = {
    cableSeries,
    cableTypes,
    connectors,
  };

  fs.writeFileSync(
    path.join(DATA_DIR, "cable-customizer.json"),
    JSON.stringify(cableData, null, 2)
  );

  const tsContent = `// Auto-generated from Sanity
export const cableCustomizerData = ${JSON.stringify(cableData, null, 2)};

export default cableCustomizerData;
`;

  fs.writeFileSync(
    path.join(DATA_DIR, "cable-customizer.ts"),
    tsContent
  );

  console.log(`✓ Extracted cable customizer data`);
}

async function main() {
  console.log("Starting Sanity data extraction...\n");

  try {
    await extractProducts();
    await extractCategories();
    await extractContent();
    await extractCableCustomizer();

    console.log("\n✓ All data extracted successfully!");
    console.log(`Data saved to: ${DATA_DIR}`);
  } catch (error) {
    console.error("Error extracting data:", error);
    process.exit(1);
  }
}

main();

