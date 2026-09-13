---
name: Benz Chitchai showroom review
description: Retained review interface with v07 smart-focused source guide and revision-aware submission gate.
colors:
  accent: "#0078d6"
  accent-hover: "#0068ba"
  background: "#f4f4f4"
  surface: "#fff"
  header: "#000"
  text: "#191919"
  muted: "#575757"
  line: "#b6b6b6"
  hover-surface: "#eaeaea"
  selected-hover: "#333"
  disabled-surface: "#e3e3e3"
  disabled-text: "#555"
  disabled-line: "#c4c4c4"
  placeholder: "#626262"
  warning: "#79420b"
  error: "#9b2417"
  success: "#17612f"
typography:
  display:
    fontFamily: 'Georgia, "Times New Roman", serif'
    fontSize: "2.4rem"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-.02em"
  title:
    fontFamily: 'Arial, Thonburi, "Noto Sans Thai", sans-serif'
    fontSize: "1.3rem"
    fontWeight: 500
    lineHeight: 1.4
  body:
    fontFamily: 'Arial, Thonburi, "Noto Sans Thai", sans-serif'
    fontSize: "16px"
    lineHeight: 1.55
  control:
    fontFamily: 'Arial, Thonburi, "Noto Sans Thai", sans-serif'
    fontSize: ".875rem"
    lineHeight: 1.5
  label:
    fontSize: ".875rem"
    fontWeight: 600
  small:
    fontSize: ".75rem"
    lineHeight: 1.55
rounded:
  field: "2px"
  pill: "9999px"
spacing:
  small: "8px"
  control-block: "10px"
  control-inline: "14px"
  compact-panel-inline: "18px"
  panel: "24px"
  workspace-gap: "28px"
  wide-panel: "30px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    typography: "{typography.control}"
    rounded: "{rounded.pill}"
    padding: "10px 14px"
    width: "100%"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.control}"
    rounded: "{rounded.pill}"
    padding: "10px 14px"
  button-selected:
    backgroundColor: "{colors.text}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
  button-disabled:
    backgroundColor: "{colors.disabled-surface}"
    textColor: "{colors.disabled-text}"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.control}"
    rounded: "{rounded.field}"
    padding: "10px 14px"
    width: "100%"
  review-panel:
    backgroundColor: "{colors.surface}"
    padding: "{spacing.panel}"
---

# Design System: Benz Chitchai showroom review

## v07 delta

Added a compact smart specification strip, five native details groups covering35 requirements, non-sending comment-prefill buttons and source-labelled geometry. Submit is gated on live backend support for the current revision. Old views remain archived. The interface is a local interpretation of public Mercedes web patterns, not certification of its gated proprietary Design System. No official marketing photos are publicly embedded.

## Overview

This is a scoped extraction of the implemented v05 client review interface, retained around the v06 model with three Flex uses, independent AC and people toggles. Its visual language uses a black header, white and pale-gray surfaces, dark text, serif project heading, sans-serif controls, and blue action and location accents. No creative metaphor or additional user-confirmed aesthetic preferences are assigned.

The requested Mercedes-Benz alignment is limited to public-web reference: [Mercedes-Benz Thailand](https://www.mercedes-benz.co.th/th/). The [Mercedes-Benz Brand Design System portal](https://brand-design.mercedes-benz.com/) is gated; this document does not establish access to its private specifications, official brand compliance, or brand approval. Georgia and the system sans-serif stack are intentional substitutes; no proprietary fonts or Mercedes-Benz logo are included.

Extraction source: [viewer.css](./viewer.css), [index.html](./index.html), and [feedback.js](./feedback.js), inspected 13 September 2026. This is the implementation-derived project UI reference; it does not supersede the brand’s private guidelines. No PRODUCT.md was available. The companion sidecar records observed patterns only; no tonal scales have been synthesized.

**Key Characteristics:**

- Black header and flat, light work surfaces.
- Serif project heading with Thai-capable sans-serif controls.
- Pill buttons, near-square fields, and visible keyboard focus.
- Blue action and annotation accents, with text explaining status.

## Colors

The frontmatter preserves the implemented CSS color values; these are local interface tokens, not a certified Mercedes-Benz palette.

### Primary

Accent blue identifies the primary action, focus outline, text caret, selected map point, and marked rectangle. The darker accent supplies primary-button hover and links.

### Neutral

Header black frames the project title. Background gray separates the white review panel from the page. Text and muted text support the hierarchy; line gray defines fields and dividers. Selected controls use the text color as their fill. Hover and disabled surfaces remain neutral.

Warning, error, and success tokens are semantic interface feedback colors. They accompany readable messages and do not certify model suitability or successful storage on their own. Model materials and plan-zone fills are schematic content, outside this interface palette.

## Typography

The display role is the project heading; its serif stack is an intentional substitute. Body and form roles use the declared Arial / Thonburi / Noto Sans Thai fallback stack, with no downloaded proprietary typeface. Availability depends on the device.

The frontmatter captures desktop roles, not a mathematical type scale. At widths up to 820px, the project heading becomes 2.1rem and the review-panel title becomes 1.4rem. Supporting text and the character counter use the small role. Counters use tabular numerals. Notes use a 1.7 line height and a maximum measure of 72ch.

## Layout

This surface uses a model pane on the left and a review panel on the right. The main container is centered at a maximum width of 1920px with 30px side padding. The default review column is 390px with a 28px gap; at 1600px and above it becomes 420px, with 30px panel padding. At 1080px and below, the review column is 350px, the gap is 18px, and page and panel padding reduce to 20px.

At 820px and below, panes stack, the header stacks, the mode selector spans the width, and the centered review panel is capped at 680px. At 480px and below, page side padding becomes 14px and panel padding becomes 22px vertically / 18px horizontally. Controls wrap rather than force horizontal scrolling. Notes switch from three columns to one at 820px.

The stage normally uses `clamp(430px, 56vw, 710px)`. Its breakpoint overrides are 740px at 1600px and above, 570px at 1080px and below, 480px at 820px and below, and 390px at 480px and below. These are the implemented surface choices, not universal brand layout rules.

## Elevation & Depth

No interface box-shadow vocabulary is defined. Flat white and gray surfaces, borders, and black header contrast establish separation. The stage caption uses a transparent-to-black gradient for text over the model; model labels use a translucent dark fill. Three-dimensional renderer lighting and material effects are outside this interface extraction.

## Shapes

Buttons use fully rounded pill corners; fields use the small field radius. The review panel and stage remain rectangular without added rounding. Default controls have a minimum height of 44px and primary submission has a minimum height of 48px. Some secondary map controls are smaller: location-readout buttons are at least 36px high and zoom controls at least 40px.

Keyboard focus uses a 3px blue outline with a 3px offset on controls, links, disclosure summaries, and the plan. The mode selector in the black header uses a white focus outline.

## Components

### Buttons and view navigation

Primary submission fills the panel width. Secondary buttons use white fill and a gray border; their hover state uses a pale gray fill and dark border. Selected view and location-tool buttons use a dark fill and white text, with a lighter dark hover. Selection is expressed through `aria-pressed`. Disabled buttons use the final disabled-text token, overriding the earlier declaration in the stylesheet.

When reduced motion is not requested, button background and border transitions last 0.15s with ease-out. There is no extracted active-press transform or shadow.

### Review panel and fields

The white panel groups the area selector, optional point/rectangle disclosure, required free-text comment, optional author disclosure, model context, privacy note, submit action, and receipt/status message. Fields are full width. Textareas resize vertically and have a minimum height of 118px; placeholder text uses its dedicated neutral token.

The comment limit is 3,000 characters, name limit 80, and team limit 100. The required field uses native browser validity feedback. An unfinished rectangle produces a textual error before submission. These behaviors are implemented in the interface; they are not evidence of a live backend.

### Location plan

The plan accepts an area-only selection, a point, or a rectangle defined by two corners. Blue marks the pin, boundary, and keyboard cursor; the rectangle fill has 0.18 opacity. Coordinate captions remain visible as text. Zoom switches to 2.5× around the selected point or cursor and supports panning; reset returns the full plan.

Arrow keys move the cursor by 0.5m, Shift plus an arrow by 0.1m, Enter/Space selects, and Escape cancels an unfinished corner. Coordinates refer to the schematic model. Selecting a location adds review context and does not change the design geometry. Sidecar plan artwork is a static extracted state specimen, not a replacement for the operational map.

### Submission status

The status region is announced politely. Success is shown only after a matching receipt identifier and valid receipt timestamp; an unconfirmed response keeps the draft available. A success reveal lasts 0.45s with ease-out only when reduced motion is not requested.

At the original extraction, the endpoint was empty and submission was disabled. On 13 September 2026, authorization and actual HTTP-to-Sheets write/readback plus duplicate-retry checks passed; the endpoint was configured for owner acceptance testing. A live browser/iPhone form submission is still pending because the local Mac was locked. The disabled component specimen below remains an intentional state example, not the current deployment status. No completed browser test is claimed.

## Do's and Don'ts

### Do:

- Do preserve the implemented black header, light surfaces, and blue action and annotation accent.
- Do retain the substitute font stacks and visible keyboard-focus treatment.
- Do keep location coordinates, model revision, and readable submission status with the review interaction.
- Do describe the interface as a public-web-inspired project review tool with an unverified backend until connection and write tests pass.

### Don't:

- Don't label these extracted tokens as official Mercedes-Benz BDS specifications or brand approval.
- Don't add proprietary fonts or a Mercedes-Benz logo to this extraction.
- Don't treat an annotation or comment as an automatic model change; retain its exact model revision, use and AC context.
- Don't represent a disabled submission or an unconfirmed response as a saved Google Sheets comment.
