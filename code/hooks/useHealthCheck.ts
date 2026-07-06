import { Dictionary } from "@/types/dictionary";
import { toast } from "@/ui/interaction/action/toast/toast";
import { healthCheck } from "@/utils/internal-api-services";
import { useEffect } from "react";
import { useDictionary } from "./useDictionary";

/* A custom hook to add a banner based on online and offline connection.
  */
export const useHealthCheck = (): void => {
  const dict: Dictionary = useDictionary();
  useEffect(() => {
    const checkStatus = async () => {
      const isOnline: boolean = await healthCheck();
      if (!isOnline) {
        toast(dict.message.offlineMode, "error");
      }
    };

    checkStatus();
  }, [dict]);
};
