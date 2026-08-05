import { useEffect, useState } from 'react'
import { getGpuStatus, type GpuStatus } from '../api/client'

export function GpuStatus() {
  const [status, setStatus] = useState<GpuStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getGpuStatus()
      .then(setStatus)
      .catch(() => setStatus(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-400 border border-slate-700">
        <span className="h-2 w-2 rounded-full bg-slate-500 animate-pulse" />
        检测 GPU...
      </span>
    )
  }

  if (!status) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-900/40 px-3 py-1 text-xs font-medium text-red-200 border border-red-800">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        GPU 状态不可用
      </span>
    )
  }

  if (status.rocm_available) {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-900/40 px-3 py-1 text-xs font-medium text-emerald-200 border border-emerald-800"
        title={`${status.gpu_name ?? 'AMD GPU'} · ${status.gpu_count ?? 0} device(s) · ${status.gpu_memory_mb ?? 0} MB VRAM · HIP ${status.hip_version ?? '?'}`}
      >
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        AMD ROCm Ready{status.gpu_name ? ` · ${status.gpu_name}` : ''}
      </span>
    )
  }

  if (status.torch_cuda_available) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-900/40 px-3 py-1 text-xs font-medium text-blue-200 border border-blue-800">
        <span className="h-2 w-2 rounded-full bg-blue-500" />
        CUDA GPU 模式{status.gpu_name ? ` · ${status.gpu_name}` : ''}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-900/40 px-3 py-1 text-xs font-medium text-amber-200 border border-amber-800">
      <span className="h-2 w-2 rounded-full bg-amber-500" />
      CPU 回退模式
    </span>
  )
}
