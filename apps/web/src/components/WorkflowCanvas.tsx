import { useJobStore } from '../store/jobStore'
import type { SkillStep } from '../api/client'

interface DisplayStep {
  id: string
  label: string
  desc: string
  status: string
}

const DEFAULT_STEP_DEFS = [
  { key: 'upload', label: '上传照片', desc: '1 张物品/宠物/人物照片' },
  { key: 'style', label: '风格设定', desc: '选择风格与补充描述' },
  { key: 'multiview', label: '多视角合成', desc: 'AI 生成前/侧/后视角' },
  { key: 'model3d', label: '3D 生成', desc: '云端模型生成网格' },
  { key: 'printcheck', label: '打印检查', desc: '壁厚/流形/支撑分析' },
  { key: 'export', label: '导出下载', desc: 'GLB / OBJ / 3MF / STL' },
]

const STATUS_MAP: Record<string, number> = {
  pending: 0,
  preprocessing: 1,
  generating_multiview: 2,
  generating_3d: 3,
  postprocessing: 4,
  completed: 5,
  failed: -1,
}

function toDisplayStep(step: SkillStep): DisplayStep {
  return {
    id: step.id,
    label: step.description.split('，')[0] || step.skill,
    desc: step.description,
    status: step.status,
  }
}

function defaultDisplaySteps(jobStatus: string): DisplayStep[] {
  const activeIndex = jobStatus ? (STATUS_MAP[jobStatus] ?? 0) : 0
  return DEFAULT_STEP_DEFS.map((s, i) => {
    let status = 'pending'
    if (activeIndex === -1) status = 'failed'
    else if (activeIndex > i || (jobStatus === 'completed' && i < 5)) status = 'completed'
    else if (activeIndex === i) status = 'running'
    return { id: `s${i}`, label: s.label, desc: s.desc, status }
  })
}

function stepStatusClasses(status: string) {
  if (status === 'completed') return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
  if (status === 'failed') return 'bg-red-500/10 border-red-500/50 text-red-300'
  if (status === 'running') return 'bg-indigo-500/15 border-indigo-400 text-indigo-300'
  return 'bg-slate-900/50 border-slate-700 text-slate-400'
}

function stepNumber(status: string, idx: number) {
  if (status === 'completed') return '✓'
  if (status === 'failed') return '✕'
  return idx + 1
}

export function WorkflowCanvas() {
  const { currentJob, plan } = useJobStore()

  const steps: DisplayStep[] =
    plan?.steps && plan.steps.length > 0
      ? plan.steps.map(toDisplayStep)
      : defaultDisplaySteps(currentJob?.status || '')

  return (
    <div className="rounded-2xl bg-slate-800/60 p-5 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold">Lazy Canvas · 3D 生产流程</h3>
        <span className="text-xs text-slate-400">
          {plan ? 'AI 已自动安排计划' : '上传照片并点击生成'}
        </span>
      </div>

      <div className="relative">
        <div className="absolute top-6 left-4 right-4 h-0.5 bg-slate-700 -z-0" />

        <div className="relative z-10 grid grid-cols-3 md:grid-cols-6 gap-3">
          {steps.map((step, idx) => {
            const isFailed = step.status === 'failed'
            const isRunning = step.status === 'running'
            const isCompleted = step.status === 'completed'

            return (
              <div
                key={step.id}
                className={`
                  flex flex-col items-center text-center rounded-xl p-3 transition border
                  ${stepStatusClasses(step.status)}
                  ${isFailed ? 'animate-pulse' : ''}
                `}
              >
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-2
                    ${isFailed ? 'bg-red-500 text-white' : isRunning ? 'bg-indigo-500 text-white animate-pulse' : isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'}
                  `}
                >
                  {stepNumber(step.status, idx)}
                </div>
                <p className="text-xs font-medium">{step.label}</p>
                <p className="text-[10px] text-slate-500 mt-1 leading-tight line-clamp-2">{step.desc}</p>
              </div>
            )
          })}
        </div>
      </div>

      {plan?.reasoning && (
        <div className="mt-4 rounded-lg bg-slate-900/50 border border-slate-700 p-3 text-xs text-slate-300">
          <span className="font-semibold text-indigo-300">AI 规划：</span>
          {plan.reasoning}
        </div>
      )}

      {currentJob?.status === 'failed' && currentJob.error_message && (
        <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-300">
          生成失败：{currentJob.error_message}
        </div>
      )}
    </div>
  )
}
