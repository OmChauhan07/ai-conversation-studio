"""
SQLAlchemy ORM models mirroring the Prisma schema on Neon PostgreSQL.

Table/column names use the exact same casing that Prisma generated in the
database so we can read/write the same tables the backend-auth service uses.
"""

import enum

from sqlalchemy import (
    Column,
    String,
    Boolean,
    Integer,
    DateTime,
    Text,
    Enum,
    ForeignKey,
    Index,
    JSON,
    func,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


# ── Enums ───────────────────────────────────────────────────────────────

class Role(str, enum.Enum):
    ADMIN = "ADMIN"
    USER = "USER"


class MessageRole(str, enum.Enum):
    USER = "USER"
    ASSISTANT = "ASSISTANT"


class DocumentStatus(str, enum.Enum):
    PROCESSING = "PROCESSING"
    PROCESSED = "PROCESSED"
    FAILED = "FAILED"


# ── User ────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "User"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=True)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(Enum(Role, name="Role", create_type=False), default=Role.USER, nullable=False)

    isVerified = Column(Boolean, default=False, nullable=False)

    otp = Column(String, nullable=True)
    otpExpiresAt = Column(DateTime(timezone=True), nullable=True)

    resetOtp = Column(String, nullable=True)
    resetOtpExpiresAt = Column(DateTime(timezone=True), nullable=True)

    createdAt = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("UploadedDocument", back_populates="user", cascade="all, delete-orphan")
    prompts = relationship("Prompt", back_populates="user", cascade="all, delete-orphan")

    __table_args__ = (
        Index("User_email_idx", "email"),
    )


# ── Conversation ────────────────────────────────────────────────────────

class Conversation(Base):
    __tablename__ = "Conversation"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=True)
    userId = Column(String, ForeignKey("User.id", ondelete="CASCADE"), nullable=False)

    createdAt = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedAt = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")
    documents = relationship("UploadedDocument", back_populates="conversation")
    promptRuns = relationship("PromptRun", back_populates="conversation")

    __table_args__ = (
        Index("Conversation_userId_idx", "userId"),
    )


# ── Message ─────────────────────────────────────────────────────────────

class Message(Base):
    __tablename__ = "Message"

    id = Column(String, primary_key=True)
    conversationId = Column(String, ForeignKey("Conversation.id", ondelete="CASCADE"), nullable=False)

    role = Column(Enum(MessageRole, name="MessageRole", create_type=False), nullable=False)

    content = Column(Text, nullable=False)

    provider = Column(String, nullable=True)
    model = Column(String, nullable=True)

    sources = Column(JSON, nullable=True)

    createdAt = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")

    __table_args__ = (
        Index("Message_conversationId_idx", "conversationId"),
    )


# ── UploadedDocument ────────────────────────────────────────────────────

class UploadedDocument(Base):
    __tablename__ = "UploadedDocument"

    id = Column(String, primary_key=True)
    userId = Column(String, ForeignKey("User.id", ondelete="CASCADE"), nullable=False)
    conversationId = Column(String, ForeignKey("Conversation.id"), nullable=True)

    filename = Column(String, unique=True, nullable=False)
    originalName = Column(String, nullable=False)
    fileSize = Column(Integer, nullable=False)
    pages = Column(Integer, nullable=False)
    chunks = Column(Integer, nullable=False)

    uploadedAt = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    status = Column(
        Enum(DocumentStatus, name="DocumentStatus", create_type=False),
        default=DocumentStatus.PROCESSED,
        nullable=False,
    )

    # Relationships
    user = relationship("User", back_populates="documents")
    conversation = relationship("Conversation", back_populates="documents")

    __table_args__ = (
        Index("UploadedDocument_userId_idx", "userId"),
        Index("UploadedDocument_conversationId_idx", "conversationId"),
    )


# ── Prompt ──────────────────────────────────────────────────────────────

class Prompt(Base):
    __tablename__ = "Prompt"

    id = Column(String, primary_key=True)
    userId = Column(String, ForeignKey("User.id", ondelete="CASCADE"), nullable=False)

    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)

    isFavorite = Column(Boolean, default=False, nullable=False)

    createdAt = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedAt = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="prompts")
    runs = relationship("PromptRun", back_populates="prompt", cascade="all, delete-orphan")

    __table_args__ = (
        Index("Prompt_userId_idx", "userId"),
    )


# ── PromptRun ───────────────────────────────────────────────────────────

class PromptRun(Base):
    __tablename__ = "PromptRun"

    id = Column(String, primary_key=True)
    promptId = Column(String, ForeignKey("Prompt.id", ondelete="CASCADE"), nullable=False)
    conversationId = Column(String, ForeignKey("Conversation.id"), nullable=True)

    provider = Column(String, nullable=False)
    model = Column(String, nullable=False)

    executionTime = Column(Integer, nullable=True)

    createdAt = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    prompt = relationship("Prompt", back_populates="runs")
    conversation = relationship("Conversation", back_populates="promptRuns")

    __table_args__ = (
        Index("PromptRun_promptId_idx", "promptId"),
        Index("PromptRun_conversationId_idx", "conversationId"),
    )
