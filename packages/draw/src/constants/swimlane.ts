import { SwimlaneSymbols } from '../interfaces/swimlane';

export const DefaultSwimlaneVerticalProperty = {
    width: 450,
    height: 500
};

export const DefaultSwimlaneHorizontalProperty = {
    width: 500,
    height: 450
};

export const DefaultSwimlanePropertyMap: Record<string, { width: number; height: number }> = {
    [SwimlaneSymbols.swimlaneHorizontal]: DefaultSwimlaneHorizontalProperty,
    [SwimlaneSymbols.swimlaneVertical]: DefaultSwimlaneVerticalProperty
};
