import { useState, useRef, useEffect, type FormEvent } from 'react'
import { uploadImage, fetchStyles, agentPlan, agentExecute, type PlanResponse } from '../api/client'
import { useJobStore } from '../store/jobStore'

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [agentInput, setAgentInput] = useState('')
  const [planning, setPlanning] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    styles,
    selectedStyleId,
    plan,
    setStyles,
    setSelectedStyleId,
    setPlan,
    setJob,
    addChatMessage,
  } = useJobStore()

  useEffect(() => {
    fetchStyles().then((s) => {
      setStyles(s)
      if (!s.find((x) => x.id === selectedStyleId)) {
        setSelectedStyleId(s[0]?.id || 'realistic_3d')
      }
    })
  }, [setStyles, selectedStyleId, setSelectedStyleId])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handlePlan = async (e?: FormEvent) => {
    e?.preventDefault()
    if (!file) {
      alert('请先上传照片')
      return
    }
    setPlanning(true)
    try {
      const upload = await uploadImage(file)
      const generated = await agentPlan(agentInput || '写实 3D 模型', upload.path)
      setPlan(generated)
      setSelectedStyleId(generated.style_id)
      addChatMessage({
        role: 'agent',
        content: `已生成计划：${generated.reasoning}\n\n风格：${generated.style_id}\n输出模式：${generated.output_mode === 'relief_2d5' ? '2.5D 浮雕' : '全彩 3D'}`,
      })
    } catch (err) {
      alert(err instanceof Error ? err.message : '生成计划失败')
    } finally {
      setPlanning(false)
    }
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    try {
      let currentPlan = plan
      let uploadPath = ''

      if (!currentPlan) {
        const upload = await uploadImage(file)
        uploadPath = upload.path
        currentPlan = await agentPlan(agentInput || '写实 3D 模型', uploadPath)
        setPlan(currentPlan)
      } else {
        uploadPath = currentPlan.user_prompt ? '' : ''
        // Re-upload to get a path if we don't have one (plan may have been created without upload)
        const upload = await uploadImage(file)
        uploadPath = upload.path
      }

      const exec = await agentExecute(currentPlan, uploadPath)
      addChatMessage({
        role: 'agent',
        content: `已提交任务 ${exec.job_id.slice(0, 8)}，正在执行 ${currentPlan.output_mode === 'relief_2d5' ? '2.5D 浮雕' : '全彩 3D'} 流程。`,
      })

      // Start polling via JobStatus component
      setJob({
        id: exec.job_id,
        status: 'pending',
        input_image_path: uploadPath,
        style: currentPlan.style_id,
        prompt: currentPlan.user_prompt,
        output_mode: currentPlan.output_mode,
        result_model_path: null,
        result_preview_path: null,
        multiview_image_paths: null,
        print_report: null,
        error_message: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    } catch (err) {
      alert(err instanceof Error ? err.message : '提交失败')
    } finally {
      setLoading(false)
    }
  }

  const selectedStyle = styles.find((s) => s.id === selectedStyleId)

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-2xl bg-slate-800/60 p-5 border border-slate-700">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">1. 上传照片</label>
        <div
          onClick={() => inputRef.current?.click()}
          className="cursor-pointer rounded-xl border-2 border-dashed border-slate-600 hover:border-indigo-400 p-5 text-center transition"
        >
          {preview ? (
            <img src={preview} alt="preview" className="mx-auto max-h-40 rounded-lg object-cover" />
          ) : (
            <span className="text-slate-400 text-sm">点击选择物品 / 宠物 / 人物照片</span>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">2. 告诉 AI 你的需求（可选）</label>
        <textarea
          value={agentInput}
          onChange={(e) => setAgentInput(e.target.value)}
          placeholder="例如：想做一只可爱的柴犬卡通 3D 摆件，底座加厚"
          className="w-full rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
          rows={2}
        />
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={handlePlan}
            disabled={!file || planning}
            className="flex-1 rounded-lg bg-slate-700 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-600 disabled:opacity-50 transition"
          >
            {planning ? 'AI 规划中…' : '让 AI 规划风格'}
          </button>
        </div>
      </div>

      {selectedStyle && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">3. 选择风格</label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {styles.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setSelectedStyleId(s.id)
                  const newPlan: Partial<PlanResponse> = plan ? {
                    ...plan,
                    style_id: s.id,
                    output_mode: s.output_mode,
                  } : { style_id: s.id, output_mode: s.output_mode, user_prompt: s.style_prompt }
                  // Only update if plan exists; otherwise just set selection
                  if (plan) useJobStore.getState().setPlan({ ...plan, ...newPlan })
                }}
                className={`text-left rounded-lg border px-3 py-2 text-xs transition ${
                  selectedStyleId === s.id
                    ? 'border-indigo-400 bg-indigo-500/15 text-indigo-200'
                    : 'border-slate-600 bg-slate-900/50 text-slate-300 hover:border-slate-500'
                }`}
              >
                <p className="font-semibold">{s.name}</p>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{s.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={!file || loading}
        className="w-full rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading ? '提交中…' : plan ? '按 AI 计划生成' : '生成模型'}
      </button>
    </form>
  )
}
