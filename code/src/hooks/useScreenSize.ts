import { useState, useEffect, useMemo } from "react";

interface Breakpoints {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  "2xl"?: number;
}

interface ScreenSize {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isXs: boolean;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  is2Xl: boolean;
  breakpoint: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
}

const defaultBreakpoints: Breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

export const useScreenSize = (
  customBreakpoints: Breakpoints = {}
): ScreenSize => {
  const breakpoints = useMemo(
    () => ({ ...defaultBreakpoints, ...customBreakpoints }),
    [customBreakpoints]
  );

  const [screenSize, setScreenSize] = useState<ScreenSize>({
    width: 0,
    height: 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isXs: false,
    isSm: false,
    isMd: false,
    isLg: false,
    isXl: false,
    is2Xl: false,
    breakpoint: "xs",
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      let currentBreakpoint: ScreenSize["breakpoint"] = "xs";
      if (width >= breakpoints["2xl"]!) currentBreakpoint = "2xl";
      else if (width >= breakpoints.xl!) currentBreakpoint = "xl";
      else if (width >= breakpoints.lg!) currentBreakpoint = "lg";
      else if (width >= breakpoints.md!) currentBreakpoint = "md";
      else if (width >= breakpoints.sm!) currentBreakpoint = "sm";

      setScreenSize({
        width,
        height,
        isMobile: width < breakpoints.md!, // < 768px
        isTablet: width >= breakpoints.md! && width < breakpoints.lg!, // 768px - 1023px
        isDesktop: width >= breakpoints.lg!, // >= 1024px

        isXs: width >= breakpoints.xs! && width < breakpoints.sm!,
        isSm: width >= breakpoints.sm! && width < breakpoints.md!,
        isMd: width >= breakpoints.md! && width < breakpoints.lg!,
        isLg: width >= breakpoints.lg! && width < breakpoints.xl!,
        isXl: width >= breakpoints.xl! && width < breakpoints["2xl"]!,
        is2Xl: width >= breakpoints["2xl"]!,

        breakpoint: currentBreakpoint,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoints]);

  return screenSize;
};

// Usage examples with TypeScript:
/*
// Full featured hook with type safety
const { isMobile, isTablet, isDesktop, breakpoint, width }: ScreenSize = useScreenSize();

// With custom breakpoints 
const screenInfo: ScreenSize = useScreenSize({
  sm: 600,
  md: 700,
});

// Example usage in component:
function MyComponent(): JSX.Element {
  const { isMobile, isTablet, isDesktop, breakpoint }: ScreenSize = useScreenSize();

  return (
    <div>
      <p>Current breakpoint: {breakpoint}</p>
      <p>Is Mobile: {isMobile ? 'Yes' : 'No'}</p>
      <p>Is Tablet: {isTablet ? 'Yes' : 'No'}</p>
      <p>Is Desktop: {isDesktop ? 'Yes' : 'No'}</p>
      
      {isMobile && <MobileComponent />}
      {isTablet && <TabletComponent />}
      {isDesktop && <DesktopComponent />}
    </div>
  );
}
*/
