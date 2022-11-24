//Context similar to ownship which every half second will update the color offered by the context provider
import {createContext, useEffect, useState} from 'react';

export const Triangle_colors = {
  red: '#c71212',
  yellow: '#f2e013',
  orange: '#f28a13',
  green: '#32a852',
  blue: '#13a1f2',
  purple: '#873CF7',
};

const spectrum = [
  Triangle_colors.red,
  Triangle_colors.orange,
  Triangle_colors.yellow,
  Triangle_colors.green,
  Triangle_colors.blue,
  Triangle_colors.purple,
];

const initialState = {
  color: Triangle_colors.red,
};

export const ColorContext = createContext(initialState);

export function ColorContextProvider({children}: {children: React.ReactNode}) {
  const [updateColor, setUpdateColor] = useState<boolean>(false);
  const [colorIndex, setColorIndex] = useState<number>(0);
  const [color, setColor] = useState<string>(initialState.color);

  useEffect(() => {
    const interval = setInterval(() => setUpdateColor((prev) => !prev), 500);
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    setColor(spectrum[colorIndex]);
    if (colorIndex === spectrum.length - 1) setColorIndex(0);
    else setColorIndex((prev) => prev + 1);
  }, [updateColor]);

  return <ColorContext.Provider value={{color}}>{children}</ColorContext.Provider>;
}
