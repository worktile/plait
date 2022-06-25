import { isNullOrUndefined } from '../utils/helper';
import { ExtendedType } from './custom-types';

export interface BaseViewport {
    [key: string]: any;
    offsetX: number;
    offsetY: number;
    zoom: number;
    viewBackgroundColor: string;
}

export type Viewport = ExtendedType<'Viewport', BaseViewport>;

export interface ViewportInterface {
    isViewport: (value: any) => value is Viewport;
}

export const Viewport: ViewportInterface = {
    isViewport: (value: any): value is Viewport => {
        return (
            !isNullOrUndefined(value.offsetX) &&
            !isNullOrUndefined(value.offsetY) &&
            !isNullOrUndefined(value.zoom) &&
            !isNullOrUndefined(value.viewBackgroundColor)
        );
    }
};
