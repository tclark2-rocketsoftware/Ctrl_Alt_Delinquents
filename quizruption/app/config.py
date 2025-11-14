"""Central configuration for backend deployment (host, port, secrets, CORS)."""
from __future__ import annotations
import os
from dataclasses import dataclass
from typing import List


@dataclass
class Settings:
    backend_host: str = os.getenv("BACKEND_HOST", "0.0.0.0")
    backend_port: int = int(os.getenv("BACKEND_PORT", "8000"))
    secret_key: str = os.getenv("SECRET_KEY", "change-me-in-production")
    jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    cors_origins_raw: str = os.getenv("CORS_ORIGINS", "*")

    @property
    def cors_allow_all(self) -> bool:
        return self.cors_origins_raw.strip() == "*"

    @property
    def cors_origins(self) -> List[str]:
        if self.cors_allow_all:
            return ["*"]
        return [o.strip() for o in self.cors_origins_raw.split(",") if o.strip()]


settings = Settings()
