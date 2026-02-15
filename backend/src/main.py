from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from odf.opendocument import OpenDocumentText
from odf.text import P
import io
from fastapi.responses import StreamingResponse

app = FastAPI()

# Het endpoint voor je React app
@app.post("/generate-odt")
async def generate_odt(craft_data: dict):
    try:
        doc = OpenDocumentText()
        
        # Craft.js query.serialize() geeft een dictionary van nodes
        for node_id, node in craft_data.items():
            node_type = node.get("type", {}).get("resolvedName")
            props = node.get("props", {})

            if node_type == "Tekst":
                doc.text.addElement(P(text=props.get("text", "")))
            
            elif node_type == "GastInformatie":
                veld = props.get("veldtype", "firstname")
                # De output die in de ODT komt
                doc.text.addElement(P(text=f"$guest.{veld}"))

        # Maak het bestand in het geheugen
        buffer = io.BytesIO()
        doc.save(buffer)
        buffer.seek(0)

        return StreamingResponse(
            buffer,
            media_type="application/vnd.oasis.opendocument.text",
            headers={"Content-Disposition": "attachment; filename=document.odt"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))