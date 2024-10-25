from fastapi import FastAPI, WebSocket
from term_matcher import load_term_to_code, match_terms_variable_names
from pathlib import Path
from typing import Optional

from pydantic import BaseModel


# Create FastAPI instance with custom docs and openapi url
app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")
# app.add_middleware(
#     CORSMiddleware,
#     # Adjust this to specify allowed origins
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["POST"],
#     allow_headers=["*"],
# )

# Define the Pydantic model for the input data


class TextToMatchRequest(BaseModel):
    text_to_match: str
    threshold: Optional[int] = 60


# Assuming your project home is 'IDEA4RC-NQUI', and this script is in a subfolder
# Adjust based on your file's location
project_home = Path(__file__).resolve().parent
relative_path = project_home / "code_to_term_variable.json"

# Convert to string if necessary
term_to_code_path = str(relative_path)

# term_to_code_path = r"C:\Users\unaiz\Documents\IDEA4RC-NQUI\IDEA4RC-term\dictionaries\code_to_term_variable.json"

# Load term-to-code mappings
# if working with term to code
term_to_code = load_term_to_code(term_to_code_path)


@app.post("/api/py/match_terms")
def api_match_terms(request: TextToMatchRequest):

    matched_json = match_terms_variable_names(
        request.text_to_match, term_to_code, threshold=request.threshold
    )
    matched_json.pop("")
    return matched_json


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        matched_json = match_terms_variable_names(
            data, term_to_code, threshold=50)

        await websocket.send_json(matched_json)
