import enum
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from app.core.database import Base

class DocumentStatus(enum.Enum):
    PENDING = "PENDING"
    PROCESSED = "PROCESSED"
    ERROR = "ERROR"

class MessageRole(enum.Enum):
    USER = "USER"
    ASSISTANT = "ASSISTANT"
    SYSTEM = "SYSTEM"

class UserRole(enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"

class User(Base):
    __tablename__ = "User"
    id = Column(String, primary_key=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(Enum(UserRole, name="Role", create_type=False), default=UserRole.USER)
    isVerified = Column(Boolean, default=False)
    otp = Column(String, nullable=True)
    otpExpiresAt = Column(DateTime, nullable=True)
    resetOtp = Column(String, nullable=True)
    resetOtpExpiresAt = Column(DateTime, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Conversation(Base):
    __tablename__ = "Conversation"
    id = Column(String, primary_key=True)
    userId = Column(String, ForeignKey("User.id"))
    title = Column(String)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships (Optional but helpful)
    messages = relationship("Message", back_populates="conversation")

class Message(Base):
    __tablename__ = "Message"
    id = Column(String, primary_key=True)
    conversationId = Column(String, ForeignKey("Conversation.id"))
    role = Column(Enum(MessageRole, name="messagerole", create_type=True))
    content = Column(Text)
    provider = Column(String, nullable=True)
    model = Column(String, nullable=True)
    sources = Column(JSON, nullable=True) # or JSONB if strictly Postgres
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")

class UploadedDocument(Base):
    __tablename__ = "UploadedDocument"
    id = Column(String, primary_key=True)
    userId = Column(String, ForeignKey("User.id"))
    filename = Column(String)
    originalName = Column(String)
    fileSize = Column(Integer)
    pages = Column(Integer, nullable=True)
    chunks = Column(Integer, nullable=True)
    status = Column(Enum(DocumentStatus, name="documentstatus", create_type=True), default=DocumentStatus.PENDING)
    uploadedAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Prompt(Base):
    __tablename__ = "Prompt"
    id = Column(String, primary_key=True)
    userId = Column(String, ForeignKey("User.id"))
    name = Column(String)
    description = Column(String, nullable=True)
    content = Column(Text)
    isFavorite = Column(Boolean, default=False)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class PromptRun(Base):
    __tablename__ = "PromptRun"
    id = Column(String, primary_key=True)
    promptId = Column(String, ForeignKey("Prompt.id"))
    result = Column(Text)
    model = Column(String)
    provider = Column(String)
    createdAt = Column(DateTime, default=datetime.utcnow)

