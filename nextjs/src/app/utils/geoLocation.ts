export function getCurrentPosition(
  options?: PositionOptions
): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition((position) => {
      resolve({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }),
        (error: any) => reject(error),
        options;
    });
  });
}
