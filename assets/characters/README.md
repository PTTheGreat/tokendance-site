# Island residents

These five standalone SVGs are the source of truth for all animal drawings. All use a 120 × 140 viewBox, small dark eyes, two-tone rounded shapes and a shared ground shadow. Species identity comes from the ears, tail and body silhouette. Keep cream/sage dominant and honey limited to the bee and Goldie's ears/collar.

The backgrounds `island-stage.webp` and each product's `garden-stage.webp` contain no animals. HTML draws characters in the background's 1536 × 1024 coordinate system. Do not bake a differently drawn animal back into those backgrounds.

After changing a character, run from this repository:

```sh
node scripts/sync-characters.mjs ../every15min-site ../epicare-site
```

This rebuilds the animal symbols inside `assets/icons.svg`, the native SVG social card, and the two product mascots. Product homepages and privacy pages reuse their respective `mascot.svg`.

Raster export derivatives: render `social-card.svg` at 1200 × 630 into `assets/island-characters-social.png`. Commit the SVG source and refreshed derivatives together.

The tokendance.life homepage no longer shows the island scene; it uses the `favicon.svg` monogram and `assets/og-tokendance.png`. These characters remain the source for the product mascots.
