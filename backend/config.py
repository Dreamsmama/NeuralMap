from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # 阿里云通义千问 DashScope
    dashscope_api_key: str = ""
    dashscope_url: str = (
        "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation"
    )
    dashscope_model: str = "qwen-plus"
    dashscope_timeout_seconds: int = 30
    dashscope_temperature: float = 0.2
    dashscope_max_tokens: int = 2048
    dashscope_expand_temperature: float = 0.75
    dashscope_detail_temperature: float = 0.5


settings = Settings()
