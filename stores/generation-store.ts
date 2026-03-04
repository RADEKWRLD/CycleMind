import { create } from "zustand";
import type { StreamStep, AgentToolPart } from "@/types";

type GenerationStatus = "running" | "completed" | "error";

export interface GenerationRun {
  sessionId: string;
  sessionTitle: string;
  status: GenerationStatus;
  streamSteps: StreamStep[];
  agentToolParts: Map<string, AgentToolPart>;
  completedDocs: string[];
  errorMessage?: string;
  abortController: AbortController | null;
}

interface GenerationStore {
  runs: Map<string, GenerationRun>;

  startGeneration: (params: {
    sessionId: string;
    sessionTitle: string;
    prompt: string;
    confirmedAgents: string[];
  }) => void;

  cancelGeneration: (sessionId: string) => void;
  clearGeneration: (sessionId: string) => void;
}

function updateRun(
  set: (fn: (s: { runs: Map<string, GenerationRun> }) => { runs: Map<string, GenerationRun> }) => void,
  sessionId: string,
  updater: (run: GenerationRun) => Partial<GenerationRun>,
) {
  set((state) => {
    const run = state.runs.get(sessionId);
    if (!run) return state;
    const next = new Map(state.runs);
    next.set(sessionId, { ...run, ...updater(run) });
    return { runs: next };
  });
}

function handleSSEEvent(
  set: (fn: (s: { runs: Map<string, GenerationRun> }) => { runs: Map<string, GenerationRun> }) => void,
  sessionId: string,
  event: Record<string, unknown>,
) {
  switch (event.type) {
    case "status":
      updateRun(set, sessionId, (run) => ({
        streamSteps: [
          ...run.streamSteps,
          { id: `status-${Date.now()}`, label: event.message as string, status: "done" as const },
        ],
      }));
      break;

    case "agent_start":
      updateRun(set, sessionId, (run) => {
        const next = new Map(run.agentToolParts);
        next.set(event.agent as string, {
          type: event.label as string,
          state: "input-streaming",
          input: event.input as Record<string, unknown>,
          toolCallId: event.agent as string,
        });
        return { agentToolParts: next };
      });
      break;

    case "agent_output":
      updateRun(set, sessionId, (run) => {
        const next = new Map(run.agentToolParts);
        const existing = next.get(event.agent as string);
        if (existing) {
          next.set(event.agent as string, {
            ...existing,
            state: "output-available",
            output: event.output as Record<string, unknown>,
          });
        }
        return { agentToolParts: next };
      });
      break;

    case "agent_error":
      updateRun(set, sessionId, (run) => {
        const next = new Map(run.agentToolParts);
        const existing = next.get(event.agent as string);
        if (existing) {
          next.set(event.agent as string, {
            ...existing,
            state: "output-error",
            errorText: event.errorText as string,
          });
        }
        return { agentToolParts: next };
      });
      break;

    case "doc_saved":
      updateRun(set, sessionId, (run) => ({
        completedDocs: [...run.completedDocs, event.label as string],
      }));
      break;

    case "error":
      updateRun(set, sessionId, (run) => ({
        status: "error",
        errorMessage: event.error as string,
        streamSteps: [
          ...run.streamSteps,
          { id: `error-${Date.now()}`, label: event.error as string, status: "error" as const },
        ],
      }));
      break;

    case "done":
      // Stream completion is handled by the reader loop
      break;
  }
}

export const useGenerationStore = create<GenerationStore>((set, get) => ({
  runs: new Map(),

  startGeneration: ({ sessionId, sessionTitle, prompt, confirmedAgents }) => {
    // Abort any existing generation for this session
    const existing = get().runs.get(sessionId);
    if (existing?.abortController) {
      existing.abortController.abort();
    }

    const abortController = new AbortController();

    const newRun: GenerationRun = {
      sessionId,
      sessionTitle,
      status: "running",
      streamSteps: [],
      agentToolParts: new Map(),
      completedDocs: [],
      abortController,
    };

    set((state) => {
      const next = new Map(state.runs);
      next.set(sessionId, newRun);
      return { runs: next };
    });

    // Fire-and-forget: SSE reader loop runs in the store, independent of components
    (async () => {
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, prompt, confirmedAgents }),
          signal: abortController.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          let buffer = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const dataLine = line.replace(/^data: /, "");
              if (!dataLine) continue;
              try {
                const event = JSON.parse(dataLine);
                handleSSEEvent(set, sessionId, event);
              } catch {
                // skip parse errors
              }
            }
          }
        }

        // Stream ended — mark completed if still running
        updateRun(set, sessionId, (run) =>
          run.status === "running"
            ? { status: "completed", abortController: null }
            : {},
        );
      } catch (err) {
        if (abortController.signal.aborted) return;

        updateRun(set, sessionId, () => ({
          status: "error",
          errorMessage: err instanceof Error ? err.message : "网络错误",
          abortController: null,
        }));
      }
    })();
  },

  cancelGeneration: (sessionId) => {
    const run = get().runs.get(sessionId);
    if (run?.abortController) {
      run.abortController.abort();
    }
    set((state) => {
      const next = new Map(state.runs);
      next.delete(sessionId);
      return { runs: next };
    });
  },

  clearGeneration: (sessionId) => {
    set((state) => {
      const next = new Map(state.runs);
      next.delete(sessionId);
      return { runs: next };
    });
  },
}));
