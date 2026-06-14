from fastapi import APIRouter

from app.api.v1.admin import router as admin_router
from app.api.v1.auth import router as auth_router
from app.api.v1.finance import router as finance_router
from app.api.v1.homework import router as homework_router
from app.api.v1.files import router as files_router
from app.api.v1.lessons import router as lessons_router
from app.api.v1.portal import router as portal_router
from app.api.v1.students import router as students_router
from app.api.v1.users import router as users_router

v1_router = APIRouter(prefix="/api/v1")


@v1_router.get("/health")
async def v1_health():
    return {"status": "ok", "version": "v1"}


v1_router.include_router(auth_router)
v1_router.include_router(users_router)
v1_router.include_router(finance_router, prefix="/finance")
v1_router.include_router(students_router, prefix="/students", tags=["Students"])
v1_router.include_router(lessons_router, prefix="/lessons", tags=["Lessons"])
v1_router.include_router(homework_router, prefix="/homework", tags=["Homework"])
v1_router.include_router(files_router, prefix="/files", tags=["Files"])
v1_router.include_router(portal_router, prefix="/portal", tags=["Student Portal"])
v1_router.include_router(admin_router, prefix="/admin", tags=["Admin"])
