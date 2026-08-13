import { useEffect, useState } from "react";
import { ScreenType, ScreenTypeMap } from "@/types/settings";

/* A custom hook to get screen type based on current screen sizes
  *
  */
export const useScreenType = (): ScreenType => {
  const [screenType, setScreenType] = useState<ScreenType>(ScreenTypeMap.MOBILE);

  useEffect(() => {
    const handleResize = () => {
      const width: number = window.innerWidth;
      const isCoarsePointer: boolean = window.matchMedia("(pointer: coarse)").matches;

      if (width < 768 && isCoarsePointer) {
        setScreenType(ScreenTypeMap.MOBILE);
      } else if (width < 1024 && isCoarsePointer) {
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
