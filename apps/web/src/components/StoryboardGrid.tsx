import { useJobStore } from '../store/jobStore'

const VIEWS_3D = [
  { key: 'front', label: '正面' },
  { key: 'side', label: '侧面' },
  { key: 'back', label: '背面' },
  { key: 'top', label: '顶面' },
]

const VIEWS_RELIEF = [
  { key: 'depth', label: '高度/深度图' },
  { key: 'preview', label: '浮雕预览' },
  { key: 'mesh', label: '网格侧视' },
  { key: 'print', label: '打印示意' },
]

export function StoryboardGrid() {
  const { currentJob, plan } = useJobStore()
  const isRelief = plan?.output_mode === 'relief_2d5' || currentJob?.output_mode === 'relief_2d5'
  const active = currentJob?.status === 'generating_multiview' || currentJob?.status === 'generating_3d'
  const completed = (currentJob?.multiview_image_paths?.length ?? 0) > 0

  if (!active && !completed) return null

  const views = isRelief ? VIEWS_RELIEF : VIEWS_3D

  return (
    <div className="rounded-2xl bg-slate-800/60 p-5 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold">
          {isRelief ? '浮雕 / 深度图确认' : '多视角分镜确认'}
        </h3>
        <span className="text-xs text-slate-400">
          {active ? 'AI 正在合成…' : '已生成，可点击不满意视角重生成'}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {views.map((view, idx) => {
          const src = currentJob?.multiview_image_paths?.[idx]
          return (
            <div
              key={view.key}
              className="group relative rounded-xl border border-slate-700 bg-slate-900 overflow-hidden aspect-square"
            >
              {src ? (
                <img
                  src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/files/${encodeURIComponent(src)}`}
                  alt={view.label}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600">
                  <span className="text-3xl">?</span>
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <p className="text-xs text-white font-medium">{view.label}</p>
              </div>

              <button
                type="button"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition bg-slate-900/80 text-slate-200 text-[10px] px-2 py-1 rounded-md border border-slate-600 hover:bg-indigo-500/80"
                onClick={() => alert(`重新生成 ${view.label}（后端指令占位）`)}
              >
                重生成
              </button>
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          className="text-xs px-3 py-1.5 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 transition"
          onClick={() => alert('全部重新生成（后端指令占位）')}
        >
          全部重生成
        </button>
        <button
          type="button"
          className="text-xs px-3 py-1.5 rounded-lg bg-indigo-500 text-white hover:bg-indigo-400 transition"
          onClick={() => alert('确认并继续生成（后端指令占位）')}
        >
          确认并继续
        </button>
      </div>
    </div>
  )
}
