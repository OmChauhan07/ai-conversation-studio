"""Shared exception types for the AI backend."""


class AIBackendError(Exception):
    """Base class for AI backend errors."""


class KnowledgeBaseEmptyError(AIBackendError):
    """Raised when ChromaDB contains no indexed knowledge."""


class NoRelevantKnowledgeError(AIBackendError):
    """Raised when retrieval returns no chunks above the relevance threshold."""


class ProviderUnavailableError(AIBackendError):
    """Raised when no LLM provider can fulfill the request."""


class InvalidModelError(AIBackendError):
    """Raised when a configured model name is invalid or unavailable."""