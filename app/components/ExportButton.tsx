const handleExport = async () => {
  const json = query.serialize(); // Craft.js state
  
  const response = await fetch("https://odt-generator.code045.nl/generate-odt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: json }),
  });

  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'mijn-document.odt');
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  } else {
    alert("Export mislukt");
  }
};