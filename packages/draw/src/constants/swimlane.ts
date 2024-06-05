import { SwimlaneDrawSymbols, SwimlaneSymbols } from '../interfaces/swimlane';

export const DefaultSwimlaneVerticalWithHeaderProperty = {
    width: 580,
    height: 524
};

export const DefaultSwimlaneHorizontalWithHeaderProperty = {
    width: 524,
    height: 580
};

export const DefaultSwimlaneVerticalProperty = {
    width: 580,
    height: 524
};

export const DefaultSwimlaneHorizontalProperty = {
    width: 524,
    height: 580
};

export const DefaultSwimlanePropertyMap: Record<string, { width: number; height: number }> = {
    [SwimlaneDrawSymbols.swimlaneHorizontal]: DefaultSwimlaneHorizontalProperty,
    [SwimlaneDrawSymbols.swimlaneVertical]: DefaultSwimlaneVerticalProperty,
    [SwimlaneDrawSymbols.swimlaneHorizontalWithHeader]: DefaultSwimlaneHorizontalWithHeaderProperty,
    [SwimlaneDrawSymbols.swimlaneVerticalWithHeader]: DefaultSwimlaneVerticalWithHeaderProperty
};
