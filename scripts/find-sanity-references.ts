/**
 * Utility script to find documents that reference a specific Sanity document
 * 
 * Usage:
 *   npx tsx scripts/find-sanity-references.ts <document-id>
 * 
 * Example:
 *   npx tsx scripts/find-sanity-references.ts b15a5bbe-7505-4811-adfa-10ea025c9e0d
 */

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") }); // Load environment variables
config({ path: resolve(process.cwd(), ".env") }); // Also try .env

import { createClient } from "next-sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = "2023-03-09";

if (!projectId) {
  console.error("❌ NEXT_PUBLIC_SANITY_PROJECT_ID environment variable is required");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Use direct API for mutations
});

async function findReferences(documentId: string) {
  console.log(`\n🔍 Searching for references to document: ${documentId}\n`);

  // Query to find all documents that reference this document
  // This checks common reference field patterns
  const query = `*[references("${documentId}")]{
    _id,
    _type,
    name,
    title,
    slug,
    "references": [
      *[_id == "${documentId}"][0]{
        _id,
        _type,
        name,
        title
      }
    ]
  }`;

  try {
    const referencingDocs = await client.fetch(query);

    if (referencingDocs.length === 0) {
      console.log("✅ No references found! The document can be safely deleted.");
      return [];
    }

    console.log(`⚠️  Found ${referencingDocs.length} document(s) referencing this document:\n`);
    
    referencingDocs.forEach((doc: any, index: number) => {
      console.log(`${index + 1}. Document ID: ${doc._id}`);
      console.log(`   Type: ${doc._type}`);
      console.log(`   Name/Title: ${doc.name || doc.title || "N/A"}`);
      if (doc.slug?.current) {
        console.log(`   Slug: ${doc.slug.current}`);
      }
      console.log("");
    });

    return referencingDocs;
  } catch (error: any) {
    console.error("❌ Error finding references:", error.message);
    throw error;
  }
}

async function getDocumentDetails(documentId: string) {
  try {
    const query = `*[_id == "${documentId}"][0]{
      _id,
      _type,
      name,
      title,
      slug
    }`;
    
    const doc = await client.fetch(query);
    return doc;
  } catch (error: any) {
    console.error("❌ Error fetching document details:", error.message);
    return null;
  }
}

async function main() {
  const documentId = process.argv[2];

  if (!documentId) {
    console.error("❌ Please provide a document ID");
    console.log("\nUsage: npx tsx scripts/find-sanity-references.ts <document-id>");
    process.exit(1);
  }

  // Get document details first
  const docDetails = await getDocumentDetails(documentId);
  if (docDetails) {
    console.log("📄 Document Details:");
    console.log(`   ID: ${docDetails._id}`);
    console.log(`   Type: ${docDetails._type}`);
    console.log(`   Name/Title: ${docDetails.name || docDetails.title || "N/A"}`);
    if (docDetails.slug?.current) {
      console.log(`   Slug: ${docDetails.slug.current}`);
    }
  }

  // Find references
  const references = await findReferences(documentId);

  if (references.length > 0) {
    console.log("\n📝 To delete this document, you need to:");
    console.log("   1. Open each referencing document in Sanity Studio");
    console.log("   2. Remove the reference field that points to this document");
    console.log("   3. Save the changes");
    console.log("   4. Then try deleting this document again\n");
    
    console.log("💡 Tip: You can also use the Sanity Studio's 'Unset' action");
    console.log("   to remove references, or edit the documents directly.\n");
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

