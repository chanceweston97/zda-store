/**
 * Script to import cable customizer data into Sanity
 * 
 * Usage:
 * 1. Make sure you have SANITY_PROJECT_API_TOKEN in your .env file
 * 2. Run: npm run import:cable-data
 * 
 * This script will:
 * 1. Import Cable Series
 * 2. Import Cable Types (and map series references)
 * 3. Import Connectors (and map cable type references)
 */

import { config } from 'dotenv';
import { createClient } from '@sanity/client';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env file
config();

// Sanity client configuration
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: 'production',
  apiVersion: '2023-03-09',
  useCdn: false,
  token: process.env.SANITY_PROJECT_API_TOKEN!,
});

interface CableSeries {
  _type: string;
  name: string;
  slug: { _type: string; current: string };
  order: number;
}

interface CableType {
  _type: string;
  name: string;
  slug: { _type: string; current: string };
  series: { _type: string; _ref: string };
  pricePerFoot: number;
  order: number;
  isActive: boolean;
}

interface Connector {
  _type: string;
  name: string;
  slug: { _type: string; current: string };
  isActive: boolean;
  order: number;
  pricing: Array<{
    _key: string;
    _type: string;
    cableType: { _type: string; _ref: string };
    price: number;
  }>;
}

async function importCableSeries(): Promise<Map<string, string>> {
  console.log('📦 Importing Cable Series...');
  
  const seriesData: CableSeries[] = [
    {
      _type: 'cableSeries',
      name: 'RG Series',
      slug: { _type: 'slug', current: 'rg-series' },
      order: 1,
    },
    {
      _type: 'cableSeries',
      name: 'LMR Series',
      slug: { _type: 'slug', current: 'lmr-series' },
      order: 2,
    },
  ];

  const seriesMap = new Map<string, string>();

  for (const series of seriesData) {
    try {
      // Check if series already exists
      const existing = await client.fetch(
        `*[_type == "cableSeries" && slug.current == $slug][0]`,
        { slug: series.slug.current }
      );

      if (existing) {
        console.log(`  ✓ ${series.name} already exists (ID: ${existing._id})`);
        seriesMap.set(series.slug.current, existing._id);
      } else {
        const result = await client.create(series);
        console.log(`  ✓ Created ${series.name} (ID: ${result._id})`);
        seriesMap.set(series.slug.current, result._id);
      }
    } catch (error: any) {
      console.error(`  ✗ Error importing ${series.name}:`, error.message);
    }
  }

  return seriesMap;
}

async function importCableTypes(seriesMap: Map<string, string>): Promise<Map<string, string>> {
  console.log('\n📦 Importing Cable Types...');

  const cableTypes: CableType[] = [
    // LMR Series
    { _type: 'cableType', name: 'LMR 100', slug: { _type: 'slug', current: 'lmr-100' }, series: { _type: 'reference', _ref: seriesMap.get('lmr-series')! }, pricePerFoot: 0.55, order: 1, isActive: true },
    { _type: 'cableType', name: 'LMR 195', slug: { _type: 'slug', current: 'lmr-195' }, series: { _type: 'reference', _ref: seriesMap.get('lmr-series')! }, pricePerFoot: 0.75, order: 2, isActive: true },
    { _type: 'cableType', name: 'LMR 195 UltraFlex', slug: { _type: 'slug', current: 'lmr-195-ultraflex' }, series: { _type: 'reference', _ref: seriesMap.get('lmr-series')! }, pricePerFoot: 0.75, order: 3, isActive: true },
    { _type: 'cableType', name: 'LMR 200', slug: { _type: 'slug', current: 'lmr-200' }, series: { _type: 'reference', _ref: seriesMap.get('lmr-series')! }, pricePerFoot: 0.85, order: 4, isActive: true },
    { _type: 'cableType', name: 'LMR 240', slug: { _type: 'slug', current: 'lmr-240' }, series: { _type: 'reference', _ref: seriesMap.get('lmr-series')! }, pricePerFoot: 0.88, order: 5, isActive: true },
    { _type: 'cableType', name: 'LMR 240 UltraFlex', slug: { _type: 'slug', current: 'lmr-240-ultraflex' }, series: { _type: 'reference', _ref: seriesMap.get('lmr-series')! }, pricePerFoot: 0.88, order: 6, isActive: true },
    { _type: 'cableType', name: 'LMR 400', slug: { _type: 'slug', current: 'lmr-400' }, series: { _type: 'reference', _ref: seriesMap.get('lmr-series')! }, pricePerFoot: 1.05, order: 7, isActive: true },
    { _type: 'cableType', name: 'LMR 400 UltraFlex', slug: { _type: 'slug', current: 'lmr-400-ultraflex' }, series: { _type: 'reference', _ref: seriesMap.get('lmr-series')! }, pricePerFoot: 1.05, order: 8, isActive: true },
    { _type: 'cableType', name: 'LMR 600', slug: { _type: 'slug', current: 'lmr-600' }, series: { _type: 'reference', _ref: seriesMap.get('lmr-series')! }, pricePerFoot: 1.98, order: 9, isActive: true },
    // RG Series
    { _type: 'cableType', name: 'RG 58', slug: { _type: 'slug', current: 'rg-58' }, series: { _type: 'reference', _ref: seriesMap.get('rg-series')! }, pricePerFoot: 0.75, order: 1, isActive: true },
    { _type: 'cableType', name: 'RG 142', slug: { _type: 'slug', current: 'rg-142' }, series: { _type: 'reference', _ref: seriesMap.get('rg-series')! }, pricePerFoot: 3.85, order: 2, isActive: true },
    { _type: 'cableType', name: 'RG 174', slug: { _type: 'slug', current: 'rg-174' }, series: { _type: 'reference', _ref: seriesMap.get('rg-series')! }, pricePerFoot: 0.45, order: 3, isActive: true },
    { _type: 'cableType', name: 'RG 213', slug: { _type: 'slug', current: 'rg-213' }, series: { _type: 'reference', _ref: seriesMap.get('rg-series')! }, pricePerFoot: 1.05, order: 4, isActive: true },
    { _type: 'cableType', name: 'RG 223', slug: { _type: 'slug', current: 'rg-223' }, series: { _type: 'reference', _ref: seriesMap.get('rg-series')! }, pricePerFoot: 1.25, order: 5, isActive: true },
    { _type: 'cableType', name: 'RG 316', slug: { _type: 'slug', current: 'rg-316' }, series: { _type: 'reference', _ref: seriesMap.get('rg-series')! }, pricePerFoot: 0.55, order: 6, isActive: true },
  ];

  const cableTypeMap = new Map<string, string>();

  for (const cableType of cableTypes) {
    try {
      // Check if cable type already exists
      const existing = await client.fetch(
        `*[_type == "cableType" && slug.current == $slug][0]`,
        { slug: cableType.slug.current }
      );

      if (existing) {
        console.log(`  ✓ ${cableType.name} already exists (ID: ${existing._id})`);
        cableTypeMap.set(cableType.slug.current, existing._id);
      } else {
        const result = await client.create(cableType);
        console.log(`  ✓ Created ${cableType.name} (ID: ${result._id})`);
        cableTypeMap.set(cableType.slug.current, result._id);
      }
    } catch (error: any) {
      console.error(`  ✗ Error importing ${cableType.name}:`, error.message);
    }
  }

  return cableTypeMap;
}

async function importConnectors(cableTypeMap: Map<string, string>) {
  console.log('\n📦 Importing Connectors...');

  const connectorsDir = path.join(process.cwd(), 'sanity-seed-data', 'connectors');
  const connectorFiles = fs.readdirSync(connectorsDir).filter(file => file.endsWith('.json'));

  // Map cable type names to slugs for reference lookup
  const cableTypeNameToSlug: Record<string, string> = {
    'LMR 100': 'lmr-100',
    'LMR 195': 'lmr-195',
    'LMR 200': 'lmr-200',
    'LMR 240': 'lmr-240',
    'LMR 400': 'lmr-400',
    'LMR 600': 'lmr-600',
    'LMR 400 UltraFlex': 'lmr-400-ultraflex',
    'LMR 195 UltraFlex': 'lmr-195-ultraflex',
    'LMR 240 UltraFlex': 'lmr-240-ultraflex',
    'RG 58': 'rg-58',
    'RG 142': 'rg-142',
    'RG 174': 'rg-174',
    'RG 213': 'rg-213',
    'RG 223': 'rg-223',
    'RG 316': 'rg-316',
  };

  // Map placeholder IDs to actual cable type slugs
  const placeholderToSlug: Record<string, string> = {
    'CABLE_TYPE_LMR_100_ID': 'lmr-100',
    'CABLE_TYPE_LMR_195_ID': 'lmr-195',
    'CABLE_TYPE_LMR_200_ID': 'lmr-200',
    'CABLE_TYPE_LMR_240_ID': 'lmr-240',
    'CABLE_TYPE_LMR_400_ID': 'lmr-400',
    'CABLE_TYPE_LMR_600_ID': 'lmr-600',
    'CABLE_TYPE_LMR_400_ULTRAFLEX_ID': 'lmr-400-ultraflex',
    'CABLE_TYPE_LMR_195_ULTRAFLEX_ID': 'lmr-195-ultraflex',
    'CABLE_TYPE_LMR_240_ULTRAFLEX_ID': 'lmr-240-ultraflex',
    'CABLE_TYPE_RG_58_ID': 'rg-58',
    'CABLE_TYPE_RG_142_ID': 'rg-142',
    'CABLE_TYPE_RG_174_ID': 'rg-174',
    'CABLE_TYPE_RG_213_ID': 'rg-213',
    'CABLE_TYPE_RG_223_ID': 'rg-223',
    'CABLE_TYPE_RG_316_ID': 'rg-316',
  };

  for (const file of connectorFiles) {
    try {
      const filePath = path.join(connectorsDir, file);
      const connectorData: Connector = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      // Replace placeholder cable type references with actual IDs
      connectorData.pricing = connectorData.pricing.map((pricing) => {
        const placeholder = pricing.cableType._ref;
        const slug = placeholderToSlug[placeholder];
        
        if (!slug) {
          console.warn(`  ⚠️  Unknown placeholder: ${placeholder} in ${connectorData.name}`);
          return pricing;
        }

        const cableTypeId = cableTypeMap.get(slug);
        if (!cableTypeId) {
          console.warn(`  ⚠️  Cable type not found: ${slug} in ${connectorData.name}`);
          return pricing;
        }

        return {
          ...pricing,
          cableType: {
            _type: 'reference',
            _ref: cableTypeId,
          },
        };
      });

      // Check if connector already exists
      const existing = await client.fetch(
        `*[_type == "connector" && slug.current == $slug][0]`,
        { slug: connectorData.slug.current }
      );

      if (existing) {
        console.log(`  ✓ ${connectorData.name} already exists (ID: ${existing._id})`);
        // Optionally update existing connector
        // await client.patch(existing._id).set(connectorData).commit();
      } else {
        const result = await client.create(connectorData);
        console.log(`  ✓ Created ${connectorData.name} (ID: ${result._id})`);
      }
    } catch (error: any) {
      console.error(`  ✗ Error importing ${file}:`, error.message);
    }
  }
}

async function main() {
  console.log('🚀 Starting cable customizer data import...\n');

  // Check environment variables
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const apiToken = process.env.SANITY_PROJECT_API_TOKEN;

  if (!projectId) {
    console.error('❌ NEXT_PUBLIC_SANITY_PROJECT_ID is not set in .env file');
    console.error('   Please add: NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id');
    process.exit(1);
  }

  if (!apiToken) {
    console.error('❌ SANITY_PROJECT_API_TOKEN is not set in .env file');
    console.error('   Please add: SANITY_PROJECT_API_TOKEN=your-api-token');
    console.error('   Get your token from: https://www.sanity.io/manage');
    process.exit(1);
  }

  console.log(`✓ Project ID: ${projectId}`);
  console.log(`✓ API Token: ${apiToken.substring(0, 10)}...\n`);

  try {
    // Step 1: Import Cable Series
    const seriesMap = await importCableSeries();

    // Step 2: Import Cable Types
    const cableTypeMap = await importCableTypes(seriesMap);

    // Step 3: Import Connectors
    await importConnectors(cableTypeMap);

    console.log('\n✅ Import completed successfully!');
    console.log('   Check your Sanity Studio at /admin to see the imported data.');
  } catch (error: any) {
    console.error('\n❌ Import failed:', error.message);
    process.exit(1);
  }
}

main();

