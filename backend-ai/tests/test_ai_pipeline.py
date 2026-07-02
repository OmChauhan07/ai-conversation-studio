from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.config import GROQ_MODEL_NAME, GEMINI_MODEL_NAME
from app.services.chat_service import ChatService
from app.services.chroma_service import ChromaService
from app.services.embedding_service import EmbeddingService
from app.services.gemini_service import GeminiService
from app.services.ingestion_service import IngestionService
from app.services.prompt_service import PromptService
from app.services.retrieval_service import RetrievalService


class FakeEmbeddingMatrix:
    def __init__(self, data):
        self._data = data

    def tolist(self):
        return self._data


class FakeCollection:
    def __init__(self):
        self.ids = []
        self.documents = []
        self.metadatas = []
        self.embeddings = []
        self.deleted_where = None

    def add(self, ids, documents, metadatas, embeddings):
        self.ids.extend(ids)
        self.documents.extend(documents)
        self.metadatas.extend(metadatas)
        self.embeddings.extend(embeddings)

    def count(self):
        return len(self.ids)

    def get(self, include):
        return {
            "ids": list(self.ids),
            "documents": list(self.documents),
            "metadatas": list(self.metadatas),
            "embeddings": list(self.embeddings),
        }

    def delete(self, where):
        self.deleted_where = where
        filename = where.get("filename")
        remaining = []
        remaining_ids = []
        remaining_metadatas = []
        remaining_embeddings = []

        for index, metadata in enumerate(self.metadatas):
            if metadata.get("filename") != filename:
                remaining.append(self.documents[index])
                remaining_ids.append(self.ids[index])
                remaining_metadatas.append(metadata)
                remaining_embeddings.append(self.embeddings[index])

        self.documents = remaining
        self.ids = remaining_ids
        self.metadatas = remaining_metadatas
        self.embeddings = remaining_embeddings


@pytest.mark.asyncio
async def test_embedding_service_loads_once(monkeypatch):
    calls = {"count": 0}

    class StubModel:
        def encode(self, texts, normalize_embeddings=True, convert_to_numpy=True):
            return FakeEmbeddingMatrix([[1.0, 0.0] for _ in texts])

    def fake_factory(model_name):
        calls["count"] += 1
        return StubModel()

    import app.services.embedding_service as embedding_module

    monkeypatch.setattr(embedding_module, "SentenceTransformer", fake_factory)
    EmbeddingService._model = None

    first = EmbeddingService.get_model()
    second = EmbeddingService.get_model()
    embeddings = EmbeddingService.generate_embeddings(["hello", "world"])

    assert calls["count"] == 1
    assert first is second
    assert embeddings == [[1.0, 0.0], [1.0, 0.0]]


def test_chroma_service_add_search_and_delete():
    collection = FakeCollection()
    service = ChromaService(collection=collection)

    service.add_documents(
        ids=["doc-1", "doc-2"],
        documents=["alpha chunk", "beta chunk"],
        metadatas=[
            {"filename": "employee.pdf", "chunk_number": 1, "total_chunks": 2, "uploaded_at": "2026-07-02T00:00:00Z"},
            {"filename": "employee.pdf", "chunk_number": 2, "total_chunks": 2, "uploaded_at": "2026-07-02T00:00:00Z"},
        ],
        embeddings=[[1.0, 0.0], [0.0, 1.0]],
    )

    results = service.search([0.95, 0.05], top_k=2)

    assert results[0]["id"] == "doc-1"
    assert results[0]["metadata"]["filename"] == "employee.pdf"
    assert results[1]["id"] == "doc-2"

    service.delete_document("employee.pdf")

    assert collection.deleted_where == {"filename": "employee.pdf"}
    assert collection.count() == 0


@pytest.mark.asyncio
async def test_ingestion_service_stores_embeddings_and_metadata(monkeypatch):
    fake_storage = []

    class FakeChromaService:
        def add_documents(self, ids, documents, metadatas, embeddings):
            fake_storage.append(
                {
                    "ids": ids,
                    "documents": documents,
                    "metadatas": metadatas,
                    "embeddings": embeddings,
                }
            )

    async def fake_save_pdf(file):
        return {
            "filename": "generated_employee.pdf",
            "original_name": "employee.pdf",
            "path": "C:/tmp/employee.pdf",
            "content_type": "application/pdf",
            "size": 1024,
        }

    def fake_extract_text(path):
        return {"text": "chunk one. chunk two.", "pages": 2}

    def fake_split_text(text):
        return ["chunk one", "chunk two"]

    def fake_generate_embeddings(texts):
        return [[float(index), 0.5] for index, _ in enumerate(texts)]

    monkeypatch.setattr("app.services.ingestion_service.FileService.save_pdf", fake_save_pdf)
    monkeypatch.setattr("app.services.ingestion_service.PDFService.extract_text", fake_extract_text)
    monkeypatch.setattr("app.services.ingestion_service.ChunkService.split_text", fake_split_text)
    monkeypatch.setattr("app.services.ingestion_service.EmbeddingService.generate_embeddings", fake_generate_embeddings)
    monkeypatch.setattr(IngestionService, "chroma_service", FakeChromaService())

    result = await IngestionService.process_document(SimpleNamespace(filename="employee.pdf"))

    assert result["message"] == "Document uploaded and processed successfully."
    assert result["statistics"] == {"pages": 2, "characters": len("chunk one. chunk two."), "chunks": 2}
    assert result["preview"] == "chunk one"
    assert len(fake_storage) == 1
    assert fake_storage[0]["metadatas"][0]["filename"] == "generated_employee.pdf"
    assert fake_storage[0]["metadatas"][0]["original_name"] == "employee.pdf"
    assert fake_storage[0]["metadatas"][0]["chunk_number"] == 1
    assert fake_storage[0]["metadatas"][0]["total_chunks"] == 2
    assert fake_storage[0]["metadatas"][0]["uploaded_at"].endswith("Z")


def test_retrieval_search_api_returns_chunks(monkeypatch):
    async def fake_search(self, query, top_k=5):
        return [
            {
                "id": "chunk-1",
                "chunk": "leave policy chunk",
                "metadata": {"filename": "policy.pdf"},
                "score": 0.99,
            }
        ]

    monkeypatch.setattr(RetrievalService, "search", fake_search)

    client = TestClient(app)
    response = client.post("/retrieval/search", json={"query": "What is the leave policy?"})

    assert response.status_code == 200
    assert response.json()["chunks"][0]["id"] == "chunk-1"


def test_retrieval_search_api_handles_empty_database(monkeypatch):
    async def fake_search(self, query, top_k=5):
        raise ValueError("Empty database")

    monkeypatch.setattr(RetrievalService, "search", fake_search)

    client = TestClient(app)
    response = client.post("/retrieval/search", json={"query": "What is the leave policy?"})

    assert response.status_code == 200
    assert response.json() == {"success": False, "message": "Empty database"}


def test_knowledge_upload_route_preserves_response_shape(monkeypatch):
    async def fake_process_document(file):
        return {
            "message": "Document uploaded and processed successfully.",
            "document": {"filename": "generated_employee.pdf"},
            "statistics": {"pages": 2, "characters": 100, "chunks": 2},
            "preview": "first chunk",
            "chunks": ["first chunk", "second chunk"],
        }

    monkeypatch.setattr("app.services.ingestion_service.IngestionService.process_document", fake_process_document)

    client = TestClient(app)
    response = client.post(
        "/knowledge/upload",
        files={"file": ("employee.pdf", b"%PDF-1.4 fake", "application/pdf")},
    )

    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["chunks"] == ["first chunk", "second chunk"]


def test_prompt_service_builds_single_grounded_prompt():
    prompt_service = PromptService()
    prompt = prompt_service.build_prompt(
        "What is the leave policy?",
        [
            {"chunk": "Employees receive 20 annual paid leaves.", "metadata": {"filename": "handbook.pdf"}},
            {"chunk": "Employees receive 20 annual paid leaves.", "metadata": {"filename": "handbook.pdf"}},
            {"chunk": "Leave must be approved by a manager.", "metadata": {"filename": "handbook.pdf"}},
        ],
    )

    assert prompt.count("Employees receive 20 annual paid leaves.") == 1
    assert "Do not hallucinate." in prompt
    assert "Question:" in prompt
    assert "What is the leave policy?" in prompt


@pytest.mark.asyncio
async def test_gemini_service_falls_back_to_groq(monkeypatch):
    class FakeGeminiModels:
        def generate_content(self, model, contents):
            raise TimeoutError("timeout")

    class FakeGeminiClient:
        def __init__(self):
            self.models = FakeGeminiModels()

    class FakeGroqCompletions:
        def create(self, model, messages, temperature):
            return SimpleNamespace(
                choices=[SimpleNamespace(message=SimpleNamespace(content="Groq fallback answer."))]
            )

    class FakeGroqClient:
        def __init__(self):
            self.chat = SimpleNamespace(completions=FakeGroqCompletions())

    service = GeminiService(gemini_client=FakeGeminiClient(), groq_client=FakeGroqClient())
    result = await service.generate("Prompt text")

    assert result.provider == "Groq"
    assert result.model == GROQ_MODEL_NAME
    assert result.text == "Groq fallback answer."


@pytest.mark.asyncio
async def test_gemini_service_uses_gemini_when_available(monkeypatch):
    class FakeGeminiModels:
        def generate_content(self, model, contents):
            return SimpleNamespace(text="Gemini answer.")

    class FakeGeminiClient:
        def __init__(self):
            self.models = FakeGeminiModels()

    class FakeGroqClient:
        def __init__(self):
            self.chat = SimpleNamespace(completions=SimpleNamespace(create=lambda *args, **kwargs: None))

    service = GeminiService(gemini_client=FakeGeminiClient(), groq_client=FakeGroqClient())
    result = await service.generate("Prompt text")

    assert result.provider == "Gemini"
    assert result.model == GEMINI_MODEL_NAME
    assert result.text == "Gemini answer."


@pytest.mark.asyncio
async def test_chat_service_orchestrates_retrieval_prompt_and_generation():
    class FakeRetrievalService:
        async def search(self, query, top_k=5, min_score=0.3):
            return [
                {
                    "id": "chunk-1",
                    "chunk": "Employees receive 20 annual paid leaves.",
                    "metadata": {"filename": "Employee Handbook.pdf", "chunk_number": 3, "original_name": "Employee Handbook.pdf"},
                    "score": 0.98,
                }
            ]

    class FakePromptService:
        def build_prompt(self, question, retrieved_chunks):
            return f"PROMPT::{question}::{len(retrieved_chunks)}"

    class FakeGeminiService:
        async def generate(self, prompt):
            return SimpleNamespace(
                text=f"Answer for {prompt}",
                provider="Gemini",
                model="gemma-4-31b",
            )

    service = ChatService(
        retrieval_service=FakeRetrievalService(),
        prompt_service=FakePromptService(),
        gemini_service=FakeGeminiService(),
    )
    result = await service.chat("What is the leave policy?")

    assert result["answer"].startswith("Answer for PROMPT::What is the leave policy?")
    assert result["sources"] == [{"filename": "Employee Handbook.pdf", "chunk_number": 3}]
    assert result["metadata"]["chunks_used"] == 1
    assert result["metadata"]["provider"] == "Gemini"


@pytest.mark.asyncio
async def test_chat_service_returns_no_knowledge_found_when_retrieval_is_empty():
    class FakeRetrievalService:
        async def search(self, query, top_k=5, min_score=0.3):
            return []

    service = ChatService(
        retrieval_service=FakeRetrievalService(),
        prompt_service=PromptService(),
        gemini_service=GeminiService(gemini_client=None, groq_client=None),
    )

    with pytest.raises(LookupError, match="No relevant knowledge found."):
        await service.chat("What is the leave policy?")


def test_chat_endpoint_returns_success_payload(monkeypatch):
    class FakeChatService:
        async def chat(self, question):
            return {
                "answer": "Employees receive 20 annual paid leaves.",
                "sources": [{"filename": "Employee Handbook.pdf", "chunk_number": 3}],
                "metadata": {"chunks_used": 5, "model": "gemma-4-31b", "provider": "Gemini"},
            }

    monkeypatch.setattr("app.api.chat.ChatService", lambda: FakeChatService())

    client = TestClient(app)
    response = client.post("/chat", json={"message": "What is the leave policy?"})

    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["answer"] == "Employees receive 20 annual paid leaves."
    assert response.json()["metadata"]["provider"] == "Gemini"


def test_chat_endpoint_rejects_empty_message():
    client = TestClient(app)
    response = client.post("/chat", json={"message": "   "})

    assert response.status_code == 400
    assert response.json() == {"success": False, "message": "Message cannot be empty."}


def test_chat_endpoint_returns_no_knowledge_found(monkeypatch):
    class FakeChatService:
        async def chat(self, question):
            raise LookupError("No relevant knowledge found.")

    monkeypatch.setattr("app.api.chat.ChatService", lambda: FakeChatService())

    client = TestClient(app)
    response = client.post("/chat", json={"message": "What is the leave policy?"})

    assert response.status_code == 200
    assert response.json() == {"success": False, "message": "No relevant knowledge found."}


def test_chat_endpoint_returns_404_for_empty_knowledge_base(monkeypatch):
    class FakeChatService:
        async def chat(self, question):
            raise ValueError("Empty database")

    monkeypatch.setattr("app.api.chat.ChatService", lambda: FakeChatService())

    client = TestClient(app)
    response = client.post("/chat", json={"message": "What is the leave policy?"})

    assert response.status_code == 404
    assert response.json() == {"success": False, "message": "Empty database"}


def test_chat_endpoint_returns_500_when_no_providers_are_available(monkeypatch):
    class FakeChatService:
        async def chat(self, question):
            raise ValueError("No providers available")

    monkeypatch.setattr("app.api.chat.ChatService", lambda: FakeChatService())

    client = TestClient(app)
    response = client.post("/chat", json={"message": "What is the leave policy?"})

    assert response.status_code == 500
    assert response.json() == {"success": False, "message": "No providers available"}
