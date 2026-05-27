import json
import logging
import re
from typing import Any

import httpx

from config import settings
from models import ExploreNode, NodeDetail
from prompts import SYSTEM_PROMPT, get_detail_prompt, get_expand_prompt

logger = logging.getLogger(__name__)

FALLBACK_ROOT_NODES: dict[str, list[ExploreNode]] = {
    "default": [
        ExploreNode(title="AI Agent 生态", description="自主 Agent 正在重塑每一个工作流", type="concept"),
        ExploreNode(title="自动化边界", description="人类劳动退居编排，机器接管执行", type="future"),
        ExploreNode(title="Cursor 与 AI IDE", description="软件创造的新界面正在诞生", type="tool"),
        ExploreNode(title="AI Native 应用", description="从智能中生长出的产品，而非从代码", type="opportunity"),
        ExploreNode(title="新职业图谱", description="那些还不存在的工作", type="future"),
        ExploreNode(title="软件工程演化", description="写代码的方式正在被重写", type="concept"),
        ExploreNode(title="替代悖论", description="岗位消失，世界却在扩张", type="risk"),
    ]
}

FALLBACK_EXPAND_NODES: list[ExploreNode] = [
    ExploreNode(title="涌现行为", description="系统开始超越设计者的预期", type="concept"),
    ExploreNode(title="人机共生", description="协作超越工具使用的边界", type="philosophy"),
    ExploreNode(title="Agent 集群", description="成千上万个 Agent 协同运作", type="future"),
    ExploreNode(title="上下文窗口", description="记忆成为新的竞争壁垒", type="tool"),
    ExploreNode(title="对齐鸿沟", description="当 AI 目标与人类开始分叉", type="risk"),
    ExploreNode(title="个人 AI 栈", description="你的私有智能层", type="opportunity"),
]


def _extract_json(text: str) -> dict[str, Any]:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\n?", "", text)
        text = re.sub(r"\n?```$", "", text)
    # 尝试从文本中提取 JSON 对象
    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        text = match.group(0)
    return json.loads(text)


class AIService:
    def __init__(self) -> None:
        self.api_key = settings.dashscope_api_key
        self.url = settings.dashscope_url
        self.model = settings.dashscope_model
        self.timeout = settings.dashscope_timeout_seconds

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key and not self.api_key.startswith("your-"))

    async def _chat(self, user_prompt: str, temperature: float) -> str:
        if not self.is_configured:
            raise RuntimeError("DashScope API key not configured")

        payload = {
            "model": self.model,
            "input": {
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ]
            },
            "parameters": {
                "result_format": "message",
                "temperature": temperature,
                "max_tokens": settings.dashscope_max_tokens,
            },
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                self.url,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
            response.raise_for_status()
            data = response.json()

        if data.get("code"):
            raise RuntimeError(f"DashScope error [{data.get('code')}]: {data.get('message')}")

        try:
            return data["output"]["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError) as e:
            logger.error("Unexpected DashScope response: %s", data)
            raise RuntimeError("Invalid DashScope response format") from e

    async def expand_nodes(
        self,
        topic: str,
        context_path: list[str],
        is_root: bool = False,
    ) -> list[ExploreNode]:
        count = 6
        prompt = get_expand_prompt(topic, context_path, is_root=is_root, count=count)

        try:
            raw = await self._chat(prompt, temperature=settings.dashscope_expand_temperature)
            parsed = _extract_json(raw)
            nodes = [ExploreNode(**n) for n in parsed.get("nodes", [])]
            if nodes:
                logger.info("DashScope generated %d nodes for topic: %s", len(nodes), topic[:30])
                return nodes[:6]
        except Exception as e:
            logger.warning("AI expand failed, using fallback: %s", e)

        if is_root:
            return FALLBACK_ROOT_NODES["default"]
        return FALLBACK_EXPAND_NODES[:count]

    async def get_node_detail(
        self,
        title: str,
        description: str,
        context_path: list[str],
    ) -> NodeDetail:
        prompt = get_detail_prompt(title, description, context_path)

        try:
            raw = await self._chat(prompt, temperature=settings.dashscope_detail_temperature)
            parsed = _extract_json(raw)
            detail = NodeDetail(**parsed["detail"])
            logger.info("DashScope generated detail for: %s", title[:30])
            return detail
        except Exception as e:
            logger.warning("AI detail failed, using fallback: %s", e)

        return NodeDetail(
            explanation=f"「{title}」是 WorldFlow 宇宙中的一个关键信号 —— 在这里，AI 正在重塑我们理解世界与导航未来的方式。",
            why_important="这个节点处于技术演化与人类命运的交汇点，是理解「正在到来之物」的重要门户。",
            future_impact="到 2035 年，类似概念将定义全新的产业、社会结构与思维方式 —— 今天看似遥远，明天已是日常。",
            related_directions=["相邻信号", "平行世界", "深层暗流", "边缘变量"],
            next_explore=[
                f"{title} 之后是什么？",
                f"{title} 的隐藏风险",
                f"驱动 {title} 的工具链",
                f"{title} 的哲学意涵",
            ],
        )


ai_service = AIService()
