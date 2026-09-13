# Benz Chitchai · Option B / smart Module 3B

Interactive schematic interior review, revision v04, 13 September 2026.

Published viewer: [Open 3D review](https://montri-th.github.io/mbsmart/).

## Review controls

- Drag to orbit, wheel or two-finger pinch to zoom, right-drag to pan.
- Six preset views include the entrance, smart, handover, service approach, cutaway overview and top view.
- Vehicle Handover is the default. Optional mode shows an enclosed air-conditioned service lounge extension connected to the existing room; it moves MB5 back to display and adds eight seats.
- Toggle the ceiling/mezzanine or the review labels/control grid. Hiding the ceiling is a viewing cutaway, not a demolition proposal.
- Nine stills under `renders/` are actual captures of this model, not AI-rendered photographic imagery.

## Design basis and limits

This revision preserves the original Option B / full Module 3B layout, five MB vehicles and one smart. MB5 alone is perpendicular with its nose toward the front/entrance. The earlier ST storage assumption is removed from the service access; alternative furniture storage remains off-model/TBD. The existing counter and air-conditioned lounge remain; the main hall is not proposed to be air-conditioned.

The owner reports that standalone 3B is accepted and standalone 3A is not. This is not represented as approval of the complete site layout. Written scope and conditions covering the single smart vehicle, Grand Stage and other applicable requirements remain to be confirmed.

Plan units are metres. The owner confirmed E–F 8.00 m, F–G 5.50 m and G–H 2.50 m. Five 8.00 m X bays, all heights, column finishes and furniture sizes remain schematic assumptions to be surveyed. +0.80 is a level annotation, not a horizontal dimension; its datum remains unconfirmed.

**Clearance HOLD:** the 5.20 m proxy MB5 leaves only 0.15 m at each end in the 5.50 m handover bay. In optional mode its rear is 0.05 m from the service reserve. These are geometric placements, not approved operational clearances. Vehicle manoeuvring, open doors/tailgate, accessible circulation, escape routes, existing column projections, HVAC/ventilation and movable glazing/storage need professional coordination before construction or reliable detailed quantities.

Materials are procedural approximations informed by supplied photos: polished grey stone, dark stone bands, glass, timber, upholstery and metal. Cars/furniture are generic proxy meshes, not manufacturer models. Signs are review placeholders. This is not an as-built model, approved brand artwork, photorealistic final visualization, fabrication package or construction document.

## Run and publish

Serve the repository root with a local static HTTP server. No package installation is required. With Node.js 22 or later:

```sh
npm run build
```

The build validates the design-state counts and creates an allowlisted static `dist/` directory. GitHub Actions publishes it to GitHub Pages on pushes to `main`. All runtime assets are local/relative: no external CDN, analytics, login, API key or backend is required. The model requires browser WebGL; fallback stills remain available.

`layout.js` is the publishable derived layout. `scene.js` constructs the review model and interactions. `scripts/prepare-layout.cjs` is an optional converter for a compatible local geometry JSON; the original private inputs are deliberately not included.

## Publication boundary

This public repository contains only the derived viewer, derived model data, generated review stills and supporting code. Original PDF manuals, survey/design photographs, downloaded reference files and internal project decision logs are not included. `noindex` requests search-engine exclusion but does not make a public repository or website private.

## Third-party software

[Three.js](https://threejs.org/) 0.160.1 and its Reflector example are vendored under the MIT license; see `vendor/THREE-LICENSE.txt`. Reflector's module import/export was adapted to the local classic-script runtime. See the [r160 release](https://github.com/mrdoob/three.js/releases/tag/r160). No third-party vehicle mesh or photographic texture is bundled. Brand names remain the property of their respective owners.
