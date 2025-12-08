# Extract Data from Sanity to Local Files

This guide helps you extract your existing Sanity data and convert it to the local TypeScript file format.

## Option 1: Using Sanity CLI (Recommended)

1. **Install Sanity CLI** (if not already installed):
   ```bash
   npm install -g @sanity/cli
   ```

2. **Export your dataset:**
   ```bash
   cd zda-sanity
   sanity dataset export production ./sanity-export.tar.gz
   ```

3. **Extract the export:**
   ```bash
   tar -xzf sanity-export.tar.gz
   ```

4. **Transform the data:**
   - The export will contain JSON files
   - You'll need to transform them to match the TypeScript format
   - Update image URLs to local paths

## Option 2: Manual Extraction Script

Create a script to query Sanity and generate TypeScript files:

```typescript
// scripts/extract-to-local.ts
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: 'production',
  useCdn: false,
});

async function extractCableSeries() {
  const series = await client.fetch(`*[_type == "cableSeries"]`);
  // Transform and write to data/cable-customizer/cable-series.ts
}

async function extractCableTypes() {
  const types = await client.fetch(`*[_type == "cableType"]`);
  // Transform and write to data/cable-customizer/cable-types.ts
}

async function extractConnectors() {
  const connectors = await client.fetch(`*[_type == "connector"]`);
  // Transform and write to data/cable-customizer/connectors.ts
}

// Run extraction
async function main() {
  await extractCableSeries();
  await extractCableTypes();
  await extractConnectors();
}

main();
```

## Option 3: Manual Copy from Sanity Studio

1. Go to your Sanity Studio
2. For each document type:
   - View the data
   - Copy relevant fields
   - Paste into the corresponding TypeScript file
   - Update image URLs to local paths

## Image Migration

After extracting data:

1. **Download images from Sanity:**
   - Images are stored in Sanity CDN
   - Download them to your local `public/images/` directory

2. **Update image paths in data files:**
   - Change from Sanity CDN URLs to local paths
   - Example: `https://cdn.sanity.io/...` → `/images/products/product-1.png`

3. **Organize images:**
   ```
   public/images/
   ├── products/
   ├── categories/
   ├── cable-customizer/
   │   ├── cable-types/
   │   └── connectors/
   └── hero/
   ```

## Data Transformation Notes

### Cable Series
- `_id` → `id`
- `name` → `name`
- `slug.current` → `slug`
- `order` → `order`

### Cable Types
- `_id` → `id`
- `name` → `name`
- `slug.current` → `slug`
- `series._ref` → Look up series and include full object
- `image.asset->url` → Download and use local path
- `pricePerFoot` → `pricePerFoot`

### Connectors
- `_id` → `id`
- `name` → `name`
- `slug.current` → `slug`
- `image.asset->url` → Download and use local path
- `pricing[]` → Transform to include full cableType objects

### Products
- `_id` → `id`
- `name` → `name`
- `slug.current` → `slug`
- `productType` → `productType`
- `category->` → Transform to category object
- Images: Download and use local paths
- Rich text: Keep as-is or convert to plain text

## Quick Start

1. **Start with cable customizer data** (most important):
   - Extract cable series
   - Extract cable types
   - Extract connectors

2. **Then extract products:**
   - Antennas
   - Cables
   - Connectors

3. **Finally extract content:**
   - Hero banners
   - FAQs
   - Other content

4. **Download and organize images**

5. **Update image paths in all data files**


