import { healthCheck } from "@/utils/internal-api-services";
import { useEffect, useState } from "react";

/* A custom hook to check online and offline connection.
  */
export const useConnected = (): boolean => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  useEffect(() => {
    const checkConnection = async () => {
      const isOnline: boolean = await healthCheck();
      setIsConnected(isOnline);
    };
    const online = () => {
      setIsConnected(true);
    };
    const offline = () => {
      setIsConnected(false);
    };

    checkConnection();

    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, []);
  return isConnected;
};
