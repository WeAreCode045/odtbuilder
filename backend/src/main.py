from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from odf.opendocument import OpenDocumentText
from odf.text import P, H
from odf.style import Style, TextProperties
import io

app = FastAPI()

# --- CORS CONFIGURATIE ---
origins = [
    "http://localhost:3000",        # Vite standaard poort (zie je vite.config.ts)
    "http://localhost:5173",        # Alternatieve Vite poort
    "https://odtbuilder.code045.nl", # Jouw live frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)