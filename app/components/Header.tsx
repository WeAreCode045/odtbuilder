import React, { useRef, useState } from 'react';
import { useEditor } from '@craftjs/core';
import { Download, FileText, Upload, Loader2 } from 'lucide-react';
import JSZip from 'jszip';

export const Header: React.FC = () => {
  const { query, actions } = useEditor();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    setIsLoading(true);
    try {
      // 1. Serialize de huidige Craft.js staat naar een JSON-object
      const json = query.serialize();
      
      // 2. Bepaal de backend URL op basis van de huidige omgeving
      const isLocal = window.location.hostname === 'localhost';
      const BACKEND_URL = isLocal 
        ? "http://localhost:8000/generate-odt" 
        : "https://odt-generator.code045.nl/generate-odt";

      // 3. Verstuur de data naar de Python backend
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          // Zorg dat we een object sturen en geen dubbel-geserialiseerde string
          data: typeof json === 'string' ? JSON.parse(json) : json 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Export mislukt");
      }

      // 4. Ontvang het ODT bestand als een blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // 5. Forceer een download in de browser
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'document.odt');
      document.body.appendChild(link);
      link.click();
      
      // Ruim de tijdelijke URL en het element op
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Fout bij exporteren:", error);
      alert(`Er is een fout opgetreden: ${error instanceof Error ? error.message : 'Onbekende fout'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const generateId = () => {
    return 'node-' + Math.random().toString(36).substr(2, 9);
  };

  const convertToPx = (value: string | null): number | undefined => {
    if (!value) return undefined;
    const match = value.match(/([\d\.]+)(\w+|%)?/);
    if (!match) return undefined;
    const val = parseFloat(match[1]);
    const unit = match[2];
    switch (unit) {
        case 'in': return Math.round(val * 96);
        case 'cm': return Math.round(val * 37.8);
        case 'mm': return Math.round(val * 3.78);
        case 'pt': return Math.round(val * 1.33);
        case 'px': return Math.round(val);
        default: return Math.round(val);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const zip = await JSZip.loadAsync(file);
      const contentXml = await zip.file("content.xml")?.async("string");

      if (!contentXml) {
        throw new Error("Ongeldig ODT bestand: content.xml ontbreekt");
      }

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(contentXml, "text/xml");
      const officeText = xmlDoc.getElementsByTagName("office:text")[0];

      if (!officeText) {
         throw new Error("Geen tekst gevonden in document");
      }

      // Parse styles
      const styles: Record<string, any> = {};
      const automaticStyles = xmlDoc.getElementsByTagName("office:automatic-styles")[0];
      
      if (automaticStyles) {
        Array.from(automaticStyles.getElementsByTagName("style:style")).forEach((styleNode) => {
            const name = styleNode.getAttribute("style:name");
            if (!name) return;
            
            const textProps = styleNode.getElementsByTagName("style:text-properties")[0];
            const paraProps = styleNode.getElementsByTagName("style:paragraph-properties")[0];
            const cellProps = styleNode.getElementsByTagName("style:table-cell-properties")[0];
            
            const styleData: any = {};
            
            if (textProps) {
                const color = textProps.getAttribute("fo:color");
                if (color) styleData.color = color;
                
                const fontSize = textProps.getAttribute("fo:font-size");
                if (fontSize) {
                    const px = convertToPx(fontSize);
                    if (px) styleData.fontSize = px;
                }

                // Parse Font Family
                const fontFamily = textProps.getAttribute("fo:font-family") || textProps.getAttribute("style:font-name");
                if (fontFamily) {
                    // Remove quotes if present
                    styleData.fontFamily = fontFamily.replace(/['"]/g, "");
                }

                // Parse Font Weight
                const fontWeight = textProps.getAttribute("fo:font-weight");
                if (fontWeight) styleData.fontWeight = fontWeight;
            }
            
            if (paraProps) {
                const align = paraProps.getAttribute("fo:text-align");
                if (align) {
                     if (['center', 'right', 'justify'].includes(align)) {
                         styleData.textAlign = align;
                     } else if (align === 'end') {
                         styleData.textAlign = 'right';
                     } else if (align === 'start') {
                         styleData.textAlign = 'left';
                     } else {
                         styleData.textAlign = 'left';
                     }
                }
            }

            if (cellProps) {
                const padding = cellProps.getAttribute("fo:padding");
                if (padding) {
                    const px = convertToPx(padding);
                    if (px !== undefined) styleData.padding = px;
                }
            }
            
            styles[name] = styleData;
        });
      }

      // Start building Craft.js nodes
      const rootId = "ROOT";
      const pageId = generateId();
      
      const newNodes: any = {
        [rootId]: {
          type: { resolvedName: "Document" },
          isCanvas: true,
          props: {},
          displayName: "Document",
          custom: {},
          hidden: false,
          nodes: [pageId],
          linkedNodes: {},
        },
        [pageId]: {
          type: { resolvedName: "Page" },
          isCanvas: true,
          props: {},
          displayName: "Pagina",
          custom: {},
          parent: rootId,
          hidden: false,
          nodes: [], 
          linkedNodes: {},
        }
      };

      // Helper for processing images
      const processImage = async (frame: Element, parentId: string) => {
        const image = frame.getElementsByTagName("draw:image")[0];
        if (image) {
            const href = image.getAttribute("xlink:href");
            if (href && zip.file(href)) {
                const base64 = await zip.file(href)?.async("base64");
                // Determine mime type roughly
                const mime = href.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
                const src = `data:${mime};base64,${base64}`;
                
                const imgId = generateId();
                newNodes[imgId] = {
                    type: { resolvedName: "Afbeelding" },
                    isCanvas: false,
                    props: { src, width: "100%" },
                    displayName: "Afbeelding",
                    custom: {},
                    parent: parentId,
                    hidden: false,
                    nodes: [],
                    linkedNodes: {}
                };
                newNodes[parentId].nodes.push(imgId);
            }
        }
      };

      // Recursive function to parse ODT nodes
      const parseNode = async (xmlNode: Element, parentId: string) => {
        const tagName = xmlNode.tagName;
        
        // Handle different style attributes based on tag
        let styleName = xmlNode.getAttribute("text:style-name");
        if (tagName === "table:table-cell") {
            styleName = xmlNode.getAttribute("table:style-name");
        }
        
        const style = styleName ? styles[styleName] || {} : {};

        if (tagName === "text:h") {
            const textContent = xmlNode.textContent?.trim();
            if (textContent) {
                const nodeId = generateId();
                newNodes[nodeId] = {
                    type: { resolvedName: "Titel" },
                    isCanvas: false,
                    props: {
                        text: textContent,
                        fontSize: style.fontSize || 24,
                        color: style.color || "#1a202c",
                        textAlign: style.textAlign || "left",
                        fontFamily: style.fontFamily || "inherit",
                        fontWeight: style.fontWeight || "bold"
                    },
                    displayName: "Titel",
                    custom: {},
                    parent: parentId,
                    hidden: false,
                    nodes: [],
                    linkedNodes: {},
                };
                newNodes[parentId].nodes.push(nodeId);
            }
        } else if (tagName === "text:p") {
             // Iterate children to handle inline images mixed with text
             const childNodes = Array.from(xmlNode.childNodes);
             let currentText = "";

             const flushText = () => {
                 if (currentText.trim()) {
                      const nodeId = generateId();
                      newNodes[nodeId] = {
                        type: { resolvedName: "Tekst" },
                        isCanvas: false,
                        props: { 
                            text: currentText.trim(),
                            fontSize: style.fontSize || 14,
                            color: style.color || "#4a5568",
                            textAlign: style.textAlign || "left",
                            fontFamily: style.fontFamily || "inherit",
                            fontWeight: style.fontWeight || "normal"
                        },
                        displayName: "Tekst",
                        custom: {},
                        parent: parentId,
                        hidden: false,
                        nodes: [],
                        linkedNodes: {},
                      };
                      newNodes[parentId].nodes.push(nodeId);
                 }
                 currentText = "";
             };

             for (const child of childNodes) {
                 if (child.nodeType === 3) { // Text node
                     currentText += child.textContent || "";
                 } else if (child.nodeType === 1) { // Element
                     const el = child as Element;
                     if (el.tagName === "draw:frame") {
                         flushText();
                         await processImage(el, parentId);
                     } else if (el.tagName === "text:s") { // Space
                         const count = parseInt(el.getAttribute("text:c") || "1");
                         currentText += " ".repeat(count);
                     } else if (el.tagName === "text:tab") {
                         currentText += "\t";
                     } else if (el.tagName === "text:span") {
                        // Support for spans that might have different styles (e.g. bold in middle of text)
                        // For now we just append text, but if the whole P has one style it works.
                        // Complex span styling would require splitting Text component into smaller parts or using HTML content.
                        // Currently our Tekst component uses one style for the whole block.
                        currentText += el.textContent || "";
                     } else {
                         currentText += el.textContent || "";
                     }
                 }
             }
             flushText();

        } else if (tagName === "table:table") {
            const rows = Array.from(xmlNode.getElementsByTagName("table:table-row"));
            
            for (const row of rows) {
                const rowId = generateId();
                // We set gap to 0 and margin-y (my) to 0 for imported tables 
                // to mimic standard table layout (no gaps).
                newNodes[rowId] = {
                    type: { resolvedName: "Rij" },
                    isCanvas: true,
                    props: { gap: 0, my: 0 }, 
                    displayName: "Rij",
                    custom: {},
                    parent: parentId,
                    hidden: false,
                    nodes: [],
                    linkedNodes: {}
                };
                newNodes[parentId].nodes.push(rowId);

                const cells = Array.from(row.children).filter(c => c.tagName === "table:table-cell");
                
                for (const cell of cells) {
                    const colId = generateId();
                    
                    // Parse cell specific style
                    const cellStyleName = cell.getAttribute("table:style-name");
                    const cellStyle = cellStyleName ? styles[cellStyleName] || {} : {};
                    
                    newNodes[colId] = {
                        type: { resolvedName: "Kolom" },
                        isCanvas: true,
                        props: { 
                            width: "auto",
                            // Fallback padding to 0 for imports to ensure no unwanted margins inside cells
                            padding: cellStyle.padding !== undefined ? cellStyle.padding : 0 
                        },
                        displayName: "Kolom",
                        custom: {},
                        parent: rowId,
                        hidden: false,
                        nodes: [],
                        linkedNodes: {}
                    };
                    newNodes[rowId].nodes.push(colId);

                    // Process cell content
                    const cellChildren = Array.from(cell.children);
                    for (const child of cellChildren) {
                        await parseNode(child as Element, colId);
                    }
                }
            }
        }
      };

      const childNodes = Array.from(officeText.children);
      for (const node of childNodes) {
        await parseNode(node as Element, pageId);
      }

      // Deserialize into Craft.js
      actions.deserialize(newNodes);
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (error) {
      console.error("Import error:", error);
      alert("Fout bij importeren: " + (error instanceof Error ? error.message : "Onbekende fout"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-20 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="bg-blue-600 p-1.5 rounded-md text-white">
          <FileText size={20} />
        </div>
        <h1 className="font-semibold text-gray-800 text-lg">DocuBuild A4</h1>
      </div>
      
      <div className="flex items-center gap-3">
        <input 
          type="file" 
          accept=".odt" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
        />
        
        {isLoading ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-500 rounded-md text-sm font-medium">
            <Loader2 size={16} className="animate-spin" />
            Verwerken...
          </div>
        ) : (
          <>
            <button 
              onClick={handleImportClick}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Upload size={16} />
              Importeer ODT
            </button>

            <button 
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <Download size={16} />
              Exporteer ODT
            </button>
          </>
        )}
      </div>
    </header>
  );
};