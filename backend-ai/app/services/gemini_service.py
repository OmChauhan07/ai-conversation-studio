from __future__ import annotations

from dataclasses import dataclass

from app.core.config import GEMINI_API_KEY, GEMINI_MODEL_NAME, GROQ_API_KEY, GROQ_MODEL_NAME

try:
    from google import genai
except Exception:  # pragma: no cover - optional import guard
    genai = None

try:
    from groq import Groq
except Exception:  # pragma: no cover - optional import guard
    Groq = None


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
        if cls._gemini_client is None and GEMINI_API_KEY and genai is not None:
            cls._gemini_client = genai.Client(api_key=GEMINI_API_KEY)

        return cls._gemini_client

    @classmethod
    def get_groq_client(cls):
        if cls._groq_client is None and GROQ_API_KEY and Groq is not None:
            cls._groq_client = Groq(api_key=GROQ_API_KEY)

        return cls._groq_client

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
    def _is_retryable_provider_error(error: Exception) -> bool:
        message = str(error).lower()
        retryable_markers = [
            "429",
            "rate limit",
            "timeout",
            "timed out",
            "temporarily unavailable",
            "service unavailable",
            "api unavailable",
            "connection error",
            "internal server error",
            "503",
        ]
        return any(marker in message for marker in retryable_markers)

    def _generate_with_gemini(self, prompt: str) -> GenerationResult:
        if self.gemini_client is None:
            raise ValueError("Gemini unavailable")

        response = self.gemini_client.models.generate_content(
            model=GEMINI_MODEL_NAME,
            contents=prompt,
        )
        text = self._extract_gemini_text(response)
        if not text:
            raise ValueError("Gemini returned an empty response")

        return GenerationResult(text=text, provider="Gemini", model=GEMINI_MODEL_NAME)

    def _generate_with_groq(self, prompt: str) -> GenerationResult:
        if self.groq_client is None:
            raise ValueError("Groq unavailable")

        response = self.groq_client.chat.completions.create(
            model=GROQ_MODEL_NAME,
            messages=[
                {"role": "user", "content": prompt},
            ],
            temperature=0,
        )
        text = self._extract_groq_text(response)
        if not text:
            raise ValueError("Groq returned an empty response")

        return GenerationResult(text=text, provider="Groq", model=GROQ_MODEL_NAME)

    async def generate(self, prompt: str) -> GenerationResult:
        if not prompt or not prompt.strip():
            raise ValueError("Prompt cannot be empty.")

        gemini_error = None

        try:
            return self._generate_with_gemini(prompt)
        except Exception as error:
            gemini_error = error

        try:
            return self._generate_with_groq(prompt)
        except Exception as groq_error:
            if gemini_error is None:
                raise groq_error

            raise ValueError("No providers available") from groq_error