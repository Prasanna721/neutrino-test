export type TestSuite = string[];

export interface ScreenDimensions {
    viewport: {
        width: number;
        height: number;
    } | null;
    window: {
        width: number;
        height: number;
        outerWidth: number;
        outerHeight: number;
        screenWidth: number;
        screenHeight: number;
    };
}