# WorldFlow

**AI Infinite Exploration Universe** — 下一代探索式 AI 界面

输入一个主题，AI 不断生成新节点。无限点击、无限展开、无限探索。

## 技术栈

| Layer | Stack |
|-------|-------|
| Frontend | React + Vite + TypeScript + TailwindCSS + React Flow |
| Backend | FastAPI (Python) |
| AI | OpenAI Compatible API (DeepSeek / OpenAI) |

## 快速开始

### 1. 后端

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# 编辑 .env 填入 API Key
uvicorn main:app --reload --port 8000
```

### 2. 前端

```bash
cd frontend
npm install
npm run dev
```

打开 http://localhost:5173

### 3. 配置 AI

编辑 `backend/.env`：

```env
OPENAI_API_KEY=your-api-key
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_MODEL=deepseek-chat
```

未配置 API Key 时，系统自动使用 Demo 模式（内置 fallback 节点）。

## 项目结构

```
WorldFlow/
├── backend/
│   ├── main.py              # FastAPI 入口
│   ├── config.py            # 环境配置
│   ├── models.py            # Pydantic 模型
│   ├── prompts.py           # AI Prompt 工程
│   └── services/
│       └── ai_service.py    # AI 调用封装
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── HomePage.tsx       # 首页
│       │   └── ExplorePage.tsx    # 无限探索页
│       ├── components/
│       │   ├── WorldFlowCanvas.tsx # React Flow 画布
│       │   ├── WorldNode.tsx       # 自定义节点
│       │   ├── DetailPanel.tsx     # AI 详情面板
│       │   └── CosmicBackground.tsx # 星空背景
│       ├── hooks/
│       │   └── useWorldFlow.ts     # 探索逻辑
│       └── api/
│           └── client.ts           # API 客户端
└── README.md
```

## 核心功能

- **首页** — 巨大输入框，输入任意主题开始探索
- **Infinite Canvas** — React Flow 无限画布，自由拖拽缩放
- **AI 节点生成** — 点击节点自动展开 5-8 个新方向
- **Detail Panel** — 右侧 AI 宇宙百科面板
- **6 种节点类型** — concept / future / tool / risk / philosophy / opportunity
- **未来感视觉** — 深色宇宙、毛玻璃、微发光、粒子星空

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | 健康检查 |
| POST | `/api/explore/expand` | 展开节点，生成子节点 |
| POST | `/api/explore/detail` | 获取节点 AI 详情 |
