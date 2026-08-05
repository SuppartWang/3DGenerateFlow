import { useEffect } from 'react'
import { getJob } from '../api/client'
import { useJobStore } from '../store/jobStore'

const STATUS_LABEL: Record<string, string> = {
  pending: '等待中',
  preprocessing: '预处理',
  generating_multiview: '生成多视角',
  generating_3d: '生成 3D 模型',
  postprocessing: '后处理',
  completed: '完成',
  failed: '失败',
}

export function JobStatus() {
  const { currentJob, setJob } = useJobStore()

  useEffect(() => {
    if (!currentJob || currentJob.status === 'completed' || currentJob.status === 'failed') return
    const id = setInterval(async () => {
      const updated = await getJob(currentJob.id)
      setJob(updated)
    }, 2000)
    return () => clearInterval(id)
  }, [currentJob, setJob])

  if (!currentJob) return null

  return (
    <div className="rounded-2xl bg-slate-800/60 p-6 border border-slate-700">
      <h3 className="text-lg font-semibold mb-2">任务状态</h3>
      <div className="space-y-2 text-sm text-slate-300">
        <p>
          状态：
          <span className="ml-1 font-medium text-indigo-300">
            {STATUS_LABEL[currentJob.status] || currentJob.status}
          </span>
        </p>
        <p>任务 ID：{currentJob.id}</p>
        <p>风格：{currentJob.style}</p>
        <p>输出：{currentJob.output_mode === 'relief_2d5' ? '2.5D 浮雕' : '全彩 3D'}</p>
        {currentJob.print_report && (
          <p className="text-xs text-slate-400">
            打印报告：{JSON.stringify(currentJob.print_report)}
          </p>
        )}
        {currentJob.error_message && (
          <p className="text-red-400">错误：{currentJob.error_message}</p>
        )}
      </div>

      {currentJob.status === 'completed' && currentJob.result_model_path && (
        <div className="mt-4">
          <a
            href={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/files/${encodeURIComponent(currentJob.result_model_path)}`}
            download
            className="inline-flex items-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400 transition"
          >
            下载 {currentJob.output_mode === 'relief_2d5' ? 'STL / 浮雕' : 'GLB / 3D'}
          </a>
        </div>
      )}
    </div>
  )
}
