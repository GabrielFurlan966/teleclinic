from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.database import Base, engine
from app.routers import auth, users, appointments
from app.models import user, appointment  # noqa: F401
from app.core.redis import get_redis

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TeleClinic API",
    description=(
        "A telemedicine REST API built with FastAPI. "
        "Supports patient and doctor management, JWT authentication, "
        "and appointment scheduling."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    redis = get_redis()
    client_ip = request.client.host
    key = f"rate_limit:{client_ip}"

    current = redis.incr(key)
    if current == 1:
        redis.expire(key, 60)

    if current > 60:
        return JSONResponse(
            status_code=429,
            content={"detail": "Too many requests. Try again in a minute."}
        )

    response = await call_next(request)
    return response


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(appointments.router)


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "TeleClinic API", "version": "1.0.0"}