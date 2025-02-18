/**
 * This component file provdies a customised Material-UI theme for the registry table.
 * It includes:
 *  - Light and dark mode themes
 *  - Custom styling for DataGrid components
 *  - Responsive design configurations
 *  - Typography and colour palette settings
 *
 * The theme respects system preferences for dark/light mode and integrates with global css variables.
 */

import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { ReactNode, useMemo } from "react";

/**
 * Light theme configuration
 */
const lightTheme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#e5e5e5",
      paper: "#efefef",
    },
    text: {
      primary: "#30363d",
      secondary: "#7f7f80",
    },
    primary: {
      main: "#146a7d",
    },
    secondary: {
      main: "#20aac9",
    },
    divider: "#b6b6bf",
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          display: "flex",
          alignSelf: "center",
          flexDirection: "column",
          width: "90%",
          height: "90vh",
          margin: "1rem",
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          maxHeight: "40vh",
          minWidth: "10rem",
          maxWidth: "20rem",
          padding: "0.5rem",
          backgroundColor: "var(--background-primary)",
          color: "var(--text-color-primary)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          width: "90vw",
          padding: "1rem 2rem",
          margin: "1rem",
          backgroundColor: "var(--background-primary)",
          border: "1px solid var(--border-primary) !important",
          borderRadius: "20px",
          flexDirection: "column",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: "var(--background-primary)",
          "&:hover": {
            color: "var(--text-color-links-hover)",
          },
        },
      },
    },
  },
});

/**
 * Dark theme configuration
 */
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#30363d",
      paper: "#30363d",
    },
    text: {
      primary: "#dde9ff",
      secondary: "deepskyblue",
    },
    primary: {
      main: "#146a7d",
    },
    secondary: {
      main: "#20aac9",
    },
    divider: "#434b55",
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          display: "flex",
          alignSelf: "center",
          flexDirection: "column",
          width: "90%",
          height: "90vh",
          margin: "1rem",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          width: "90vw",
          padding: "1rem 2rem",
          margin: "1rem",
          backgroundColor: "var(--background-primary)",
          border: "1px solid var(--border-primary) !important",
          borderRadius: "20px",
          flexDirection: "column",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: "var(--background-primary)",
          "&:hover": {
            color: "var(--text-color-links-hover)",
          },
        },
      },
    },
  },
});

/**
 * Theme provider wrapper for registry table components
 * @param {ReactNode} children - Child components to be wrapped with the theme
 * @returns {JSX.Element} Themed component tree
 */
export const RegistryTableTheme = ({ children }: { children: ReactNode }) => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const theme = useMemo(
    () => (prefersDarkMode ? darkTheme : lightTheme),
    [prefersDarkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};
