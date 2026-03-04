import { ai, AI_MODEL } from "@/lib/ai";
import { ER_AGENT_PROMPT } from "@/lib/ai/prompts";

export async function runERAgent(prompt: string, existingCode?: string): Promise<string> {
  let userContent = prompt;
  if (existingCode) {
    userContent = `已有 ER 图（需演化）:\n${existingCode}\n\n新需求:\n${prompt}`;
  }

  const response = await ai.chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: "system", content: ER_AGENT_PROMPT },
      { role: "user", content: userContent },
    ],
    temperature: 0.3,
    max_tokens: 3000,
  });

  const content = response.choices[0]?.message?.content?.trim() || "";
  return content.replace(/^```mermaid\n?/i, "").replace(/\n?```$/i, "").trim();
}
