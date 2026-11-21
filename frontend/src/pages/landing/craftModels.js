/*
 * Procedural Indian-handicraft still life for the landing hero.
 *
 * Everything is generated in code (lathe profiles, canvas textures,
 * rounded boxes) so the page never depends on external 3D assets.
 * Only named imports from "three" are used so unused renderer
 * features can be tree-shaken.
 */
import {
  BoxGeometry,
  CanvasTexture,
  CylinderGeometry,
  DoubleSide,
  Group,
  InstancedMesh,
  LatheGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  RepeatWrapping,
  SphereGeometry,
  SplineCurve,
  SRGBColorSpace,
  TorusGeometry,
  Vector2,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

const PALETTE = {
  forest: "#20382e",
  sage: "#315344",
  cream: "#f2eddf",
  terracotta: "#b96749",
  terracottaDeep: "#965039",
  brass: "#b89559",
  charcoal: "#343a32",
};

/* Deterministic pseudo-random so the artwork is identical every load. */
function seededRandom(seed) {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCanvasTexture(width, height, draw, { srgb = true } = {}) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  draw(context, width, height);

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.anisotropy = 4;

  if (srgb) {
    texture.colorSpace = SRGBColorSpace;
  }

  return texture;
}

/* ------------------------------------------------------------------ */
/* Lathe helpers                                                       */
/* ------------------------------------------------------------------ */

/*
 * Smooth silhouette from control points [radius, height], resampled
 * by arc length so texture V is proportional to distance along the
 * profile.
 */
function buildProfile(controlPoints, samples, ripple = 0) {
  const curve = new SplineCurve(
    controlPoints.map(
      ([radius, height]) =>
        new Vector2(Math.max(radius, 0.0001), height)
    )
  );

  return curve.getSpacedPoints(samples).map((point, index) => {
    const rippleScale =
      ripple > 0 ? 1 + ripple * Math.sin(index * 1.9) : 1;

    return new Vector2(
      Math.max(point.x * rippleScale, 0.0001),
      point.y
    );
  });
}

/* V coordinate (0 = base, 1 = top) where the profile reaches a height. */
function vAtHeight(profile, height) {
  const index = profile.findIndex((point) => point.y >= height);

  return index < 0 ? 1 : index / (profile.length - 1);
}

/* ------------------------------------------------------------------ */
/* Textures                                                            */
/* ------------------------------------------------------------------ */

function drawLine(ctx, width, y, thickness, color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, y, width, thickness);
}

function drawZigzag(ctx, width, y1, y2, count, color, lineWidth) {
  const step = width / count;

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = "miter";
  ctx.beginPath();

  for (let i = 0; i <= count; i += 1) {
    const x = i * step;
    ctx.lineTo(x, i % 2 === 0 ? y1 : y2);
  }

  ctx.stroke();
}

function drawDiamonds(ctx, width, centerY, halfHeight, count, ink, inner, dot) {
  const step = width / count;
  const halfWidth = step * 0.42;

  for (let i = 0; i < count; i += 1) {
    const cx = (i + 0.5) * step;

    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.moveTo(cx, centerY - halfHeight);
    ctx.lineTo(cx + halfWidth, centerY);
    ctx.lineTo(cx, centerY + halfHeight);
    ctx.lineTo(cx - halfWidth, centerY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = inner;
    ctx.beginPath();
    ctx.moveTo(cx, centerY - halfHeight * 0.66);
    ctx.lineTo(cx + halfWidth * 0.62, centerY);
    ctx.lineTo(cx, centerY + halfHeight * 0.66);
    ctx.lineTo(cx - halfWidth * 0.62, centerY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = dot;
    ctx.beginPath();
    ctx.arc(cx, centerY, halfWidth * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

/*
 * Hand-painted pottery texture. `bands` positions are given as V
 * fractions (0 = base, 1 = top) measured on the lathe profile.
 */
function makePotteryTexture({ base, ink, accent, bands, seed }) {
  return makeCanvasTexture(1024, 512, (ctx, w, h) => {
    const random = seededRandom(seed);

    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);

    /* Fired-clay speckle. */
    for (let i = 0; i < 2600; i += 1) {
      ctx.fillStyle =
        random() > 0.5
          ? "rgba(52, 58, 50, 0.07)"
          : "rgba(242, 237, 223, 0.06)";
      ctx.beginPath();
      ctx.arc(random() * w, random() * h, random() * 2.2 + 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    /* Texture row 0 is the top of the pot, so flip V fractions. */
    const y = (v) => (1 - v) * h;

    bands.lines?.forEach(([v, thickness, color]) => {
      drawLine(ctx, w, y(v), thickness, color === "ink" ? ink : accent);
    });

    bands.zigzags?.forEach(([vLow, vHigh, count]) => {
      drawZigzag(ctx, w, y(vHigh), y(vLow), count, ink, 5);
    });

    bands.diamonds?.forEach(([vLow, vHigh, count]) => {
      drawDiamonds(
        ctx,
        w,
        y((vLow + vHigh) / 2),
        Math.abs(y(vLow) - y(vHigh)) / 2,
        count,
        ink,
        base,
        accent
      );
    });
  });
}

function drawGrain(ctx, w, h, seed, baseColor) {
  const random = seededRandom(seed);

  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 180; i += 1) {
    const y = random() * h;
    const amplitude = random() * 5 + 1;
    const wave = random() * 0.03 + 0.008;

    ctx.strokeStyle =
      random() > 0.5
        ? `rgba(52, 28, 14, ${random() * 0.22 + 0.05})`
        : `rgba(214, 164, 108, ${random() * 0.14 + 0.03})`;
    ctx.lineWidth = random() * 1.6 + 0.4;
    ctx.beginPath();

    for (let x = 0; x <= w; x += 8) {
      ctx.lineTo(x, y + Math.sin(x * wave + i) * amplitude);
    }

    ctx.stroke();
  }
}

function drawCarvedLattice(ctx, w, h, cell, stroke, fillRaised) {
  ctx.lineWidth = 5;
  ctx.strokeStyle = stroke;

  for (let cy = cell / 2; cy < h; cy += cell) {
    for (let cx = cell / 2; cx < w; cx += cell) {
      ctx.beginPath();
      ctx.arc(cx, cy, cell * 0.38, 0, Math.PI * 2);
      ctx.stroke();

      for (let petal = 0; petal < 8; petal += 1) {
        const angle = (petal / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(
          cx + Math.cos(angle) * cell * 0.38,
          cy + Math.sin(angle) * cell * 0.38
        );
        ctx.stroke();
      }

      ctx.fillStyle = fillRaised;
      ctx.beginPath();
      ctx.arc(cx, cy, cell * 0.07, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function makeWoodTextures() {
  const color = makeCanvasTexture(512, 512, (ctx, w, h) => {
    drawGrain(ctx, w, h, 11, "#7b4a2c");
    drawCarvedLattice(ctx, w, h, 128, "rgba(38, 20, 10, 0.55)", "rgba(38, 20, 10, 0.4)");
  });

  const bump = makeCanvasTexture(
    512,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = "#b4b4b4";
      ctx.fillRect(0, 0, w, h);
      drawCarvedLattice(ctx, w, h, 128, "#202020", "#202020");
    },
    { srgb: false }
  );

  return { color, bump };
}

const TEXTILE_STRIPES = [
  [PALETTE.forest, PALETTE.cream, PALETTE.terracotta, PALETTE.brass, PALETTE.cream],
  [PALETTE.terracotta, PALETTE.cream, PALETTE.sage, PALETTE.brass],
  [PALETTE.cream, PALETTE.forest, PALETTE.brass, PALETTE.terracotta],
  [PALETTE.sage, PALETTE.terracotta, PALETTE.cream, PALETTE.forest],
];

function makeTextileTexture(colors, seed) {
  return makeCanvasTexture(512, 256, (ctx, w, h) => {
    const random = seededRandom(seed);
    const stripeWidths = [64, 22, 38, 12, 46, 18];
    let x = 0;
    let index = 0;

    while (x < w) {
      const stripe = stripeWidths[index % stripeWidths.length];
      ctx.fillStyle = colors[index % colors.length];
      ctx.fillRect(x, 0, stripe, h);
      x += stripe;
      index += 1;
    }

    /* Woven thread texture. */
    for (let ty = 0; ty < h; ty += 3) {
      ctx.fillStyle = `rgba(0, 0, 0, ${0.05 + random() * 0.06})`;
      ctx.fillRect(0, ty, w, 1);
    }

    for (let tx = 0; tx < w; tx += 3) {
      ctx.fillStyle = `rgba(255, 255, 255, ${0.03 + random() * 0.05})`;
      ctx.fillRect(tx, 0, 1, h);
    }
  });
}

/* ------------------------------------------------------------------ */
/* Individual crafts                                                   */
/* ------------------------------------------------------------------ */

const VASE_PROFILE = [
  [0, 0], [0.5, 0], [0.62, 0.1], [0.95, 0.5], [1.18, 1.0], [1.12, 1.5],
  [0.78, 2.1], [0.52, 2.5], [0.46, 2.75], [0.55, 2.95], [0.78, 3.1], [0.74, 3.14],
];

const MATKA_PROFILE = [
  [0, 0], [0.5, 0], [0.7, 0.12], [1.0, 0.5], [1.1, 0.85],
  [0.95, 1.25], [0.55, 1.5], [0.5, 1.62], [0.62, 1.7], [0.6, 1.74],
];

const LOTA_PROFILE = [
  [0, 0], [0.42, 0], [0.5, 0.06], [0.46, 0.18], [0.7, 0.42], [0.82, 0.68],
  [0.7, 0.98], [0.44, 1.16], [0.4, 1.26], [0.55, 1.36], [0.58, 1.42],
];

const DIYA_PROFILE = [
  [0, 0], [0.25, 0], [0.4, 0.1], [0.52, 0.22], [0.5, 0.25],
  [0.42, 0.21], [0.3, 0.13], [0, 0.11],
];

function lathe(profile, segments) {
  return new LatheGeometry(profile, segments);
}

function createVase(quality) {
  const group = new Group();
  const samples = quality === "low" ? 44 : 96;
  const profile = buildProfile(VASE_PROFILE, samples, 0.006);
  const v = (fraction) => vAtHeight(profile, fraction * 3.14);

  const material = new MeshStandardMaterial({
    map: makePotteryTexture({
      base: PALETTE.terracotta,
      ink: PALETTE.terracottaDeep,
      accent: PALETTE.cream,
      seed: 3,
      bands: {
        lines: [
          [v(0.97), 5, "ink"],
          [v(0.92), 3, "accent"],
          [v(0.2), 4, "ink"],
          [v(0.16), 3, "accent"],
        ],
        zigzags: [[v(0.78), v(0.88), 28]],
        diamonds: [[v(0.3), v(0.6), 14]],
      },
    }),
    roughness: 0.82,
    metalness: 0,
    side: DoubleSide,
  });

  group.add(new Mesh(lathe(profile, quality === "low" ? 48 : 112), material));

  /* Brass collar around the neck. */
  const collar = new Mesh(
    new TorusGeometry(0.5, 0.04, 12, quality === "low" ? 32 : 72),
    createBrassMaterial()
  );
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 2.62;
  group.add(collar);

  return group;
}

function createMatka(quality) {
  const profile = buildProfile(MATKA_PROFILE, quality === "low" ? 36 : 80, 0.005);
  const v = (fraction) => vAtHeight(profile, fraction * 1.74);

  const material = new MeshStandardMaterial({
    map: makePotteryTexture({
      base: "#a85a3e",
      ink: "#6b3322",
      accent: PALETTE.cream,
      seed: 8,
      bands: {
        lines: [[v(0.92), 4, "ink"], [v(0.3), 4, "ink"]],
        zigzags: [[v(0.4), v(0.56), 24]],
      },
    }),
    roughness: 0.88,
    metalness: 0,
    side: DoubleSide,
  });

  return new Mesh(lathe(profile, quality === "low" ? 44 : 96), material);
}

function createBrassMaterial() {
  return new MeshStandardMaterial({
    color: PALETTE.brass,
    roughness: 0.3,
    metalness: 1,
    envMapIntensity: 1.25,
    side: DoubleSide,
  });
}

function createLota(quality) {
  const profile = buildProfile(LOTA_PROFILE, quality === "low" ? 32 : 70, 0.004);

  return new Mesh(
    lathe(profile, quality === "low" ? 40 : 88),
    createBrassMaterial()
  );
}

function createDiya(quality) {
  const group = new Group();
  const profile = buildProfile(DIYA_PROFILE, quality === "low" ? 24 : 44);

  group.add(
    new Mesh(lathe(profile, quality === "low" ? 36 : 72), createBrassMaterial())
  );

  const flame = new Mesh(
    new SphereGeometry(1, 16, 12),
    new MeshBasicMaterial({ color: "#ffb45e" })
  );
  flame.scale.set(0.05, 0.14, 0.05);
  flame.position.y = 0.26;
  flame.userData.noShadow = true;
  group.add(flame);

  return { group, flame };
}

function createWoodenBox() {
  const group = new Group();
  const { color, bump } = makeWoodTextures();

  const material = new MeshStandardMaterial({
    map: color,
    bumpMap: bump,
    bumpScale: 2.2,
    roughness: 0.62,
    metalness: 0,
  });

  const body = new Mesh(new RoundedBoxGeometry(1.5, 0.55, 1, 3, 0.05), material);
  body.position.y = 0.275;
  group.add(body);

  const lid = new Mesh(new RoundedBoxGeometry(1.56, 0.2, 1.06, 3, 0.06), material);
  lid.position.y = 0.65;
  group.add(lid);

  const brass = createBrassMaterial();

  const clasp = new Mesh(new BoxGeometry(0.16, 0.26, 0.04), brass);
  clasp.position.set(0, 0.57, 0.54);
  group.add(clasp);

  [-0.55, 0.55].forEach((x) => {
    const hinge = new Mesh(new BoxGeometry(0.2, 0.2, 0.03), brass);
    hinge.position.set(x, 0.57, -0.52);
    group.add(hinge);
  });

  return group;
}

function createTextileStack(quality) {
  const group = new Group();
  const fringeGeometry = new BoxGeometry(0.1, 0.012, 0.014);
  const fringeMaterial = new MeshStandardMaterial({
    color: PALETTE.cream,
    roughness: 1,
  });
  const dummy = new Object3D();
  const random = seededRandom(21);
  const fringeCount = quality === "low" ? 0 : 26;

  TEXTILE_STRIPES.forEach((colors, index) => {
    const width = 1.7 - index * 0.04;
    const depth = 1.15 - index * 0.03;
    const layer = new Group();

    const slab = new Mesh(
      new RoundedBoxGeometry(width, 0.12, depth, 2, 0.03),
      new MeshStandardMaterial({
        map: makeTextileTexture(colors, 40 + index),
        roughness: 0.96,
        metalness: 0,
      })
    );
    layer.add(slab);

    if (fringeCount > 0) {
      const fringe = new InstancedMesh(
        fringeGeometry,
        fringeMaterial,
        fringeCount * 2
      );

      [-1, 1].forEach((side, sideIndex) => {
        for (let i = 0; i < fringeCount; i += 1) {
          dummy.position.set(
            side * (width / 2 + 0.045),
            (random() - 0.5) * 0.04,
            -depth / 2 + 0.04 + (i / (fringeCount - 1)) * (depth - 0.08)
          );
          dummy.rotation.set(0, (random() - 0.5) * 0.35, (random() - 0.5) * 0.25);
          dummy.updateMatrix();
          fringe.setMatrixAt(sideIndex * fringeCount + i, dummy.matrix);
        }
      });

      fringe.instanceMatrix.needsUpdate = true;
      layer.add(fringe);
    }

    layer.position.y = 0.06 + index * 0.125;
    layer.rotation.y = (index - 1.5) * 0.08;
    group.add(layer);
  });

  return group;
}

function createPlinth(quality) {
  const group = new Group();

  const stone = new Mesh(
    new CylinderGeometry(3.15, 3.3, 0.4, quality === "low" ? 48 : 96),
    new MeshStandardMaterial({ color: "#e6dec9", roughness: 0.92 })
  );
  stone.position.y = -0.2;
  group.add(stone);

  const ring = new Mesh(
    new TorusGeometry(3.15, 0.03, 8, quality === "low" ? 64 : 128),
    createBrassMaterial()
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.005;
  group.add(ring);

  return group;
}

/* ------------------------------------------------------------------ */
/* Collection                                                          */
/* ------------------------------------------------------------------ */

export function createCraftCollection({ quality = "high" } = {}) {
  const root = new Group();

  root.add(createPlinth(quality));

  const vase = createVase(quality);
  vase.position.set(-0.55, 0, -0.35);
  root.add(vase);

  const matka = createMatka(quality);
  matka.position.set(1.35, 0, -0.75);
  root.add(matka);

  const lota = createLota(quality);
  lota.scale.setScalar(0.85);
  lota.position.set(-2.1, 0, 0.35);
  root.add(lota);

  const textiles = createTextileStack(quality);
  textiles.position.set(-0.85, 0, 1.55);
  textiles.rotation.y = 0.18;
  root.add(textiles);

  const box = createWoodenBox();
  box.position.set(2.0, 0, 0.75);
  box.rotation.y = -0.55;
  box.scale.setScalar(0.92);
  root.add(box);

  const diya = createDiya(quality);
  diya.group.position.set(0.7, 0, 1.2);
  root.add(diya.group);

  root.traverse((object) => {
    if (object.isMesh && !object.userData.noShadow) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });

  return {
    root,
    flame: diya.flame,
    /* Subtle flame flicker, driven by elapsed seconds. */
    update(seconds) {
      const flicker =
        1 +
        Math.sin(seconds * 9) * 0.06 +
        Math.sin(seconds * 17.3) * 0.04;

      diya.flame.scale.set(0.05, 0.14 * flicker, 0.05);
    },
  };
}

/* Dispose every geometry, material and texture under a root object. */
export function disposeObject(root) {
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();

  root.traverse((object) => {
    if (object.geometry) {
      geometries.add(object.geometry);
    }

    const list = Array.isArray(object.material)
      ? object.material
      : object.material
        ? [object.material]
        : [];

    list.forEach((material) => {
      materials.add(material);

      ["map", "bumpMap", "normalMap", "roughnessMap", "metalnessMap"].forEach(
        (key) => {
          if (material[key]) {
            textures.add(material[key]);
          }
        }
      );
    });

    if (object.isInstancedMesh) {
      object.dispose();
    }
  });

  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
  textures.forEach((texture) => texture.dispose());
}
