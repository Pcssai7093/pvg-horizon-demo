# PVG Horizon

Static React storefront for Indian imitation jewellery.

## Run locally

    npm ci
    npm run dev

Use the local URL printed in the terminal. To create a deployable build, run
`npm run build`. Upload the contents of `dist/` to a static host that supports
commercial storefronts. GitHub can hold the source code. GitHub Pages hosting
excludes ecommerce sites under its usage limits.

## Store details

Update `src/store-settings.json` before launch. Add the WhatsApp business number
as digits including the country code, the business email and public location,
and the confirmed shipping, returns, and order terms. Add prices in INR using
the product IDs as keys in `prices`. Blank prices show as Price on request.
The WhatsApp button becomes active when a valid number is configured.

The desktop hero uses the model video in `public/catalog/hero.mp4`. The CZ 6198 product photo is the poster and mobile fallback.

The hand-written featured items live in `src/catalog.js`. The wider necklace
catalog lives in `src/imported-catalog.json`, with up to three JPEG photos for
each entry. To refresh that catalog on Windows:

    .\scripts\import-catalog.ps1 -CatalogRoot "C:\path\to\Neclake list"

The importer excludes earring, bindi, duplicate export, and miscellaneous folders.
Review newly imported names, styling copy, and listing photos before launch.

To refresh the improved listing covers and alternate photos, run:

    .\scripts\import-listing-photos.ps1 -ListingRoot "C:\path\to\Bharathi Listings create workspace"

The importer matches the product family and full SKU label, including colour.
It writes additional JPEGs and an overlay in `src/listing-photos.json`. The
storefront puts those photos first and keeps original photos as alternate views.

