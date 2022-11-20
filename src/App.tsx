import { MapLayerProvider } from "./context/MapLayerConext";
import MapWrapper from "./tsx/MapWrapper";

function App() {
  return (
    <MapLayerProvider>
      <MapWrapper />
    </MapLayerProvider>
  );
}

export default App;
