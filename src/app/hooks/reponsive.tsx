import { useState, useEffect, useRef } from "react";
import { Dimensions, ScaledSize } from "react-native";

const useDimensionsListener = () => {
  const [screenDimension, setScreenDimension] = useState(
    Dimensions.get("screen")
  );
  const [windowDimension, setWindowDimension] = useState(
    Dimensions.get("window")
  );

  useEffect(() => {
    function handleDimensionChange({
      window,
      screen
    }: {
      window: ScaledSize;
      screen: ScaledSize;
    }) {
      setWindowDimension(window);
      setScreenDimension(screen);
    }

    const resizeListener = Dimensions.addEventListener("change", handleDimensionChange);
    return () => {
      resizeListener.remove();
    };
  }, []);

  return {
    screen: screenDimension,
    window: windowDimension
  };
};

type EffectParams = {
  screen: ScaledSize;
  window: ScaledSize;
};

type EffectCallback =
  | ((opts: EffectParams) => () => any)
  | ((opts: EffectParams) => undefined)
  | ((opts: EffectParams) => void);

const useDimensionsChange = (effect: EffectCallback) => {
  const hasMountRef = useRef(false);
  const dimensions = useDimensionsListener();

  useEffect(() => {
    if (hasMountRef.current) {
      const destroy = effect(dimensions);
      let cleanUp: any = () => null;
      if (typeof destroy === "function") {
        cleanUp = destroy;
      }
      return () => cleanUp();
    } else {
      hasMountRef.current = true;
    }
  }, [dimensions, effect]);
};

const percentageCalculation = (max: number, val: number) => max * (val / 100);

const fontCalculation = (height: number, width: number, val: number) => {
  const widthDimension = height > width ? width : height;
  const aspectRatioBasedHeight = (16 / 9) * widthDimension;
  return percentageCalculation(
    Math.sqrt(
      Math.pow(aspectRatioBasedHeight, 2) + Math.pow(widthDimension, 2)
    ),
    val
  );
};

export const useResponsiveScale = () => {
  const { window, screen } = useDimensionsListener();

  const responsiveHeight = (h: number) => percentageCalculation(window.height || 0, h);
  const responsiveWidth = (w: number) => percentageCalculation(window.width || 0, w);
  const responsiveFontSize = (f: number) => fontCalculation(window.height || 0, window.width || 0, f);
  const responsiveScreenHeight = (h: number) => percentageCalculation(screen.height || 0, h);
  const responsiveScreenWidth = (w: number) => percentageCalculation(screen.width || 0, w);
  const responsiveScreenFontSize = (f: number) => fontCalculation(screen.height || 0, screen.width || 0, f);

  return {
    responsiveHeight,
    responsiveWidth,
    responsiveFontSize,
    responsiveScreenHeight,
    responsiveScreenWidth,
    responsiveScreenFontSize,
    useDimensionsChange
  };
};

export default useDimensionsListener;
