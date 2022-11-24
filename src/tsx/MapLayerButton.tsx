interface MapLayerButtonProps {
  toggledState: boolean;
  setToggledState: (b: boolean) => void;
  text: string;
}

export const MapLayerButton: React.FC<MapLayerButtonProps> = (props) => {
  return (
    <button
      style={{
        color: props.toggledState ? 'white' : '',
        backgroundColor: props.toggledState ? 'blue' : '',
      }}
      onClick={() => {
        props.setToggledState(!props.toggledState);
      }}
    >
      {props.text}
    </button>
  );
};
