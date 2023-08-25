"use client";

import { useRef } from "react";
import useSwr from "swr";
import { useMap } from "../hooks/useMap";
import { fetcher } from "../utils/http";
import { Route } from "../utils/models";

function DriverPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const map = useMap(mapContainerRef);

  const {
    data: routes,
    error,
    isLoading,
  } = useSwr<Route[]>(
    `${process.env.NEXT_PUBLIC_NEXT_API_URL}/routes`,
    fetcher,
    {
      fallback: [],
    }
  );

  async function startRoute() {
    const routeId = (document.getElementById("route") as HTMLSelectElement)
      .value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_NEXT_API_URL}/routes/${routeId}`
    );

    const route: Route = await response.json();

    map?.removeAllRoutes();

    await map?.addRouteWithIcons({
      routeId: "1",
      startMarkerOptions: {
        position: route.directions.routes[0].legs[0].start_location,
      },
      endMarkerOptions: {
        position: route.directions.routes[0].legs[0].end_location,
      },
      carMarkerOptions: {
        position: route.directions.routes[0].legs[0].start_location,
      },
    });

    const { steps } = route.directions.routes[0].legs[0];

    for (const step of steps) {
      await sleep(2000);
      map?.moveCar(routeId, step.start_location);

      await sleep(2000);
      map?.moveCar(routeId, step.end_location);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        height: "100%",
      }}
    >
      <div>
        <h1>Minha Viagem</h1>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div>
            <select id="route">
              {isLoading && <option disabled>Carregando rotas...</option>}
              {routes?.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.name}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" onClick={startRoute}>
            Iniciar a viagem
          </button>
        </div>
      </div>
      <div
        id="map"
        ref={mapContainerRef}
        style={{
          width: "100%",
          height: "100%",
        }}
      ></div>
    </div>
  );
}

export default DriverPage;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
