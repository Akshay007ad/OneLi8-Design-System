# Motion study 01 — Gem under locomotion

## Adding a photographic plate

The stage runs on a real photo when one is present, and falls back to a
synthetic canvas street when it is not.

1. Drop a photo at `labs/gem-in-motion/plate.jpg`
2. `node packages/sync/src/build-lab.mjs labs/gem-in-motion`

### What the photo needs to be

A **still shot down the length** of a road or footpath — the camera looking
where you would be walking, so the surface converges to a vanishing point
somewhere near the middle of the frame. POV motion is produced by zooming
about that point, so a photo shot across a road, or one with no depth, will
slide rather than travel.

- Landscape, roughly 16:9. 2000–2600px wide is plenty.
- Keep it under about 2 MB. The published page embeds the image as a data
  URI and the publish cap is 16 MB; the build fails loudly if you exceed it.
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
