# Local Data Files

This directory contains all product, category, and content data as local TypeScript files. You can edit these files directly to update your store data.

## Directory Structure

```
data/
├── products/          # Product data (antennas, cables, connectors)
├── categories/        # Category data
├── cable-customizer/  # Cable customizer data (series, types, connectors)
├── content/           # Content data (hero banners, FAQs, etc.)
└── types.ts           # TypeScript type definitions
```

## How to Update Data

### Cable Customizer Data

1. **Cable Series** (`cable-customizer/cable-series.ts`)
   - Edit the `cableSeries` array
   - Add/remove series as needed

2. **Cable Types** (`cable-customizer/cable-types.ts`)
   - Edit the `cableTypes` array
   - Update `pricePerFoot` for pricing
   - Update `lengthOptions` for available lengths
   - Update image paths: `/images/cable-customizer/cable-types/your-image.png`

3. **Connectors** (`cable-customizer/connectors.ts`)
   - Edit the `connectors` array
   - Update `pricing` array for each connector
   - Each connector needs pricing for each cable type it supports
   - Update image paths: `/images/cable-customizer/connectors/your-image.png`

### Products Data

Edit `products/index.ts` to add/update products:
- Antenna products
- Cable products
- Connector products

### Categories Data

Edit `categories/index.ts` to add/update categories.

### Content Data

Edit files in `content/` directory:
- `hero-banners.ts` - Homepage hero banners
- `hero-introduction.ts` - Hero introduction section
- `proud-partners.ts` - Partners section
- `what-we-offer.ts` - What we offer section
- `our-story.ts` - Our story content
- `faq.ts` - FAQ items

## Image Paths

All images should be placed in `/public/images/` directory:
- Product images: `/public/images/products/`
- Cable customizer images: `/public/images/cable-customizer/`
- Category images: `/public/images/categories/`
- Content images: `/public/images/content/`

Reference them in data files as:
```typescript
image: "/images/products/product-1.png"
```

## Extracting Data from Sanity

If you have existing Sanity data, you can:

1. **Export from Sanity Studio:**
   - Go to Sanity Studio
   - Export data as JSON
   - Transform JSON to match the TypeScript format

2. **Use Sanity CLI:**
   ```bash
   sanity dataset export production
   ```

3. **Manual Copy:**
   - Copy data from Sanity Studio
   - Paste into the TypeScript files
   - Update image URLs to local paths

## Type Safety

All data files use TypeScript types defined in `types.ts`. This ensures:
- Type safety when editing
- Autocomplete in your IDE
- Compile-time error checking


