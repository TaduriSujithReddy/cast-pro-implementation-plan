from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base
from .routes import auth_routes, vendor_routes, product_routes, bill_routes, alert_routes, settings_routes, forecast_routes

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CastPro API", version="1.0.0")

# CORS — allow the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all routers under /api
app.include_router(auth_routes.router, prefix="/api")
app.include_router(vendor_routes.router, prefix="/api")
app.include_router(product_routes.router, prefix="/api")
app.include_router(bill_routes.router, prefix="/api")
app.include_router(alert_routes.router, prefix="/api")
app.include_router(settings_routes.router, prefix="/api")
app.include_router(forecast_routes.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "CastPro API"}
