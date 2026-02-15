from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from odf.opendocument import OpenDocumentText
from odf.text import P, H
from odf.style import Style, TextProperties
import io
import json

app = FastAPI()

# --- CORS CONFIGURATIE ---
# Hersteld: Afsluitend aanhalingsteken toegevoegd en poorten uitgebreid
origins = [
    "http://localhost:3010",
    "http://localhost:3011",
    "https://docubuild-a4-889067085922.us-west1.run.app",
    "http://localhost:5173",
    "https://odtbuilder.code045.nl",
    "https://odt-generator.code045.nl",
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
        craft_data = payload.get("data", {})
        
        # Oplossing: Als craft_data per ongeluk als string binnenkomt, zet het om naar dict
        if isinstance(craft_data, str):
            craft_data = json.loads(craft_data)
        
        if not craft_data or not isinstance(craft_data, dict):
            raise HTTPException(status_code=400, detail="Ongeldige data structuur")
            
        doc = OpenDocumentText()
        
        # Nu kun je veilig over de items itereren
        for node_id, node in craft_data.items():
            try:
                component_name = node.get("type", {}).get("resolvedName")
                props = node.get("props", {})

                # Verwerk Titels
                if component_name == "Titel":
                    text_content = props.get("text") or "Titel"
                    doc.text.addElement(H(outlinelevel=1, text=str(text_content)))
                
                # Verwerk Tekstblokken
                elif component_name == "Tekst":
                    text_content = props.get("text") or ""
                    doc.text.addElement(P(text=str(text_content)))
                
                # Verwerk Gast Informatie
                elif component_name == "GastInformatie":
                    veld = props.get("field", "firstname")
                    placeholder = f"$guest.{veld}"
                    doc.text.addElement(P(text=placeholder))
            except Exception as node_err:
                print(f"Error processing node {node_id} ({component_name}): {node_err}")
                continue # Ga door met de rest van het document

        # Schrijf het resultaat naar een buffer in het geheugen
        buffer = io.BytesIO()
        doc.save(buffer)
        buffer.seek(0)

        return StreamingResponse(
            buffer,
            media_type="application/vnd.oasis.opendocument.text",
            headers={
                "Content-Disposition": "attachment; filename=document.odt",
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )

    except Exception as e:
        # Log de fout op de server voor debugging
        print(f"Server Error tijdens ODT generatie: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Poort 80 voor Easypanel/Docker
    uvicorn.run(app, host="0.0.0.0", port=80)