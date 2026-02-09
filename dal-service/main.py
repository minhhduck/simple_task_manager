from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import models
from database import get_db, engine, Base

app = FastAPI()

# Pydantic models
class TaskCreate(BaseModel):
    title: str

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    is_completed: Optional[bool] = None

class TaskResponse(BaseModel):
    id: int
    title: str
    is_completed: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Create tables on startup
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/tasks/", response_model=List[TaskResponse])
async def read_tasks(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Task).order_by(models.Task.id))
    return result.scalars().all()

@app.post("/tasks/", response_model=TaskResponse)
async def create_task(task: TaskCreate, db: AsyncSession = Depends(get_db)):
    new_task = models.Task(title=task.title)
    db.add(new_task)
    await db.commit()
    await db.refresh(new_task)
    return new_task

@app.patch("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(task_id: int, task_update: TaskUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Task).filter(models.Task.id == task_id))
    task = result.scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task_update.title is not None:
        task.title = task_update.title
    if task_update.is_completed is not None:
        task.is_completed = task_update.is_completed
    
    await db.commit()
    await db.refresh(task)
    return task
