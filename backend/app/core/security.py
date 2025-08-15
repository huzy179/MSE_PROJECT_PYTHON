from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

# Centralized HTTPBearer scheme for the entire application
security = HTTPBearer()
