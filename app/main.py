from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import auth, users, appointments
from app.models import user, appointment  # noqa: F401 - needed for table creation

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

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(appointments.router)


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "TeleClinic API", "version": "1.0.0"}
