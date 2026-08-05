# 3DGenerateFlow 演示视频脚本（3–5 分钟）

## 视频目标

- 展示 Web UI 实际操作流程
- 展示后端在 AMD Radeon GPU / ROCm 上的实际运行表现
- 展示最终输出：清晰、稳定、多样化的 3D / 2.5D 模型
- 体现“从一张照片到可打印全彩 3D”的完整创作闭环

---

## 建议分镜与旁白

### 第 1 段：开场 + 痛点（30 秒）

**画面**：黑场 → 标题卡 → 一张普通宠物/人物照片。

**旁白**：
> “想把自己家的宠物、家人照片，或者一个产品图，变成可以 3D 打印的全彩手办或浮雕？传统流程需要拍摄多视角、手动建模、风格化、检查打印参数，门槛很高。3DGenerateFlow 让这件事变成一句话 + 一张照片。”

---

### 第 2 段：项目介绍（30 秒）

**画面**：Web UI 主界面全景，展示“向导”和“Lazy Canvas”双模式、GPU 状态徽章。

**旁白**：
> “3DGenerateFlow 是一个基于 Web UI 的 AI 多模态内容创作工具。它内置 3D Director Agent，只需上传照片并描述风格，系统就能自动编排从图生图、多视角合成、3D 生成到打印检查的完整流程。核心推理全部运行在 AMD Radeon GPU + ROCm 开源软件栈上。”

---

### 第 3 段：GPU 就绪确认（20 秒）

**画面**：右上角 **AMD ROCm Ready** 徽章 + `/health/gpu` 接口返回 JSON。

**旁白**：
> “首先我们确认后端环境：通过 `/health/gpu` 接口可以看到 ROCm 已就绪，GPU 为 AMD Radeon Graphics，48 GB 显存，PyTorch HIP 版本已正确识别。这意味着所有关键推理都在本地 AMD GPU 上运行。”

---

### 第 4 段：2.5D 浮雕演示（1 分钟）

**画面**：
1. 上传 `dog.jpg`（滑板狗）。
2. 输入需求：“2.5D 浮雕纪念币，滑板狗”。
3. 点击“让 AI 规划风格” → 系统选择 `relief_coin`。
4. 点击“生成模型”。
5. Lazy Canvas 六步流程高亮运行：上传 → 风格设定 → 多视角/深度 → 3D 生成 → 打印检查 → 导出。
6. 结果展示：深度图、多视角分镜、打印报告（尺寸 80×80×7 mm，体积 30 cm³，watertight）。
7. 下载 `relief.glb` 和 `relief.stl`，在本地 3D 查看器 / 打印软件中打开。

**旁白**：
> “我们先做一个 2.5D 浮雕纪念币。上传滑板狗照片，告诉 Agent 想要的风格，Agent 自动选择圆形硬币浮雕并安排深度估计。后端在 ROCm 上运行 Stable Diffusion 风格化和 Depth Anything V2 深度估计，随后 CPU 生成带彩色贴图的 GLB 和可直接打印的 STL。最终模型 watertight，尺寸和体积都经过打印检查。”

---

### 第 5 段：全彩 3D 演示（1.5 分钟）

**画面**：
1. 上传 `bride.jpg`（新娘全身像）。
2. 输入需求：“写实 3D 新娘全身像”。
3. Agent 规划选择 `realistic_3d`，输出模式 `fullcolor_3d`。
4. 点击“生成模型”。
5. Lazy Canvas 展示多视角合成步骤：front / right / back / left 四张图。
6. 继续展示 3D 生成和纹理贴图。
7. 结果展示：3D 模型预览、打印报告（目标高度 80 mm、体积、watertight 状态）。
8. 下载 `model.glb` 并在 Three.js 查看器 / Blender 中展示。

**旁白**：
> “接下来是全彩 3D。上传新娘照片并选择写实 3D 风格。Agent 调用 Zero123 在本地 AMD GPU 上合成前、右、后、左四个视角，然后输入 Hunyuan3D-2mv 多视角 3D 生成模型。由于 Hunyuan3D-2 的纹理模块依赖 CUDA 扩展在 ROCm 上无法直接编译，系统会自动 fallback：用正面投影贴图把参考图烘焙到 GLB 上，最终输出彩色 3D 模型。模型按 80 mm 目标高度等比缩放并打印检查。”

---

### 第 6 段：多样化风格展示（45 秒）

**画面**：快速切换多个风格生成的结果：
- 卡通 3D（可爱人物/宠物）
- 低多边形 3D
- 体素 3D
- 粘土 3D
- 素描 3D
- 透光浮雕（Lithophane）
- 剪影浮雕

**旁白**：
> “系统内置了丰富的风格目录。除了写实，还可以一键切换卡通、低多边形、体素、粘土、素描等 3D 风格，以及透光浮雕、剪影浮雕、纪念币等多种 2.5D 风格，满足个性化 3D 打印和视觉设计需求。”

---

### 第 7 段：AMD GPU 性能与运行表现（30 秒）

**画面**：
- 终端显示 `rocm-smi` 或 `amd-smi static` 输出。
- `/health/gpu` 接口返回 JSON。
- 终端展示 backend 日志：`Generating multi-view images` → `Generating 3D mesh` → `Scaling and computing print metrics`。
- 任务状态从 `pending` → `preprocessing` → `generating_multiview` → `generating_3d` → `postprocessing` → `completed`。

**旁白**：
> “整个过程中，风格迁移、多视角合成、3D 生成等关键推理全部在 AMD Radeon GPU 上本地完成。后端输出清晰、稳定，任务状态实时同步到前端，最终模型 watertight 且尺寸符合打印要求。”

---

### 第 8 段：结尾（30 秒）

**画面**：Web UI 下载按钮、GLB 模型旋转预览、项目 Logo 和 GitHub 仓库。

**旁白**：
> “3DGenerateFlow：一张照片，一句话，就能在 AMD Radeon GPU 上生成可打印的全彩 3D 或 2.5D 模型。项目已开源，欢迎体验。”

---

## 技术备注

- 录制工具：本地可用 OBS Studio / QuickTime；AMD 实例上可用 `ffmpeg` 录屏：
  ```bash
  ffmpeg -f x11grab -r 30 -s 1920x1080 -i :1 -c:v libx264 -preset fast out.mp4
  ```
- 建议同时录制 Web UI 和终端窗口，体现从命令行/GUI 到最终结果的完整流程。
- 首次运行需要下载模型，建议提前跑一次并把模型缓存到 `models/hf_cache`，避免录制时等待下载。
