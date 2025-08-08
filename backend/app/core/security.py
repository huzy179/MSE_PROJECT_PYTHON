from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Centralized HTTPBearer scheme for the entire application
security = HTTPBearer()