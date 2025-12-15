# How to Import Cable Customizer Data into Sanity

The JSON files in this directory need to be imported into your Sanity project. Simply pushing them to git won't add them to Sanity - you need to run an import script.

## Option 1: Using the Import Script (Recommended)

### Step 1: Install Dependencies

```bash
npm install
# or
yarn install
```

### Step 2: Set Up Environment Variables

Make sure your `.env` file has:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
SANITY_PROJECT_API_TOKEN=your-api-token
```

**To get your API token:**
1. Go to https://www.sanity.io/manage
2. Select your project
3. Go to **API** → **Tokens**
4. Create a new token with **Editor** permissions
5. Copy the token to your `.env` file

### Step 3: Run the Import Script

```bash
npm run import:cable-data
# or
yarn import:cable-data
```

The script will:
1. ✅ Import Cable Series (RG Series, LMR Series)
2. ✅ Import Cable Types (all 15 cable types)
3. ✅ Import Connectors (all 14 connectors with pricing)

## Option 2: Manual Import via Sanity Studio

1. Go to your Sanity Studio at `/admin`
2. Manually create each document:
   - **Cable Series**: Create "RG Series" and "LMR Series"
   - **Cable Type**: Create each cable type and link to the series
   - **Connector**: Create each connector and add pricing for each cable type

## Option 3: Using Sanity CLI Import

You can also use Sanity's import tool:

```bash
# Install Sanity CLI if not already installed
npm install -g @sanity/cli

# Import documents
sanity import ./sanity-seed-data/connectors/*.json --replace
```

## Troubleshooting

### "SANITY_PROJECT_API_TOKEN is not set"
- Make sure you have the token in your `.env` file
- The token needs **Editor** permissions

### "Cable type not found" warnings
- Make sure cable types are imported before connectors
- The script handles this automatically, but if importing manually, import in order: Series → Types → Connectors

### "Already exists" messages
- The script checks for existing documents and won't create duplicates
- If you want to update existing documents, you'll need to do it manually in Sanity Studio

## After Import

1. Go to `/admin` in your Sanity Studio
2. You should see:
   - **Cable Series** (2 items)
   - **Cable Type** (15 items)
   - **Connector** (14 items)
3. Verify the data looks correct
4. Test the cable customizer on your website

