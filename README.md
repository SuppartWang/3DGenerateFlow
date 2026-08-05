# 3DGenerateFlow

基于一张照片生成可直接 3D 打印的全彩 3D / 2.5D 模型的内容创作工具。内置 **3D Director Agent**：输入一句话需求，Agent 自动选择风格、编排生成流程、生成多视角/深度图并输出可打印模型。

## 快速开始

1. 安装依赖：
   ```bash
   # 后端（推荐用 Docker，也可以本地 Python 环境）
   cd services/api
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt

   # 前端
   cd apps/web
   npm install
   npm run dev
   ```

2. 启动后端（开发模式使用同步 Celery，无需 Redis）：
   ```bash
   cd services/api
   CELERY_TASK_ALWAYS_EAGER=true \
   CELERY_RESULT_BACKEND=cache+memory:// \
   CELERY_TASK_EAGER_PROPAGATES=true \
   PYTHONPATH=../.. \
   uvicorn main:app --reload
   ```

3. 复制环境变量：
   ```bash
   cp .env.example .env
   # 填入：
   # - LLM_API_KEY / LLM_BASE_URL / LLM_MODEL（Agent 用，OpenAI 兼容）
   # - TRIPO_API_KEY / MESHY_API_KEY / RODIN_API_KEY（3D 生成用）
   # - REPLICATE_API_TOKEN / STABILITY_API_KEY（图生图/多视角用）
   ```

   不填 LLM key 时，Agent 会自动退回到规则模式，仍可跑通全流程。

## 项目结构

```
3DGenerateFlow/
├── apps/web              # React + TypeScript + Tailwind + R3F 前端
├── services/api          # FastAPI + Celery 后端
│   ├── agents/           # 3D Director Agent（Planner / Director / Memory / Chat / Skill Registry）
│   ├── pipelines/        # 3D / 2.5D 生成管线
│   ├── adapters/         # 云端/本地模型适配层
│   ├── routers/          # API 路由
│   └── jobs/             # Celery 异步任务
├── shared/schemas        # 前后端共享 Pydantic 结构
├── infra/                # Nginx 等部署配置
└── docker-compose.yml
```

## 主要能力

- **单图上传**：物品 / 宠物 / 人物照片。
- **AI Director Agent**：一句话生成执行计划，自动选择风格、输出模式、生成步骤。
- **风格目录**：写实 3D、卡通 3D、低多边形、体素、粘土、素描、2.5D 浮雕、透光浮雕（Lithophane）、纪念币/硬币、剪影浮雕等。
- **Lazy Canvas**：可视化展示 Agent 编排的 6 步流程，无需手动连线。
- **多视角 / 深度图分镜**：生成前确认，避免盲盒。
- **右侧 AI 聊天**：随时用自然语言切换风格、调整参数、重新生成。
- **打印就绪**：后端规划了壁厚/流形/支撑检查与 3MF/OBJ/STL 导出。

## 当前阶段

- [x] 项目脚手架（前后端 + Docker）
- [x] 单图上传与任务投递接口
- [x] Lazy Canvas + 向导双模式前端
- [x] 3D Director Agent（LLM / 规则 fallback）
- [x] 风格目录（3D + 2.5D 多种风格）
- [x] 3D / 2.5D 异步管线调度
- [ ] 接入真实云端 3D API（Tripo / Meshy / Rodin）
- [ ] 接入真实多视角/深度图合成模型
- [ ] 3D 打印后处理与导出

## ROCm / AMD GPU 本地运行

本项目已针对 **AMD Radeon GPU + ROCm** 进行适配，核心创作链路（风格迁移 → 深度估计 → 2.5D 浮雕生成）可在本地 AMD GPU 上运行，无需依赖闭源 3D API。

快速启动：

```bash
# 1. 安装 ROCm 环境与依赖
./rocm/setup_rocm.sh

# 2. 启动后端（启用 ROCm 模式）
cd services/api
source .venv/bin/activate
export USE_ROCM=true
CELERY_TASK_ALWAYS_EAGER=true CELERY_RESULT_BACKEND=cache+memory:// CELERY_TASK_EAGER_PROPAGATES=true PYTHONPATH=../.. uvicorn main:app --reload

# 3. 启动前端
cd apps/web
npm install
npm run dev
```

详细说明请见 [`docs/ROCM_GUIDE.md`](docs/ROCM_GUIDE.md)。

### 比赛演示检查点

1. 打开 Web UI，右上角显示 **AMD ROCm Ready** 徽章。
2. 上传一张照片，选择 `relief_embossed` 或 `relief_coin` 风格。
3. 点击生成，等待本地 ROCm 推理完成。
4. 下载 `relief.stl` 文件用于 3D 打印。
5. 运行 `python scripts/benchmark_rocm.py --image <path> --style relief_embossed` 获取性能数据。
