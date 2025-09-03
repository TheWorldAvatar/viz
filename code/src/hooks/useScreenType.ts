import { useEffect, useState } from "react";
import { ScreenType } from "types/settings";

/* A custom hook to get screen type based on current screen sizes
  *
  */
export const useScreenType = (): ScreenType => {
  const [screenType, setScreenType] = useState<ScreenType>("mobile");

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width < 768) {
        setScreenType("mobile");
      } else if (width < 1024) {
        setScreenType("tablet");
      } else {
        setScreenType("desktop");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return screenType;
};
