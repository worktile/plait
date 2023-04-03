import { isNullOrUndefined } from '../utils/helper';
import { ExtendedType } from './custom-types';
import { Point } from './point';

export interface BaseViewport {
    [key: string]: any;
    viewBackgroundColor: string;
    zoom: number;
    origination?: Point;
}

export type Viewport = ExtendedType<'Viewport', BaseViewport>;

export interface ViewportInterface {
    isViewport: (value: any) => value is Viewport;
}

export const Viewport: ViewportInterface = {
    isViewport: (value: any): value is Viewport => {
        return (
            !isNullOrUndefined(value.zoom) && !isNullOrUndefined(value.viewBackgroundColor) && !isNullOrUndefined(value.originationCoord)
        );
    }
};
