import { isNullOrUndefined } from '../utils/helper';
import { ExtendedType } from './custom-types';

export interface BaseViewport {
    [key: string]: any;
    zoom: number;
    viewBackgroundColor: string;
    // viewportContainer 左上角在 SVG 坐标系中的位置
    originationCoord?: number[];
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
