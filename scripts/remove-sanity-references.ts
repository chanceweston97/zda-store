/**
 * Utility script to remove references to a document and optionally delete it
 * 
 * WARNING: This script will modify documents. Use with caution!
 * 
 * Usage:
 *   npx tsx scripts/remove-sanity-references.ts <document-id> [--delete]
 * 
 * Examples:
 *   # Just find and show references
 *   npx tsx scripts/remove-sanity-references.ts b15a5bbe-7505-4811-adfa-10ea025c9e0d
 * 
 *   # Remove references and delete the document
 *   npx tsx scripts/remove-sanity-references.ts b15a5bbe-7505-4811-adfa-10ea025c9e0d --delete
 */

import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") }); // Load environment variables
config({ path: resolve(process.cwd(), ".env") }); // Also try .env

import { createClient } from "next-sanity";
import * as readline from "readline";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = "2023-03-09";
const token = process.env.SANITY_PROJECT_API_TOKEN;

if (!projectId) {
  console.error("❌ NEXT_PUBLIC_SANITY_PROJECT_ID environment variable is required");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Use direct API for mutations
  token, // Need write token
});

function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function findReferences(documentId: string) {
  const query = `*[references("${documentId}")]{
    _id,
    _type,
    name,
    title,
    slug
  }`;

  return await client.fetch(query);
}

async function removeReferenceFromDocument(
  docId: string,
  docType: string,
  referenceId: string
) {
  // Get the full document first to see what fields reference it
  const doc = await client.fetch(`*[_id == "${docId}"][0]`);
  
  if (!doc) {
    throw new Error(`Document ${docId} not found`);
  }

  // Use Sanity's patch API to unset reference fields
  const patch = client.patch(docId);
  let hasChanges = false;

  // Check if product field directly references it
  if (doc.product?._ref === referenceId) {
    patch.unset(['product']);
    hasChanges = true;
  }

  // Recursively check for references in nested objects/arrays
  function checkAndUnset(obj: any, path: string[] = []): void {
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        if (item && typeof item === "object") {
          if (item._ref === referenceId) {
            // Remove this item from array
            patch.unset([...path, index]);
            hasChanges = true;
          } else {
            checkAndUnset(item, [...path, index]);
          }
        }
      });
    } else if (obj && typeof obj === "object") {
      if (obj._ref === referenceId) {
        patch.unset(path);
        hasChanges = true;
      } else {
        for (const [key, value] of Object.entries(obj)) {
          if (key !== "_id" && key !== "_type" && key !== "_rev") {
            checkAndUnset(value, [...path, key]);
          }
        }
      }
    }
  }

  // Check all fields
  for (const [key, value] of Object.entries(doc)) {
    if (key !== "_id" && key !== "_type" && key !== "_rev") {
      checkAndUnset(value, [key]);
    }
  }

  if (hasChanges) {
    await patch.commit();
    return true;
  }

  return false;
}

async function deleteDocument(documentId: string) {
  await client.delete(documentId);
}

async function main() {
  const documentId = process.argv[2];
  const shouldDelete = process.argv.includes("--delete");

  if (!documentId) {
    console.error("❌ Please provide a document ID");
    console.log("\nUsage: npx tsx scripts/remove-sanity-references.ts <document-id> [--delete]");
    process.exit(1);
  }

  if (!token) {
    console.error("❌ SANITY_PROJECT_API_TOKEN environment variable is required for mutations");
    process.exit(1);
  }

  console.log(`\n🔍 Finding references to document: ${documentId}\n`);

  const references = await findReferences(documentId);

  if (references.length === 0) {
    console.log("✅ No references found!");
    
    if (shouldDelete) {
      const confirm = await askQuestion("Delete this document? (yes/no): ");
      if (confirm.toLowerCase() === "yes") {
        await deleteDocument(documentId);
        console.log("✅ Document deleted successfully!");
      } else {
        console.log("❌ Deletion cancelled");
      }
    }
    return;
  }

  console.log(`⚠️  Found ${references.length} document(s) referencing this document:\n`);
  references.forEach((doc: any, index: number) => {
    console.log(`${index + 1}. ${doc._type} - ${doc._id}`);
    console.log(`   Name: ${doc.name || doc.title || "N/A"}\n`);
  });

  if (shouldDelete) {
    console.log("⚠️  WARNING: This will remove references from the above documents!");
    const confirm = await askQuestion("Continue? (yes/no): ");
    
    if (confirm.toLowerCase() !== "yes") {
      console.log("❌ Operation cancelled");
      return;
    }

    console.log("\n🔄 Removing references...\n");
    
    for (const ref of references) {
      try {
        const removed = await removeReferenceFromDocument(
          ref._id,
          ref._type,
          documentId
        );
        if (removed) {
          console.log(`✅ Removed reference from ${ref._type} (${ref._id})`);
        } else {
          console.log(`ℹ️  No changes needed for ${ref._type} (${ref._id})`);
        }
      } catch (error: any) {
        console.error(`❌ Error removing reference from ${ref._id}:`, error.message);
      }
    }

    console.log("\n🗑️  Deleting document...");
    try {
      await deleteDocument(documentId);
      console.log("✅ Document deleted successfully!");
    } catch (error: any) {
      console.error("❌ Error deleting document:", error.message);
      console.log("\n💡 You may need to manually remove references in Sanity Studio");
    }
  } else {
    console.log("\n💡 To automatically remove references and delete, run:");
    console.log(`   npx tsx scripts/remove-sanity-references.ts ${documentId} --delete\n`);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

