"use client";

import { FormEvent } from "react";

function NewRoutePage() {
  async function searchPlaces(event: FormEvent) {
    event.preventDefault();

    const source = (document.getElementById("source") as HTMLInputElement)
      .value;
    const destination = (
      document.getElementById("destination") as HTMLInputElement
    ).value;

    const [sourceResponse, destinationResponse] = await Promise.all([
      fetch(`http://localhost:3000/places?text=${source}`),
      fetch(`http://localhost:3000/places?text=${destination}`),
    ]);

    const [sourcePlace, destinationPlace] = await Promise.all([
      sourceResponse.json(),
      destinationResponse.json(),
    ]);

    console.log("sourcePlace", sourcePlace);
    console.log("destinationPlace", destinationPlace);
  }

  return (
    <div>
      <h1>Nova Rota</h1>
      <form
        style={{ display: "flex", flexDirection: "column" }}
        onSubmit={searchPlaces}
      >
        <div>
          <input id="source" type="text" placeholder="origem" />
        </div>
        <div>
          <input id="destination" type="text" placeholder="destino" />
        </div>
        <button type="submit">Pesquisar</button>
      </form>
    </div>
  );
}

export default NewRoutePage;
