declare module "*.json" {
    const value: string;
    export default value;
}

// TypeScript requires type declarations for JSON imports, so this is necessary for JSON module resolution, i.e. the language modules.`