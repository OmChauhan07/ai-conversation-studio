from sentence_transformers import SentenceTransformer

from app.core.config import EMBEDDING_MODEL_NAME


class EmbeddingService:
    _model = None

    @classmethod
    def get_model(cls):
        if cls._model is None:
            cls._model = SentenceTransformer(EMBEDDING_MODEL_NAME)

        return cls._model

    @classmethod
    def generate_embeddings(cls, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []

        model = cls.get_model()
        embeddings = model.encode(
            texts,
            normalize_embeddings=True,
            convert_to_numpy=True,
        )

        return embeddings.tolist()