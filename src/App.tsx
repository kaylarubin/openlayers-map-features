import { ColorContextProvider } from "./context/ColorContext";
import { MapLayerProvider } from "./context/MapLayerConext";
import MapWrapper from "./tsx/MapWrapper";

function App() {
  return (
    <ColorContextProvider>
      <MapLayerProvider>
        <MapWrapper />
      </MapLayerProvider>
    </ColorContextProvider>
  );
}

export default App;
