import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function analyzeRoomAndGeneratePrompt({
  roomPhotoUrl,
  wallColor,
  wallColorName,
  curtainStyle,
  furnitureStyle,
  designNotes,
  referenceImageUrls,
}: {
  roomPhotoUrl: string;
  wallColor?: string;
  wallColorName?: string;
  curtainStyle?: string;
  furnitureStyle?: string;
  designNotes?: string;
  referenceImageUrls?: string[];
}): Promise<string> {
  const imageContent: Anthropic.ImageBlockParam[] = [
    { type: "image", source: { type: "url", url: roomPhotoUrl } },
    ...(referenceImageUrls?.map((url) => ({
      type: "image" as const,
      source: { type: "url" as const, url },
    })) ?? []),
  ];

  const designRequest = [
    wallColorName && `Wall color: ${wallColorName}${wallColor ? ` (${wallColor})` : ""}`,
    curtainStyle && `Curtains/drapes: ${curtainStyle}`,
    furnitureStyle && `Furniture style: ${furnitureStyle}`,
    designNotes && `Additional notes: ${designNotes}`,
  ]
    .filter(Boolean)
    .join("\n");

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          ...imageContent,
          {
            type: "text",
            text: `You are an expert interior design prompt engineer for photorealistic AI image generation.

Analyze this room photo (and any reference images provided) and create a detailed, photorealistic image generation prompt for FLUX.1.

The designer wants to make these changes:
${designRequest}

Write a single detailed prompt (200-300 words) that:
1. CRITICAL: You must NOT change anything structural — walls, ceiling, floor plan, windows, doors, room dimensions, columns, beams, or any architectural element. Only change surface finishes and furnishings.
2. Applies the requested design changes precisely to surfaces and furnishings only
3. Specifies lighting conditions (natural + artificial), time of day
4. Describes materials, textures, and finishes in detail
5. Maintains a photorealistic interior photography style
6. References the style of high-end interior design magazines like Architectural Digest

The output image must look like the SAME room with different styling — not a newly designed room.

Output ONLY the prompt text, nothing else.`,
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude did not return a text response");
  }

  return textBlock.text;
}
