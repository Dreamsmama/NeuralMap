from typing import List, Literal, Optional

from pydantic import BaseModel, Field

NodeType = Literal["concept", "future", "tool", "risk", "philosophy", "opportunity"]


class ExploreNode(BaseModel):
    title: str
    description: str
    type: NodeType = "concept"


class ExpandRequest(BaseModel):
    topic: str = Field(..., min_length=1, max_length=500)
    parent_title: Optional[str] = None
    context_path: List[str] = Field(default_factory=list)


class ExpandResponse(BaseModel):
    nodes: List[ExploreNode]


class DetailRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: str = ""
    context_path: List[str] = Field(default_factory=list)


class NodeDetail(BaseModel):
    explanation: str
    why_important: str
    future_impact: str
    related_directions: List[str]
    next_explore: List[str]


class DetailResponse(BaseModel):
    detail: NodeDetail
