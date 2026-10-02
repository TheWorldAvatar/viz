import { useEffect, useState } from "react";
import { ScreenType, ScreenTypeMap } from "@/types/settings";

/* A custom hook to get screen type based on current screen sizes
  *
  */
export const useScreenType = (): ScreenType => {
  const [screenType, setScreenType] = useState<ScreenType>(ScreenTypeMap.MOBILE);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width < 768) {
        setScreenType(ScreenTypeMap.MOBILE);
      } else if (width < 1024) {
        setScreenType(ScreenTypeMap.TABLET);
      } else {
        setScreenType(ScreenTypeMap.DESKTOP);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return screenType;
};
