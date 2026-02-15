const handleExport = async () => {
  const json = query.serialize();
  
  // Controleer of we lokaal draaien of op de productie server
  const isLocal = window.location.hostname === 'localhost';
  const BACKEND_URL = isLocal 
    ? "http://localhost:8000/generate-odt" 
    : "https://odt-generator.code045.nl/generate-odt";

  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: json }),
    });

    if (!response.ok) throw new Error("Export mislukt");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'document.odt');
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Fout bij exporteren:", error);
  }
};