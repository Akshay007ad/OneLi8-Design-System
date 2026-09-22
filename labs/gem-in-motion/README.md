# Motion study 01 — Reading at speed

Glass interfaces are designed standing still and then worn by a body that
moves. This study puts the Gem material on a moving street and asks what the
surface is allowed to give up as the reader speeds up.

It runs two scenarios from one switch, because speed alone does not answer the
question — *why* you are looking does.

| | face at speed | blur at a sprint | the assumption |
| --- | --- | --- | --- |
| **Ambient** | `stabilized → environmental` | 9.0px | the street matters more than the UI |
| **Sports** | `stabilized → legibility` | 0.9px | the number is the reason the display is on |

`FACE_SWITCH` is 0.34 of top speed in **both** modes, deliberately. At an
identical speed the ambient face steps *down* in presence and the sports face
steps *up*, so the pair is compared by flipping one switch without touching the
slider. The blur ramps are anchored to the four beats rather than fitted to a
curve — see `BLUR_RAMPS` in `index.html`, and [gem-material.md](../../docs/gem-material.md)
for the face ladder and the measured contrast behind it.

The four ramp values are lab-local. If sports mode becomes product behaviour
rather than a study, they want to be tokens.

## Adding a photographic plate

The stage runs on a real photo when one is present, and falls back to a
synthetic canvas street when it is not.

1. Drop a photo at `labs/gem-in-motion/plate.webp` (or `.jpg` — WebP is
   just tried first)
2. `node packages/sync/src/build-lab.mjs labs/gem-in-motion`

### What the photo needs to be

A **still shot down the length** of a road or footpath — the camera looking
where you would be walking, so the surface converges to a vanishing point
somewhere near the middle of the frame. POV motion is produced by zooming
about that point, so a photo shot across a road, or one with no depth, will
slide rather than travel.

- Landscape, roughly 16:9. 2400px wide is plenty — the plate is zoomed into,
  so resolution buys you sharpness at the far end of the cycle.
- **WebP at q80.** A 2400px street photo lands around 250–400 KB, against
  1.5–2 MB as JPEG. That matters because the published page embeds the image
  as a base64 data URI, which costs about a third more again, and the publish
  cap is 16 MB. The build prints the page size and fails loudly if it goes
  over.

  ```
  cwebp -q 80 -resize 2400 0 road.jpg -o plate.webp
  ```
- Shoot or pick it at the eye height of someone wearing the glasses.

### Pointing the zoom at the right place

The default assumes the road converges at the centre, slightly above the
midline. If yours converges elsewhere, set it in `index.html`:

```css
.plate { --vp-x: 50%; --vp-y: 52%; }
```

Those are the transform origin. Put them on the vanishing point of your
photo and the motion will read as travel rather than scaling.

### How the motion works

Two copies of the plate ride an exponential zoom about the vanishing point,
half a cycle apart, so one is always arriving as the other leaves and the
loop has no visible seam. Exponential rather than linear because depth is
what should be even, not pixels. Speed drives the cycle rate, the head bob
amplitude and the sway; at rest the plate creeps rather than freezing.
