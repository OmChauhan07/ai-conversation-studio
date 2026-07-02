import os
import jwt
from fastapi import Request, HTTPException
from typing import Optional

JWT_SECRET = os.getenv("JWT_SECRET", "This_is_a_Testing_Auth_System")

def get_current_user_id(request: Request) -> str:
    """
    Extracts the user ID from the Authorization Bearer JWT token.
    If valid, returns the user ID (str). 
    Raises HTTPException if missing or invalid.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    
    token = auth_header.split(" ")[1]
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload: missing id")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
