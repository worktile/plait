import { PlaitBoard, Point, RectangleClient } from '@plait/core';
import { PlaitArrowLine } from '../../interfaces';
import { getPointOnPolyline } from '@plait/common';
import { getArrowLinePoints } from '../arrow-line/arrow-line-basic';
import { getTextSize } from '../text-size';

export const getHitArrowLineTextIndex = (board: PlaitBoard, element: PlaitArrowLine, point: Point) => {
    const texts = element.texts;
    if (!texts.length) return -1;

    const points = getArrowLinePoints(board, element);
    return texts.findIndex((text) => {
        const center = getPointOnPolyline(points, text.position);
        const textSize = getTextSize(board, text.text);
        const rectangle = {
            x: center[0] - textSize.width / 2,
            y: center[1] - textSize.height / 2,
            width: textSize.width,
            height: textSize.height
        };
        return RectangleClient.isHit(rectangle, RectangleClient.getRectangleByPoints([point, point]));
    });
};
