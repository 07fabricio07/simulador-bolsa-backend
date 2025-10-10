import React, { useState } from "react";
import axios from "axios";

export default function PortafolioInicial() {
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState("");

  const handleFileChange = (e) => {
    setArchivo(e.target.files[0]);
    setMensaje("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    if (!archivo) {
      setMensaje("Selecciona un archivo Excel primero.");
      return;
    }
    const formData = new FormData();
    formData.append("archivo", archivo);

    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/subir-excel-portafolio-inicial`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setMensaje("¡Archivo importado correctamente!");
    } catch (err) {
      setMensaje("Error al importar el archivo. Revisa el formato.");
    }
  };

  return (
    <div>
      <h2>Portafolio inicial</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Sube el archivo Excel con el portafolio inicial de los jugadores:
          <input type="file" accept=".xls,.xlsx" onChange={handleFileChange} />
        </label>
        <button type="submit">Importar Excel</button>
      </form>
      {mensaje && <div style={{ marginTop: "1em", fontWeight: "bold" }}>{mensaje}</div>}
    </div>
  );
}