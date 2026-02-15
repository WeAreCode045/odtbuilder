from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from odf.opendocument import OpenDocumentText
from odf.text import P, H
from odf.style import Style, TextProperties
import io
import json
import traceback

app = FastAPI()

# --- CORS CONFIGURATIE ---
origins = [
    "http://localhost:3005",
    "http://localhost:5173",
    "https://odtbuilder.code045.nl",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Serve built frontend (app/public) if available ---
root_dir = Path(__file__).resolve().parents[2]
public_dir = root_dir / "app" / "public"
if public_dir.exists():
    app.mount("/", StaticFiles(directory=str(public_dir), html=True), name="frontend")
else:
    print(f"Warning: frontend build not found at {public_dir}. Run `npm run build` in the app folder.")

@app.post("/generate-odt")
async def generate_odt(payload: dict):
    try:
        # De data die Craft.js verstuurt via query.serialize()
        craft_data = payload.get("data", {})
        
        doc = OpenDocumentText()

        # Eenvoudige mapping van Craft.js nodes naar ODT
        for node_id, node in craft_data.items():
            # Haal de naam van het component op
            component_name = node.get("type", {}).get("resolvedName")
            props = node.get("props", {})

            if component_name == "Titel":
                # Voeg een kop toe
                doc.text.addElement(H(outlinelevel=1, text=props.get("text", "Nieuwe Titel")))
            
            elif component_name == "Tekst":
                # Voeg een paragraaf toe
                doc.text.addElement(P(text=props.get("text", "")))
            
            elif component_name == "GastInformatie":
                # Verander 'veldtype' naar 'field' zodat het matcht met je React code
                veld = props.get("field", "firstname")
                placeholder = f"$guest.{veld}"
                doc.text.addElement(P(text=placeholder))

        # Schrijf het document naar een buffer (geheugen)
        buffer = io.BytesIO()
        doc.save(buffer)
        buffer.seek(0)

        return StreamingResponse(
            buffer,
            media_type="application/vnd.oasis.opendocument.text",
            headers={"Content-Disposition": "attachment; filename=document.odt"}
        )

    except Exception as e:
        print("Error while generating ODT:")
        traceback.print_exc()
        try:
            print("Payload dump:", json.dumps(payload))
        except Exception:
            print("Could not JSON-dump payload")
        raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)