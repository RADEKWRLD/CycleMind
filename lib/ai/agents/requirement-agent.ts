import { ai, AI_MODEL } from "@/lib/ai";
import { REQUIREMENT_AGENT_PROMPT } from "@/lib/ai/prompts";

export async function runRequirementAgent(prompt: string, context?: string): Promise<string> {
  const messages: { role: "system" | "user"; content: string }[] = [
    { role: "system", content: REQUIREMENT_AGENT_PROMPT },
  ];

  if (context) {
    messages.push({ role: "user", content: `已有上下文:\n${context}\n\n新需求:\n${prompt}` });
  } else {
    messages.push({ role: "user", content: prompt });
  }

  const response = await ai.chat.completions.create({
    model: AI_MODEL,
    messages,
    temperature: 0.3,
    max_tokens: 3000,
  });

  return response.choices[0]?.message?.content?.trim() || "";
}
