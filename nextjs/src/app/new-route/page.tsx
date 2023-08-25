"use client";

import { FormEvent, useRef, useState } from "react";
import type {
  DirectionsResponseData,
  FindPlaceFromTextResponseData,
} from "@googlemaps/google-maps-services-js";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";

import { useMap } from "../hooks/useMap";
import {
  Alert,
  Button,
  Card,
  CardActions,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";

function NewRoutePage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const map = useMap(mapContainerRef);
  const [directionsData, setDirectionsData] = useState<
    DirectionsResponseData & { request: any }
  >();
  const [open, setOpen] = useState<boolean>(false);

  async function createRoute() {
    const startAddress = directionsData!.routes[0].legs[0].start_address;
    const endAddress = directionsData!.routes[0].legs[0].end_address;
    const response = await fetch(`/api/routes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `${startAddress} - ${endAddress}`,
        source_id: directionsData!.request.origin.place_id,
        destination_id: directionsData!.request.destination.place_id,
      }),
    });
    const route = await response.json();
    setOpen(true);
  }

  async function searchPlaces(event: FormEvent) {
    event.preventDefault();

    const source = (document.getElementById("source") as HTMLInputElement)
      .value;
    const destination = (
      document.getElementById("destination") as HTMLInputElement
    ).value;

    const [sourceResponse, destinationResponse] = await Promise.all([
      fetch(`/api/places?text=${source}`),
      fetch(`/api/places?text=${destination}`),
    ]);

    const [sourcePlace, destinationPlace]: FindPlaceFromTextResponseData[] =
      await Promise.all([sourceResponse.json(), destinationResponse.json()]);

    if (sourcePlace.status !== "OK") {
      console.error(sourcePlace);
      alert("Não foi possível carregar a origem");
      return;
    }

    if (destinationPlace.status !== "OK") {
      console.error(destinationPlace);
      alert("Não foi possível carregar a origem");
      return;
    }

    const placeSourceId = sourcePlace.candidates[0].place_id;
    const placeDestinationId = destinationPlace.candidates[0].place_id;

    const directionsResponse = await fetch(
      `/api/directions?originId=${placeSourceId}&destinationId=${placeDestinationId}`
    );

    const directionsData: DirectionsResponseData & { request: any } =
      await directionsResponse.json();

    setDirectionsData(directionsData);

    map && map?.removeAllRoutes();

    await map?.addRouteWithIcons({
      routeId: "1",
      startMarkerOptions: {
        position: directionsData.routes[0].legs[0].start_location,
      },
      endMarkerOptions: {
        position: directionsData.routes[0].legs[0].end_location,
      },
      carMarkerOptions: {
        position: directionsData.routes[0].legs[0].start_location,
      },
    });
  }

  return (
    <Grid2 container sx={{ display: "flex", flex: 1 }}>
      <Grid2 xs={4} px={2}>
        <Typography variant="h4">Nova Rota</Typography>
        <form onSubmit={searchPlaces}>
          <TextField id="source" label="origem" fullWidth></TextField>
          <TextField
            id="destination"
            label="destino"
            fullWidth
            sx={{ mt: 1 }}
          ></TextField>
          <Button type="submit" variant="contained" sx={{ mt: 1 }} fullWidth>
            Pesquisar
          </Button>
        </form>
        {directionsData && (
          <Card sx={{ mt: 1 }}>
            <CardContent>
              <List>
                <ListItem>
                  <ListItemText
                    primary={"Origem"}
                    secondary={
                      directionsData?.routes[0]!.legs[0]!.start_address
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={"Destino"}
                    secondary={directionsData?.routes[0]!.legs[0]!.end_address}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={"Distância"}
                    secondary={
                      directionsData?.routes[0]!.legs[0]!.distance.text
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={"Duração"}
                    secondary={
                      directionsData?.routes[0]!.legs[0]!.duration.text
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
            <CardActions sx={{ display: "flex", justifyContent: "center" }}>
              <Button type="button" variant="contained" onClick={createRoute}>
                Adicionar rota
              </Button>
            </CardActions>
          </Card>
        )}
      </Grid2>
      <Grid2 id="map" ref={mapContainerRef} xs={8}></Grid2>

      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={() => setOpen(false)}
      >
        <Alert onClose={() => setOpen(false)} severity="success">
          Rota cadastrada com sucesso
        </Alert>
      </Snackbar>
    </Grid2>
  );
}

export default NewRoutePage;
