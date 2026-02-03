class BrowserStorageManager {
  private storage: Storage;

  constructor() {
    // Only attempt to access if 'window' is defined
    if (typeof window !== "undefined") {
      this.storage = window.sessionStorage;
    }
  }

  /**
   * Retrieves an item from the storage, parsing it from JSON.
   * 
   * @param key The key of the item to retrieve.
   * @returns The parsed value, undefined if the stored value was "undefined", or null if the key doesn't exist.
   */
  public get(key: string): string | null | undefined {
    try {
      const serialisedValue: string = this.storage.getItem(key);
      if (serialisedValue === null) {
        return null;
      }
      // Handle the case where "undefined" was stored as a raw string (not JSON)
      // This happens when JSON.stringify(undefined) returns undefined and localStorage converts it to "undefined"
      if (serialisedValue === "undefined") {
        return undefined;
      }
      return JSON.parse(serialisedValue);
    } catch (error) {
      console.error(`Error reading key "${key}" from localStorage:`, error);
      return null;
    }
  }


  /**
   * Stores an item in the storage, serialising it to JSON.
   * 
   * @param key The key under which to store the value.
   * @param value The value to store.
   */
  public set(key: string, value: string | undefined): void {
    try {
      const serializedValue = JSON.stringify(value);
      this.storage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Error setting key "${key}" to localStorage:`, error);
    }
  }

  /**
   * Clears all items from the storage. Use with caution.
   */
  public clear(): void {
    this.storage.clear();
  }
}

// Export a single instance to use across your application
export const browserStorageManager = new BrowserStorageManager();