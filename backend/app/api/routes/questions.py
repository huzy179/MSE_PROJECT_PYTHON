import tempfile

from fastapi import APIRouter, Depends, File, UploadFile

from ...db.database import get_db
from ...services.question_service import reading_file, import_data, get_question

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
    listQuest = reading_file(tmp_path)

    result = import_data(listQuest)

    if len(listQuest) == 0:
        return {
            "code": 201,
            "message": "Không có dữ liệu hợp lệ để import. Vui lòng kiểm tra lại file và cấu trúc file .docx bạn vừa nhập.",
        }
    elif result["code"] != 200:
        return result
    return {"code": 200, "message": "Successful!", "data": listQuest}


@router.get("/list")
def get_list_quest():
    return get_question()
