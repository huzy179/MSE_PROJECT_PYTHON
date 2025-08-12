from docx import Document
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy import create_engine, select
from ..core.config import settings

from backend.app.models.question import Question

# read data from .docx file with provided file path
def reading_file(file_path):
    doc = Document(file_path)
    list_quest = []
    subject = ''
    lecturer = ''
    for para in doc.paragraphs:
        text = para.text.strip()
        if text.startswith("Subject:"):
            subject = text.split()[1]
        if text.startswith("Lecturer:"):
            lecturer = text.split()[1]
    print(subject, lecturer)

    for table_idx, table in enumerate(doc.tables):
        print(f"Table {table_idx + 1}")
        item = {}
        for row in table.rows:

            if row.cells[0].text.strip().startswith("QN="):
                item["code"] = row.cells[0].text.strip()
                item['content'] = row.cells[1].text.strip()

            if row.cells[0].text.strip().startswith("a."):
                item["choiceA"] = row.cells[1].text.strip()

            if row.cells[0].text.strip().startswith("b."):
                item["choiceB"] = row.cells[1].text.strip()

            if row.cells[0].text.strip().startswith("c."):
                item["choiceC"] = row.cells[1].text.strip()

            if row.cells[0].text.strip().startswith("d."):
                item["choiceD"] = row.cells[1].text.strip()

            if row.cells[0].text.strip().startswith("ANSWER"):
                item["answer"] = row.cells[1].text.strip()

            if row.cells[0].text.strip().startswith("MARK"):
                item["mark"] = float(row.cells[1].text.strip())

            if row.cells[0].text.strip().startswith("UNIT"):
                item["unit"] = row.cells[1].text.strip()

            if row.cells[0].text.strip().startswith("MIX"):
                if row.cells[1].text.strip() == 'Yes':
                    item["mix"] = True
                else:
                    item["mix"] = False

            item['subject'] = subject
            item['lecturer'] = lecturer

        list_quest.append(item)

    return list_quest

# Todo: save data to the database
def import_data(list_data):
    # Create session
    engine = create_engine(settings.DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()

    questions = []
    # bind data
    for item in list_data:
        question = Question(code=item['code'],
                            content=item['content'],
                            choiceA=item['choiceA'],
                            choiceB=item['choiceB'],
                            choiceC=item['choiceC'],
                            choiceD=item['choiceD'],
                            answer=item['answer'],
                            mark=item['mark'],
                            unit=item['unit'],
                            subject=item['subject'],
                            lecturer=item['lecturer'],
                            mix=item['mix'])
        questions.append(question)

    # add item into database
    session.add_all(questions)
    session.commit()

    print("Import data successfully")

def get_question(skip: int = 0, limit: int = 100):
    # Create session
    engine = create_engine(settings.DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    stmt = select(Question)
    stmt = stmt.offset(skip).limit(limit)
    return session.execute(stmt).scalars().all()
