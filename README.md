# Benz Chitchai · Option B / smart Module 3B

Interactive schematic interior review, model v06 / retained review UI, 13 September 2026.

Published viewer: [Open 3D review](https://montri-th.github.io/mbsmart/).

## Review controls

- Drag to orbit, wheel or two-finger pinch to zoom, right-drag to pan.
- Six preset views include the entrance, smart, handover, service approach, cutaway overview and top view.
- Flex has three uses: default Vehicle Handover with MB6; Consulting with three desk seats and two waiting seats; Customer Waiting Annex with eight seats beside the existing ten-seat lounge. MB6 is removed off-model for the two furniture modes.
- Toggle Flex AC independently in each use. AC on closes the gallery gate; Waiting opens the link to the existing lounge. AC off closes that link before opening the vehicle gate. A dedicated sealed ceiling and a self-closing existing-lounge door are schematic proposals/assumptions requiring coordination.
- Toggle people, ceiling/mezzanine or review labels/control grid. Hiding the ceiling is a viewing cutaway, not a demolition proposal.
- The old model is frozen under `versions/v04/`; its original stills remain clearly identified as v04. Existing v04 comment permalinks redirect to that archive.

## Design basis and limits

This revision uses Option B / one full Module 3B. S1 turns 180 degrees; its two customer chairs face inward from the facade and its single advisor chair faces them from inside. MB5 moves to F–G / Lx3–4, nose toward the entrance, offset west within the bay to preserve an eastern approach. MB6 is added only in handover, nose toward smart. Five MB display vehicles and one smart remain in all uses. No ST is placed on service access. The existing counter and air-conditioned lounge remain; the main hall stays unconditioned.

The owner reports that standalone 3B is accepted and standalone 3A is not. This is not represented as approval of the complete site layout. Written scope and conditions covering the single smart vehicle, Grand Stage and other applicable requirements remain to be confirmed.

Plan units are metres. The owner confirmed E–F 8.00 m, F–G 5.50 m and G–H 2.50 m. Five 8.00 m X bays, all heights, column finishes and furniture sizes remain schematic assumptions to be surveyed. +0.80 is a level annotation, not a horizontal dimension; its datum remains unconfirmed.

**Clearance HOLD:** the 5.20 m proxy MB5 leaves only 0.15 m at each end in its 5.50 m entrance bay, with a 0.25 m lateral gap to the service reserve. The assumed entrance retains a 2.55 m eastern segment, not a verified accessible route. MB6 has nominal body-to-bay margins of 1.40 m longitudinally and 1.70 m laterally. These are geometric placements, not approved operating clearances. Full cross-showroom circulation, swept paths, open doors/tailgates, escape routes, column projections, HVAC/fresh air and furniture/vehicle changeover storage remain to be coordinated. Engines must remain off in the enclosure.

Selected manual-derived elements include D01 PDF p20 full 3B; D02 pp143–144 black/truffle shell chairs with silver bases, pp153/155 a TA03-inspired consulting top/sideboard with schematic support, p159 paired coffee tables, p76 black-glass reception backing, p216 oak consulting zones and pp257–259 zonal fixtures; D03 pp35/45 loose rug and paired planters. Dimensions and silhouettes are review proxies, not manufacturer engineering. The flex room retains one permanent stone floor across uses.

Materials are procedural approximations informed by supplied photos: polished grey stone, dark stone bands, glass, timber, upholstery and metal. People are articulated schematic figures about 1.65–1.78 m tall, seated or standing for scale and use. Cars/furniture are generic meshes. This is not an as-built model, approved brand artwork, photorealistic final visualization, fabrication package or construction document; no lighting-performance or brand-compliance certification is claimed.

## Client review UI

Choose an area, write a comment, and optionally place a point or two-corner rectangle on the control plan. The plan can enlarge around a selected point and pan; keyboard arrows and Enter also select coordinates. “ดูจุดใน 3D” shows the annotation in the existing model. The overlay is a review marker, not a physical design object.

The existing private log and endpoint are retained. Backend version 4 supports v04 and v06, with 45 passing backend tests. An actual browser form submission from the local v06 preview was read back from the native log with its Consulting mode, v06 revision and AC-on context. A legacy v04 retry returned its original receipt. These checks do not constitute acceptance on the user's physical iPhone.

Submissions include a free-text comment, optional name/team, area and geometric context, model revision, viewing mode and (v06) AC state. The backend must return a readable matching receipt before the UI reports success. Failed requests retain their draft and retry identifier; a newer draft edited during a pending request is not cleared. A device-local random ID is used for rate limiting, not identity verification. Comment text is not saved to browser storage. The public site never lists private comments or embeds a spreadsheet credential.

Permalinks contain only area, position, view, mode, model revision and AC state. Private text and names are not included. Comments enter a review queue; they do not automatically change the model. The owner and design team decide which requests to accept.

## Interface reference

Mercedes-Benz has an official [Brand Design portal](https://brand-design.mercedes-benz.com/), but its rules require sign-in. This UI draws only on observable public patterns from [Mercedes-Benz Thailand](https://www.mercedes-benz.co.th/th/): black masthead, white/gray work surfaces and blue primary controls. It is not a certified implementation of the proprietary global design system. Proprietary MB Corpo fonts and brand artwork are not redistributed; system font substitutes are intentional. UI colors do not alter the model's simulated materials.

## Run and publish

Serve the repository root with a local static HTTP server. No package installation is required. With Node.js 22 or later:

```sh
npm run build
```

The build validates the design-state counts and creates an allowlisted static `dist/` directory. GitHub Actions publishes it to GitHub Pages on pushes to `main`. Model assets are local/relative, with no external CDN or analytics. The model requires browser WebGL. Comment persistence additionally requires the separately deployed private-project backend; the viewer remains usable without it.

`layout.js` is the publishable derived layout. `scene.js` constructs the review model and interactions. `scripts/revise-layout-v06.cjs` reproducibly derives v06 from the frozen v04 coordinates. `scripts/prepare-layout.cjs` optionally converts compatible local geometry JSON. Original private inputs are deliberately excluded.

## Publication boundary

This public repository contains only the derived viewer, derived model data, generated review stills and supporting code. Original PDF manuals, survey/design photographs, downloaded reference files and internal project decision logs are not included. `noindex` requests search-engine exclusion but does not make a public repository or website private.

## Third-party software

[Three.js](https://threejs.org/) 0.160.1 and its Reflector example are vendored under the MIT license; see `vendor/THREE-LICENSE.txt`. Reflector's module import/export was adapted to the local classic-script runtime. See the [r160 release](https://github.com/mrdoob/three.js/releases/tag/r160). No third-party vehicle mesh or photographic texture is bundled. Brand names remain the property of their respective owners.
