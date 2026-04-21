import Anthropic from "@anthropic-ai/sdk";

let _anthropic: Anthropic | undefined;
const anthropic: Anthropic = new Proxy({} as Anthropic, {
  get(_target, prop) {
    _anthropic ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const value = Reflect.get(_anthropic, prop);
    return typeof value === "function" ? value.bind(_anthropic) : value;
  },
});

const STYLE_PROMPTS: Record<string, string> = {
  Photorealistic: "photorealistic interior photography, 8K DSLR quality, natural and artificial lighting, architectural digest magazine style",
  Sketch: "hand-drawn architectural sketch, pencil and ink, fine line work, professional interior design drawing",
  Watercolour: "loose watercolour illustration, soft washes, artistic interior rendering, painterly style",
  "3D Render": "3D architectural visualization, ray-traced render, crisp materials, studio lighting, CGI quality",
};

export async function analyzeRoomWithClaude(photoUrl: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 600,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "url", url: photoUrl },
          },
          {
            type: "text",
            text: `You are an expert interior architect. Analyze this room photo and describe:
1. Room dimensions feel (small/medium/large, ceiling height)
2. Existing flooring type, color, and condition
3. Wall finish, color, and any architectural features (moldings, niches, exposed brick, etc.)
4. Windows: quantity, size, orientation (natural light direction)
5. Doors: quantity and position
6. Current furniture and layout
7. Lighting fixtures (natural + artificial)
8. Any fixed architectural elements (columns, beams, built-ins, fireplaces, etc.)

Be specific and precise. Output as a structured paragraph describing the room as it currently stands.`,
          },
        ],
      },
    ],
  });

  const block = response.content[0];
  return block.type === "text" ? block.text : "";
}

/**
 * Builds an optimized image-generation prompt for Replicate's ControlNet model.
 * The prompt describes ONLY design changes (colors, materials, furnishings) —
 * ControlNet handles structural preservation via depth mapping, so walls/windows/
 * doors must not appear in the prompt.
 */
export async function buildDesignPrompt({
  roomAnalysis,
  designNotes,
  style,
}: {
  roomAnalysis: string;
  designNotes: string;
  style: string;
}): Promise<string> {
  const styleGuide = STYLE_PROMPTS[style] ?? STYLE_PROMPTS.Photorealistic;

  const response = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 300,
    system: `You are an expert at writing prompts for AI interior design ControlNet models. Write a concise prompt (max 150 words) describing the DESIRED interior result.

Rules:
- Do NOT mention walls, floor plan, windows, doors, room shape, or dimensions — ControlNet locks these automatically via depth mapping.
- If the designer's notes say "ADD ITEMS ONLY", your prompt must ONLY describe the new items being introduced. Explicitly state that all existing surfaces, wall colors, flooring, ceiling finishes, and existing furniture are COMPLETELY UNCHANGED and must stay exactly as they appear in the source photo.
- Otherwise, describe the full desired interior: color palette, surface finishes, furniture, textiles, lighting, and decorative objects.
- Use specific material language (e.g. "white oak herringbone parquet", "brushed brass pendant", "bouclé sofa in ivory").
- Render style: ${styleGuide}.
- Output the prompt only — no preamble, no explanations.`,
    messages: [
      {
        role: "user",
        content: `Current room description:\n${roomAnalysis}\n\nDesign changes requested by the designer:\n${designNotes}\n\nWrite the image generation prompt:`,
      },
    ],
  });

  const block = response.content[0];
  return block.type === "text" ? block.text.trim() : designNotes;
}
