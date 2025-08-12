import tempfile

from fastapi import APIRouter, UploadFile, File, Depends

from backend.app.db import get_db
from backend.app.reading import reading

router = APIRouter(prefix="/questions", tags=["questions"])

@router.get("/import_file")
def test_get():
    return {"message": "Test OK"}

@router.post("/import_file")
async def read_docx(file: UploadFile = File(...)):

    # Create temporary file to upload
    contents = await file.read()
    with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as tmp:
        tmp.write(contents)
        tmp_path = tmp.name

    # Read content file .docx using python-docx
    listQuest = reading.reading_file(tmp_path)

    reading.import_data(listQuest)

    return listQuest

@router.get("/list")
def get_list_quest():
    return reading.get_question()