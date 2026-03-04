import { create } from "zustand";

type DocumentTab = "mermaid" | "api_spec" | "arch_design" | "dev_plan";
type ViewMode = "preview" | "edit";

interface WorkspaceState {
  activeTab: DocumentTab;
  viewMode: ViewMode;
  isSending: boolean;
  isGenerating: boolean;
  setActiveTab: (tab: DocumentTab) => void;
  setViewMode: (mode: ViewMode) => void;
  setIsSending: (v: boolean) => void;
  setIsGenerating: (v: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeTab: "mermaid",
  viewMode: "preview",
  isSending: false,
  isGenerating: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setIsSending: (v) => set({ isSending: v }),
  setIsGenerating: (v) => set({ isGenerating: v }),
}));
