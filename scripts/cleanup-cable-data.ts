/**
 * Script to clean up/delete cable customizer data from Sanity
 * 
 * Usage:
 * npm run cleanup:cable-data
 * 
 * This will delete all:
 * - Connectors
 * - Cable Types
 * - Cable Series
 * 
 * Use with caution! This permanently deletes data.
 */

import { config } from 'dotenv';
import { createClient } from '@sanity/client';
import * as readline from 'readline';

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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function deleteAllConnectors() {
  console.log('\n📦 Fetching all connectors...');
  const connectors = await client.fetch(`*[_type == "connector"]`);
  console.log(`   Found ${connectors.length} connectors`);
  
  if (connectors.length === 0) {
    console.log('   No connectors to delete.');
    return;
  }

  for (const connector of connectors) {
    try {
      await client.delete(connector._id);
      console.log(`   ✓ Deleted: ${connector.name} (${connector._id})`);
    } catch (error: any) {
      console.error(`   ✗ Error deleting ${connector.name}:`, error.message);
    }
  }
}

async function deleteAllCableTypes() {
  console.log('\n📦 Fetching all cable types...');
  const cableTypes = await client.fetch(`*[_type == "cableType"]`);
  console.log(`   Found ${cableTypes.length} cable types`);
  
  if (cableTypes.length === 0) {
    console.log('   No cable types to delete.');
    return;
  }

  for (const cableType of cableTypes) {
    try {
      await client.delete(cableType._id);
      console.log(`   ✓ Deleted: ${cableType.name} (${cableType._id})`);
    } catch (error: any) {
      console.error(`   ✗ Error deleting ${cableType.name}:`, error.message);
    }
  }
}

async function deleteAllCableSeries() {
  console.log('\n📦 Fetching all cable series...');
  const series = await client.fetch(`*[_type == "cableSeries"]`);
  console.log(`   Found ${series.length} cable series`);
  
  if (series.length === 0) {
    console.log('   No cable series to delete.');
    return;
  }

  for (const s of series) {
    try {
      await client.delete(s._id);
      console.log(`   ✓ Deleted: ${s.name} (${s._id})`);
    } catch (error: any) {
      console.error(`   ✗ Error deleting ${s.name}:`, error.message);
    }
  }
}

async function listAllCableData() {
  console.log('\n📋 Current Cable Customizer Data in Sanity:\n');
  
  const series = await client.fetch(`*[_type == "cableSeries"] | order(name asc)`);
  const cableTypes = await client.fetch(`*[_type == "cableType"] | order(name asc)`);
  const connectors = await client.fetch(`*[_type == "connector"] | order(name asc)`);

  console.log(`Cable Series (${series.length}):`);
  series.forEach((s: any) => {
    console.log(`  - ${s.name} (${s.slug?.current || 'no slug'}) - ID: ${s._id}`);
  });

  console.log(`\nCable Types (${cableTypes.length}):`);
  cableTypes.forEach((ct: any) => {
    const seriesName = ct.series?.name || 'No series';
    console.log(`  - ${ct.name} (${seriesName}) - ID: ${ct._id}`);
  });

  console.log(`\nConnectors (${connectors.length}):`);
  connectors.forEach((c: any) => {
    console.log(`  - ${c.name} (${c.slug?.current || 'no slug'}) - ID: ${c._id}`);
  });

  return { series, cableTypes, connectors };
}

async function main() {
  console.log('🧹 Cable Customizer Data Cleanup Tool\n');

  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    console.error('❌ NEXT_PUBLIC_SANITY_PROJECT_ID is not set in .env file');
    process.exit(1);
  }

  if (!process.env.SANITY_PROJECT_API_TOKEN) {
    console.error('❌ SANITY_PROJECT_API_TOKEN is not set in .env file');
    console.error('   Get your token from: https://www.sanity.io/manage');
    process.exit(1);
  }

  try {
    // First, list all current data
    const data = await listAllCableData();

    // Ask what to delete
    console.log('\n⚠️  WARNING: This will permanently delete data from Sanity!');
    const answer = await question('\nWhat would you like to delete?\n1. All Connectors\n2. All Cable Types\n3. All Cable Series\n4. Everything (Connectors + Types + Series)\n5. Cancel\n\nEnter choice (1-5): ');

    if (answer === '5' || !['1', '2', '3', '4'].includes(answer)) {
      console.log('\n❌ Cancelled.');
      rl.close();
      return;
    }

    const confirm = await question('\n⚠️  Are you sure? Type "DELETE" to confirm: ');
    if (confirm !== 'DELETE') {
      console.log('\n❌ Cancelled. You must type "DELETE" to confirm.');
      rl.close();
      return;
    }

    if (answer === '1' || answer === '4') {
      await deleteAllConnectors();
    }

    if (answer === '2' || answer === '4') {
      await deleteAllCableTypes();
    }

    if (answer === '3' || answer === '4') {
      await deleteAllCableSeries();
    }

    console.log('\n✅ Cleanup completed!');
    console.log('   You can now re-import data using: npm run import:cable-data');
  } catch (error: any) {
    console.error('\n❌ Cleanup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();

