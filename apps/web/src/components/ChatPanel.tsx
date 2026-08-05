import { useState, type FormEvent } from 'react'
import { agentChat, agentPlan } from '../api/client'
import { useJobStore } from '../store/jobStore'

const QUICK_ACTIONS = ['卡通 3D', '写实 3D', '2.5D 浮雕', '加厚底座', '低多边形', '导出 3MF']

export function ChatPanel() {
  const { currentJob, plan, chatMessages, addChatMessage, setPlan, updatePlan, setSelectedStyleId } = useJobStore()
  const [input, setInput] = useState('')

  const applyAction = (action: string, params: Record<string, unknown>) => {
    if (!plan) return

    if (action === 'update_style') {
      const styleId = params.style_id as string
      if (styleId) {
        setSelectedStyleId(styleId)
        updatePlan({ style_id: styleId, output_mode: styleId.includes('relief') ? 'relief_2d5' : 'fullcolor_3d' })
      }
    } else if (action === 'update_params') {
      updatePlan({ postprocess_params: { ...plan.postprocess_params, ...params } })
    } else if (action === 'regenerate') {
      // If a job exists, user can click generate again; this just nudges.
      addChatMessage({ role: 'agent', content: '好的，我会使用当前计划重新生成。请点左侧“按 AI 计划生成”。' })
    }
  }

  const send = async (text: string) => {
    if (!text.trim()) return
    addChatMessage({ role: 'user', content: text })

    try {
      const result = await agentChat(text, plan)
      applyAction(result.action, result.params)

      if (result.action === 'update_style' && result.params.style_id && currentJob?.input_image_path) {
        // Re-plan with the new style context
        const newPlan = await agentPlan(text, currentJob.input_image_path)
        setPlan(newPlan)
        setSelectedStyleId(newPlan.style_id)
      }

      addChatMessage({ role: 'agent', content: result.response })
    } catch (err) {
      addChatMessage({ role: 'agent', content: '抱歉，AI 助手暂时无法响应。' })
    }
    setInput('')
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    send(input)
  }

  return (
    <div className="flex flex-col h-full rounded-2xl bg-slate-800/60 border border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-base font-semibold">AI 导演助手</h3>
        <p className="text-xs text-slate-400 mt-1">一句话调整风格、尺寸或导出格式</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[240px]">
        {chatMessages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`
                max-w-[85%] rounded-2xl px-3 py-2 text-sm
                ${msg.role === 'user' ? 'bg-indigo-500 text-white rounded-br-md' : 'bg-slate-700 text-slate-200 rounded-bl-md'}
              `}
            >
              {msg.content}
              {msg.actions && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {msg.actions.map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => send(action)}
                      className="text-[10px] px-2 py-1 rounded-full bg-slate-900/40 hover:bg-indigo-500/30 border border-slate-600 transition"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-700 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action}
              type="button"
              onClick={() => send(action)}
              className="text-[10px] px-2 py-1 rounded-md bg-slate-700 text-slate-200 hover:bg-slate-600 transition"
            >
              {action}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入指令，如底座加厚 2mm…"
            className="flex-1 rounded-lg bg-slate-900 border border-slate-600 px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="rounded-lg bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50 transition"
          >
            发送
          </button>
        </form>
      </div>
    </div>
  )
}
