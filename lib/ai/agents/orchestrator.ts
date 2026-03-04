import { ai, AI_MODEL } from "@/lib/ai";
import { ORCHESTRATOR_PROMPT } from "@/lib/ai/prompts";

export type AgentType = "requirement" | "design" | "er" | "api" | "plan";

export async function orchestrate(prompt: string): Promise<AgentType[]> {
  try {
    const response = await ai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: ORCHESTRATOR_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 200,
    });

    const content = response.choices[0]?.message?.content?.trim() || "[]";
    // Extract JSON array from response
    const match = content.match(/\[.*\]/s);
    if (match) {
      const agents = JSON.parse(match[0]) as string[];
      return agents.filter((a): a is AgentType =>
        ["requirement", "design", "er", "api", "plan"].includes(a)
      );
    }
    // Default: generate all
    return ["requirement", "design", "api", "plan"];
  } catch {
    return ["requirement", "design", "api", "plan"];
  }
}
