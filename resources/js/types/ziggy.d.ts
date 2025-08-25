declare global {
    interface Window {
        Ziggy: any;
        route: (name: string, params?: any, absolute?: boolean, config?: any) => string;
    }
}

declare function route(name: string, params?: any, absolute?: boolean, config?: any): string;
declare function route(): {
    current: (name: string) => boolean;
};

export {};