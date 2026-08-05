import './index.css'
import { useJobStore } from './store/jobStore'
import { UploadForm } from './components/UploadForm'
import { JobStatus } from './components/JobStatus'
import { WorkflowCanvas } from './components/WorkflowCanvas'
import { StoryboardGrid } from './components/StoryboardGrid'
import { ModelViewer } from './components/ModelViewer'
import { ChatPanel } from './components/ChatPanel'
import { GpuStatus } from './components/GpuStatus'

function App() {
  const { viewMode, setViewMode, currentJob } = useJobStore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100">
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">3DGenerateFlow</h1>
            <p className="text-xs text-slate-400">一张照片 → 多视角 → 可打印全彩 3D</p>
          </div>

          <div className="flex items-center gap-3">
            <GpuStatus />
            <div className="flex items-center gap-2 rounded-lg bg-slate-800 p-1 border border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('wizard')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                viewMode === 'wizard' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              向导
            </button>
            <button
              type="button"
              onClick={() => setViewMode('canvas')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                viewMode === 'canvas' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Lazy Canvas
            </button>
          </div>
        </div>
      </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {viewMode === 'wizard' ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="space-y-6">
              <UploadForm />
              <JobStatus />
            </section>
            <section className="space-y-6">
              <ModelViewer />
              <div className="rounded-2xl bg-slate-800/60 p-5 border border-slate-700">
                <h3 className="text-base font-semibold mb-2">使用流程</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-slate-300">
                  <li>上传一张物品 / 宠物 / 人物照片</li>
                  <li>选择风格并补充描述</li>
                  <li>后端自动合成多视角图并生成全彩 3D 模型</li>
                  <li>预览、下载并直接用于 3D 打印</li>
                </ol>
              </div>
            </section>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-12">
            {/* Left: controls */}
            <div className="lg:col-span-3 space-y-5">
              <UploadForm />
              <JobStatus />
            </div>

            {/* Middle: canvas + preview */}
            <div className="lg:col-span-6 space-y-5">
              <WorkflowCanvas />
              <StoryboardGrid />
              <ModelViewer />
            </div>

            {/* Right: agent chat */}
            <div className="lg:col-span-3 min-h-[480px]">
              <ChatPanel />
            </div>
          </div>
        )}
      </main>

      {currentJob && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-slate-800/90 border border-slate-700 text-xs text-slate-300 shadow-lg">
          当前任务：{currentJob.id.slice(0, 8)} · {currentJob.status}
        </div>
      )}
    </div>
  )
}

export default App
