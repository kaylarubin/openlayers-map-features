import { useContext } from "react";
import { mapLayerContext } from "../context/MapLayerConext";

export const TriangleButton: React.FC = () => {
  const { triangleLayerToggled, setTriangleLayerToggled } =
    useContext(mapLayerContext);

  const handleButtonClick = () => {
    setTriangleLayerToggled(!triangleLayerToggled);
  };

  return (
    <button
      style={{
        color: triangleLayerToggled ? "white" : "",
        backgroundColor: triangleLayerToggled ? "blue" : "",
      }}
      onClick={handleButtonClick}
    >
      Show Triangle
    </button>
  );
};
