import { PlaitBoard, PlaitPluginElementContext } from '@plait/core';
import { PlaitDraw } from '../utils/base';
import { GeoComponent } from '../geo.component';

export const withDraw = (board: PlaitBoard) => {
    const { drawElement } = board;

    board.drawElement = (context: PlaitPluginElementContext) => {
        if (PlaitDraw.isGeo(context.element)) {
            return GeoComponent;
        }
        return drawElement(context);
    };

    return board;
};
