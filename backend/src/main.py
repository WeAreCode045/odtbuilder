from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from odf.opendocument import OpenDocumentText
from odf.style import Style, TextProperties, ParagraphProperties, TableColumnProperties, TableCellProperties, TableProperties, TableRowProperties, PageLayout, PageLayoutProperties, MasterPage
from odf.text import P, H
from odf.table import Table, TableColumn, TableRow, TableCell
import io
import json

app = FastAPI()

# --- CORS CONFIGURATIE ---
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

def setup_page_layout(doc):
    """
    Define A4 Page Layout with standard margins to match frontend (20mm).
    """
    pl = PageLayout(name="A4Layout")
    pl.addElement(PageLayoutProperties(
        margin="2cm", 
        pagewidth="21cm", 
        pageheight="29.7cm", 
        printorientation="portrait"
    ))
    doc.automaticstyles.addElement(pl)
    
    mp = MasterPage(name="Standard", pagelayoutname=pl)
    doc.masterstyles.addElement(mp)

def add_style(doc, name, family, text_props=None, paragraph_props=None, table_col_props=None, table_cell_props=None, table_props=None, table_row_props=None):
    """
    Helper function to create and register an ODF style.
    """
    style = Style(name=name, family=family)
    if text_props:
        style.addElement(TextProperties(**text_props))
    if paragraph_props:
        style.addElement(ParagraphProperties(**paragraph_props))
    if table_col_props:
        style.addElement(TableColumnProperties(**table_col_props))
    if table_cell_props:
        style.addElement(TableCellProperties(**table_cell_props))
    if table_props:
        style.addElement(TableProperties(**table_props))
    if table_row_props:
        style.addElement(TableRowProperties(**table_row_props))
    
    doc.automaticstyles.addElement(style)
    return name

def px_to_pt(px_val):
    """Convert screen pixels (approx 96dpi) to points (72dpi)."""
    try:
        return float(px_val) * 0.75
    except (ValueError, TypeError):
        return 12.0 # default fallback

def clean_font_family(font_str):
    """Extract primary font family from CSS string."""
    if not font_str or font_str == 'inherit':
        return "Arial"
    # Take first font, remove quotes
    return font_str.split(',')[0].replace('"', '').replace("'", "").strip()

def process_node(node_id, craft_data, parent_element, doc):
    """
    Recursively processes a node, creates necessary styles, and appends ODF elements.
    """
    node = craft_data.get(node_id)
    if not node:
        return

    node_type = node.get("type", {})
    resolved_name = node_type.get("resolvedName") if isinstance(node_type, dict) else str(node_type)
    props = node.get("props", {})
    children_ids = node.get("nodes", [])

    if resolved_name in ["Document", "Page", "div", "Canvas"]:
        for child_id in children_ids:
            process_node(child_id, craft_data, parent_element, doc)
        return

    style_name = f"Style_{node_id}"

    # --- TITEL (Header) ---
    if resolved_name == "Titel":
        font_size_px = props.get("fontSize", 26)
        font_size_pt = px_to_pt(font_size_px)
        
        color = props.get("color", "#000000")
        align = props.get("textAlign", "left")
        weight = props.get("fontWeight", "bold")
        family = clean_font_family(props.get("fontFamily", "Arial"))

        text_props = {
            "fontsize": f"{font_size_pt}pt",
            "color": color,
            "fontweight": weight,
            "fontfamily": family,
            "fontname": family 
        }
        para_props = {
            "textalign": align,
            "marginbottom": "0.2cm"
        }
        
        add_style(doc, style_name, "paragraph", text_props=text_props, paragraph_props=para_props)
        
        h = H(outlinelevel=1, stylename=style_name)
        h.addText(str(props.get("text", "Titel")))
        parent_element.addElement(h)

    # --- TEKST (Paragraph) ---
    elif resolved_name == "Tekst":
        font_size_px = props.get("fontSize", 14)
        font_size_pt = px_to_pt(font_size_px)
        
        color = props.get("color", "#000000")
        align = props.get("textAlign", "left")
        weight = props.get("fontWeight", "normal")
        family = clean_font_family(props.get("fontFamily", "Arial"))
        
        text_props = {
            "fontsize": f"{font_size_pt}pt",
            "color": color,
            "fontweight": weight,
            "fontfamily": family,
            "fontname": family 
        }
        para_props = {
            "textalign": align,
            "marginbottom": "0.2cm",
            "lineheight": "115%" # 1.15 is standard web/doc spacing
        }
        
        add_style(doc, style_name, "paragraph", text_props=text_props, paragraph_props=para_props)
        
        p = P(stylename=style_name)
        p.addText(str(props.get("text", "")))
        parent_element.addElement(p)

    # --- GAST INFORMATIE ---
    elif resolved_name == "GastInformatie":
        field = props.get("field", "firstname")
        text = f"{{{{ $guest.{field} }}}}"
        
        add_style(doc, style_name, "paragraph", paragraph_props={"marginbottom": "0.2cm"})
        p = P(stylename=style_name)
        p.addText(text)
        parent_element.addElement(p)

    # --- AFBEELDING ---
    elif resolved_name == "Afbeelding":
        add_style(doc, style_name, "paragraph", paragraph_props={"textalign": "center", "marginbottom": "0.5cm"})
        p = P(stylename=style_name)
        p.addText("[AFBEELDING]")
        parent_element.addElement(p)

    # --- ROW (Table) ---
    elif resolved_name == "Row":
        my = props.get("my", 2)
        margin_cm = f"{my * 0.1}cm"
        
        # Table props: width matches printable area (21cm - 2*2cm margins = 17cm)
        table_props = {
            "margintop": margin_cm,
            "marginbottom": margin_cm,
            "width": "17cm",
            "align": "center" # Centers the table itself
        }
        
        add_style(doc, style_name, "table", table_props=table_props)
        table = Table(stylename=style_name)

        # Identify Column children
        columns = []
        for cid in children_ids:
            cnode = craft_data.get(cid)
            if cnode and cnode.get("type", {}).get("resolvedName") == "Column":
                columns.append(cnode)
        
        if not columns:
            return

        # Create Column Styles (Widths)
        for i, col in enumerate(columns):
            col_width = col.get("props", {}).get("width", "auto")
            col_style_name = f"{style_name}_col_{i}"
            
            tcp = {}
            if col_width != "auto" and "%" in col_width:
                try:
                    pct = float(col_width.replace("%", ""))
                    width_cm = (pct / 100) * 17.0
                    tcp["columnwidth"] = f"{width_cm}cm"
                except:
                    tcp["relcolumnwidth"] = "1*" # Fallback
            else:
                 # Distribute 'auto' columns equally or take remaining
                 tcp["relcolumnwidth"] = "1*"
            
            add_style(doc, col_style_name, "table-column", table_col_props=tcp)
            table.addElement(TableColumn(stylename=col_style_name))

        # Create Row (with Min Height style)
        row_style_name = f"{style_name}_row"
        # Match frontend min-h-[50px] approx 1.3cm
        add_style(doc, row_style_name, "table-row", table_row_props={"minrowheight": "1.32cm"})
        
        tr = TableRow(stylename=row_style_name)
        
        for i, col in enumerate(columns):
            padding = col.get("props", {}).get("padding", 8)
            # Convert padding to cm (approx)
            padding_cm = f"{padding * 0.026}cm" # 1px approx 0.026cm
            
            cell_style_name = f"{style_name}_cell_{i}"
            
            cell_props = {
                "padding": padding_cm,
                "border": "none",
                "verticalalign": "top"
            }
            add_style(doc, cell_style_name, "table-cell", table_cell_props=cell_props)
            
            cell = TableCell(stylename=cell_style_name)
            
            col_children = col.get("nodes", [])
            for child_id in col_children:
                process_node(child_id, craft_data, cell, doc)
            
            if not cell.hasChildNodes():
                cell.addElement(P())

            tr.addElement(cell)
        
        table.addElement(tr)
        parent_element.addElement(table)

    elif resolved_name == "Column":
        # Fallback for columns not in row
        for child_id in children_ids:
            process_node(child_id, craft_data, parent_element, doc)
    
    else:
        for child_id in children_ids:
            process_node(child_id, craft_data, parent_element, doc)


@app.post("/generate-odt")
async def generate_odt(payload: dict):
    try:
        craft_data = payload.get("data", {})
        
        if isinstance(craft_data, str):
            craft_data = json.loads(craft_data)
        
        if not craft_data or not isinstance(craft_data, dict):
            raise HTTPException(status_code=400, detail="Ongeldige data structuur")
            
        doc = OpenDocumentText()
        setup_page_layout(doc)
        
        if "ROOT" in craft_data:
            process_node("ROOT", craft_data, doc.text, doc)
        
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
        print(f"Server Error tijdens ODT generatie: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=80)
