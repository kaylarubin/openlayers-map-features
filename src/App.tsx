import { TriangleLayerProvider } from "./context/TriangleLayerContext";
import MapWrapper from "./MapWrapper";

function App() {
  return (
    <TriangleLayerProvider>
      <MapWrapper />
    </TriangleLayerProvider>
  );
}

export default App;
