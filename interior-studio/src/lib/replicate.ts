import Replicate from "replicate";

let _replicate: Replicate | undefined;
const replicate: Replicate = new Proxy({} as Replicate, {
  get(_target, prop) {
    _replicate ??= new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
    const value = Reflect.get(_replicate, prop);
    return typeof value === "function" ? value.bind(_replicate) : value;
  },
});

export async function generateRoomRender({
  prompt,
  roomPhotoUrl,
}: {
  prompt: string;
  roomPhotoUrl: string;
}): Promise<string> {
  // adirik/interior-design uses ControlNet to preserve the room's exact
  // layout, dimensions, and architectural structure while applying design changes.
  const output = await replicate.run("adirik/interior-design:76604baddc85b1b4616e1c6475eca080da339c8875bd4996705440484a6eac38", {
    input: {
      image: roomPhotoUrl,
      prompt,
      a_prompt: "best quality, extremely detailed, photorealistic, interior design magazine, architectural digest, natural lighting",
      n_prompt: "longbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, blurry, different room, different layout, different architecture, moved walls, new windows, new doors, restructured, demolished",
      num_samples: 1,
      image_resolution: 768,
      detect_resolution: 768,
      ddim_steps: 20,
      scale: 9.0,
      seed: Math.floor(Math.random() * 1000000),
    },
  });

  const raw = Array.isArray(output) ? output[0] : output;

  if (raw && typeof (raw as { url?: () => string }).url === "function") {
    return (raw as { url: () => string }).url();
  }

  if (typeof raw === "string") return raw;

  throw new Error(`Unexpected Replicate output: ${JSON.stringify(raw)}`);
}

export async function editRoomWithFluxFill({
  imageBlob,
  maskBlob,
  prompt,
}: {
  imageBlob: Blob;
  maskBlob: Blob;
  prompt: string;
}): Promise<string> {
  // Convert blobs to base64 data URIs so Replicate receives the raw bytes
  // directly — the Files API URLs require Bearer auth which the prediction
  // worker cannot supply.
  const [imageBuffer, maskBuffer] = await Promise.all([
    imageBlob.arrayBuffer().then((b) => Buffer.from(b)),
    maskBlob.arrayBuffer().then((b) => Buffer.from(b)),
  ]);

  const imageDataUri = `data:${imageBlob.type};base64,${imageBuffer.toString("base64")}`;
  const maskDataUri  = `data:${maskBlob.type};base64,${maskBuffer.toString("base64")}`;

  console.error(`[replicate] image data URI ${imageBlob.type} ${imageBuffer.length}B → ${imageDataUri.length} chars`);
  console.error(`[replicate] mask  data URI ${maskBlob.type}  ${maskBuffer.length}B → ${maskDataUri.length} chars`);

  const output = await replicate.run("black-forest-labs/flux-fill-pro", {
    input: {
      image: imageDataUri,
      mask:  maskDataUri,
      prompt,
      steps: 50,
      guidance: 60,
      output_format: "jpg",
      safety_tolerance: 6,
    },
  });

  if (typeof output === "string") return output;

  const raw = Array.isArray(output) ? output[0] : output;

  if (raw && typeof (raw as { url?: () => string }).url === "function") {
    return (raw as { url: () => string }).url();
  }

  if (typeof raw === "string") return raw;

  throw new Error(`Unexpected Flux Fill output: ${JSON.stringify(raw)}`);
}
