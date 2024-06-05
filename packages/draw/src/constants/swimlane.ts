import { SwimlaneDrawSymbols } from '../interfaces/swimlane';

export const SWIMLANE_HEADER_SIZE = 42;

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
