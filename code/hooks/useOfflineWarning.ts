import { Dictionary } from "@/types/dictionary";
import { toast } from "@/ui/interaction/action/toast/toast";
import { useEffect } from "react";
import { useDictionary } from "./useDictionary";
import { useConnected } from "./useConnected";

/* A custom hook to warn users if they are offline.
  */
export const useOfflineWarning = (): void => {
  const dict: Dictionary = useDictionary();
  const isConnected: boolean = useConnected();

  useEffect(() => {
    if (!isConnected) {
      toast(dict.message.offlineMode, "error");
    }
  }, [dict.message.offlineMode, isConnected]);
};
