import { create } from 'zustand'
import type { JobResponse, PlanResponse, StyleTemplate } from '../api/client'

export type ViewMode = 'wizard' | 'canvas'

export interface ChatMessage {
  role: 'user' | 'agent'
  content: string
  actions?: string[]
}

interface JobState {
  viewMode: ViewMode
  currentJob: JobResponse | null
  plan: PlanResponse | null
  styles: StyleTemplate[]
  selectedStyleId: string
  chatMessages: ChatMessage[]
  setViewMode: (mode: ViewMode) => void
  setJob: (job: JobResponse) => void
  updateJob: (job: Partial<JobResponse>) => void
  setPlan: (plan: PlanResponse | null) => void
  updatePlan: (patch: Partial<PlanResponse>) => void
  setStyles: (styles: StyleTemplate[]) => void
  setSelectedStyleId: (id: string) => void
  addChatMessage: (msg: ChatMessage) => void
  reset: () => void
}

const WELCOME_MESSAGE: ChatMessage = {
  role: 'agent',
  content:
    '你好！我是 3D 生成助手。上传一张照片并告诉我你想要的风格（如“卡通 3D”“浮雕纪念币”），我会自动安排多视角合成、3D 建模或 2.5D 浮雕和打印检查流程。',
  actions: ['卡通 3D', '写实 3D', '2.5D 浮雕', '低多边形 3D', '透光浮雕'],
}

export const useJobStore = create<JobState>((set) => ({
  viewMode: 'canvas',
  currentJob: null,
  plan: null,
  styles: [],
  selectedStyleId: 'realistic_3d',
  chatMessages: [WELCOME_MESSAGE],
  setViewMode: (mode) => set({ viewMode: mode }),
  setJob: (job) => set({ currentJob: job }),
  updateJob: (patch) =>
    set((state) => ({
      currentJob: state.currentJob ? { ...state.currentJob, ...patch } : null,
    })),
  setPlan: (plan) => set({ plan }),
  updatePlan: (patch) =>
    set((state) => ({
      plan: state.plan ? { ...state.plan, ...patch } : null,
    })),
  setStyles: (styles) => set({ styles }),
  setSelectedStyleId: (id) => set({ selectedStyleId: id }),
  addChatMessage: (msg) =>
    set((state) => ({ chatMessages: [...state.chatMessages, msg] })),
  reset: () => set({ currentJob: null, plan: null, chatMessages: [WELCOME_MESSAGE] }),
}))
