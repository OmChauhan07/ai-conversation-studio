from __future__ import annotations

import logging
import time
from dataclasses import dataclass

from starlette.concurrency import run_in_threadpool

from app.core import config
from app.core.exceptions import InvalidModelError, ProviderUnavailableError

try:
    from google import genai
except Exception:  # pragma: no cover - optional import guard
    genai = None

try:
    from groq import Groq
except Exception:  # pragma: no cover - optional import guard
    Groq = None


logger = logging.getLogger(__name__)


@dataclass
class GenerationResult:
    text: str
    provider: str
    model: str


class GeminiService:
    _gemini_client = None
    _groq_client = None

    def __init__(self, gemini_client=None, groq_client=None):
        self.gemini_client = gemini_client or self.get_gemini_client()
        self.groq_client = groq_client or self.get_groq_client()

    @classmethod
    def get_gemini_client(cls):
        if cls._gemini_client is None and config.GEMINI_API_KEY and genai is not None:
            cls._gemini_client = genai.Client(api_key=config.GEMINI_API_KEY)

        return cls._gemini_client

    @classmethod
    def get_groq_client(cls):
        if cls._groq_client is None and config.GROQ_API_KEY and Groq is not None:
            cls._groq_client = Groq(api_key=config.GROQ_API_KEY)

        return cls._groq_client

    @staticmethod
    def _require_model(model_name: str | None, provider_name: str) -> str:
        if not model_name or not str(model_name).strip():
            raise InvalidModelError(f"{provider_name} model is not configured.")

        return str(model_name).strip()

    @staticmethod
    def _extract_gemini_text(response) -> str:
        if response is None:
            return ""

        text = getattr(response, "text", None)
        if text:
            return str(text).strip()

        candidates = getattr(response, "candidates", None) or []
        for candidate in candidates:
            content = getattr(candidate, "content", None)
            parts = getattr(content, "parts", None) or []
            values = []
            for part in parts:
                part_text = getattr(part, "text", None)
                if part_text:
                    values.append(str(part_text))
            if values:
                return "".join(values).strip()

        return ""

    @staticmethod
    def _extract_groq_text(response) -> str:
        if response is None:
            return ""

        choices = getattr(response, "choices", None) or []
        if not choices:
            return ""

        message = getattr(choices[0], "message", None)
        content = getattr(message, "content", None)
        return str(content).strip() if content else ""

    @staticmethod
    def _error_message(error: Exception) -> str:
        return str(error).strip()

    @classmethod
    def _is_invalid_model_error(cls, error: Exception) -> bool:
        message = cls._error_message(error).lower()
        invalid_markers = [
            "model not found",
            "model-not-found",
            "not found",
            "does not exist",
            "invalid model",
            "unknown model",
        ]
        return any(marker in message for marker in invalid_markers)

    def _generate_with_gemini(self, prompt: str) -> GenerationResult:
        if self.gemini_client is None:
            raise ProviderUnavailableError("Gemini unavailable.")

        model_name = self._require_model(config.GEMINI_MODEL_NAME, "Gemini")

        response = self.gemini_client.models.generate_content(
            model=model_name,
            contents=prompt,
        )
        text = self._extract_gemini_text(response)
        if not text:
            raise ProviderUnavailableError("Gemini returned an empty response.")

        return GenerationResult(text=text, provider="Gemini", model=model_name)

    def _generate_with_groq(self, prompt: str) -> GenerationResult:
        if self.groq_client is None:
            raise ProviderUnavailableError("Groq unavailable.")

        model_name = self._require_model(config.GROQ_MODEL_NAME, "Groq")

        response = self.groq_client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "user", "content": prompt},
            ],
            temperature=0,
        )
        text = self._extract_groq_text(response)
        if not text:
            raise ProviderUnavailableError("Groq returned an empty response.")

        return GenerationResult(text=text, provider="Groq", model=model_name)

    async def generate(self, prompt: str) -> GenerationResult:
        """Generate a grounded answer using Gemini, with Groq fallback on transient failures."""

        if not prompt or not prompt.strip():
            raise ValueError("Prompt cannot be empty.")

        start_time = time.perf_counter()
        logger.info("Provider selected: Gemini")

        try:
            result = await run_in_threadpool(self._generate_with_gemini, prompt)
            logger.info("Gemini latency: %.3fs", time.perf_counter() - start_time)
            return result
        except InvalidModelError:
            logger.exception("Gemini model error")
            raise
        except Exception as error:
            if self._is_invalid_model_error(error):
                logger.exception("Gemini model not found")
                raise InvalidModelError(self._error_message(error)) from error

            logger.warning("Gemini provider failed, falling back to Groq: %s", self._error_message(error))

        try:
            logger.info("Provider selected: Groq")
            result = await run_in_threadpool(self._generate_with_groq, prompt)
            logger.info("Groq latency: %.3fs", time.perf_counter() - start_time)
            return result

        except InvalidModelError:
            logger.exception("Groq model error")
            raise

        except Exception as error:
            if self._is_invalid_model_error(error):
                logger.exception("Groq model not found")
                raise InvalidModelError(self._error_message(error)) from error

            logger.exception("Groq provider unavailable")
            raise ProviderUnavailableError(self._error_message(error)) from error