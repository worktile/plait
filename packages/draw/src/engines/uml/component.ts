import {
    PlaitBoard,
    Point,
    PointOfRectangle,
    RectangleClient,
    getNearestPointBetweenPointAndDiscreteSegments,
    setStrokeLinecap
} from '@plait/core';
import { getTextSize } from '../../utils/text-size';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { getStrokeWidthByElement } from '../../utils';
import { ShapeDefaultSpace } from '../../constants';
import { getUnitVectorByPointAndPoint } from '@plait/common';

interface ComponentPathData {
    boxSize: {
        width: number;
        height: number;
    };
    points: {
        mainStart: Point;
        topBoxStart: Point;
        topBoxEnd: Point;
        bottomBoxStart: Point;
        bottomBoxEnd: Point;
        mainEnd: Point;
        rightTop: Point;
        rightBottom: Point;
    };
}

function generateComponentPath(rectangle: RectangleClient): ComponentPathData {
    const mainLineX = rectangle.x + 12;
    const boxWidth = rectangle.width > 70 ? 24 : rectangle.width * 0.2;
    const boxHeight = rectangle.height - 28 - rectangle.height * 0.35 > 1 ? 14 : rectangle.height * 0.175;
    const topBoxY = rectangle.y + rectangle.height * 0.175;
    const bottomBoxY = rectangle.y + rectangle.height - rectangle.height * 0.175 - boxHeight;
    
    return {
        boxSize: {
            width: boxWidth,
            height: boxHeight
        },
        points: {
            mainStart: [mainLineX, rectangle.y],
            topBoxStart: [mainLineX, topBoxY],
            topBoxEnd: [mainLineX, topBoxY + boxHeight],
            bottomBoxStart: [mainLineX, bottomBoxY],
            bottomBoxEnd: [mainLineX, bottomBoxY + boxHeight],
            mainEnd: [mainLineX, rectangle.y + rectangle.height],
            rightTop: [rectangle.x + rectangle.width, rectangle.y],
            rightBottom: [rectangle.x + rectangle.width, rectangle.y + rectangle.height]
        }
    };
}

export const ComponentEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const rs = PlaitBoard.getRoughSVG(board);
        const { boxSize, points } = generateComponentPath(rectangle);
        
        const pathData = [
            // 主矩形轮廓
            `M${points.mainStart[0]} ${points.mainStart[1]}`,
            `H${points.rightTop[0]}`,
            `V${points.rightBottom[1]}`,
            `H${points.mainEnd[0]}`,

            // 上方小矩形
            `M${points.topBoxStart[0]} ${points.topBoxStart[1]}`,
            `h${boxSize.width / 2} v${boxSize.height} h${-boxSize.width} v${-boxSize.height} h${boxSize.width / 2}`,

            // 下方小矩形
            `M${points.bottomBoxStart[0]} ${points.bottomBoxStart[1]}`,
            `h${boxSize.width / 2} v${boxSize.height} h${-boxSize.width} v${-boxSize.height} h${boxSize.width / 2}`,

            // 连接线
            `M${points.mainStart[0]} ${points.mainStart[1]}`,
            `V${points.topBoxStart[1]}`,
            `M${points.topBoxEnd[0]} ${points.topBoxEnd[1]}`,
            `V${points.bottomBoxStart[1]}`,
            `M${points.bottomBoxEnd[0]} ${points.bottomBoxEnd[1]}`,
            `V${points.mainEnd[1]}`
        ].join(' ');

        const shape = rs.path(pathData, { ...options, fillStyle: 'solid' });
        setStrokeLinecap(shape, 'round');
        return shape;
    },

    getNearestPoint(rectangle: RectangleClient, point: Point) {
        const { boxSize, points } = generateComponentPath(rectangle);
        
        const segments: [Point, Point][] = [
            // 主矩形轮廓
            [points.mainStart, [points.rightTop[0], points.mainStart[1]]],
            [[points.rightTop[0], points.mainStart[1]], points.rightBottom],
            [points.rightBottom, [points.mainEnd[0], points.rightBottom[1]]],
            [[points.mainEnd[0], points.rightBottom[1]], points.mainStart],

            // 上方小矩形
            [points.topBoxStart, [points.topBoxStart[0] + boxSize.width/2, points.topBoxStart[1]]],
            [[points.topBoxStart[0] + boxSize.width/2, points.topBoxStart[1]], [points.topBoxStart[0] + boxSize.width/2, points.topBoxEnd[1]]],
            [[points.topBoxStart[0] + boxSize.width/2, points.topBoxEnd[1]], [points.topBoxStart[0] - boxSize.width/2, points.topBoxEnd[1]]],
            [[points.topBoxStart[0] - boxSize.width/2, points.topBoxEnd[1]], [points.topBoxStart[0] - boxSize.width/2, points.topBoxStart[1]]],
            [[points.topBoxStart[0] - boxSize.width/2, points.topBoxStart[1]], points.topBoxStart],

            // 下方小矩形
            [points.bottomBoxStart, [points.bottomBoxStart[0] + boxSize.width/2, points.bottomBoxStart[1]]],
            [[points.bottomBoxStart[0] + boxSize.width/2, points.bottomBoxStart[1]], [points.bottomBoxStart[0] + boxSize.width/2, points.bottomBoxEnd[1]]],
            [[points.bottomBoxStart[0] + boxSize.width/2, points.bottomBoxEnd[1]], [points.bottomBoxStart[0] - boxSize.width/2, points.bottomBoxEnd[1]]],
            [[points.bottomBoxStart[0] - boxSize.width/2, points.bottomBoxEnd[1]], [points.bottomBoxStart[0] - boxSize.width/2, points.bottomBoxStart[1]]],
            [[points.bottomBoxStart[0] - boxSize.width/2, points.bottomBoxStart[1]], points.bottomBoxStart],

            // 连接线
            [points.mainStart, points.topBoxStart],
            [points.topBoxEnd, points.bottomBoxStart],
            [points.bottomBoxEnd, points.mainEnd]
        ];

        return getNearestPointBetweenPointAndDiscreteSegments(point, segments);
    },

    isInsidePoint(rectangle: RectangleClient, point: Point) {
        const rangeRectangle = RectangleClient.getRectangleByPoints([point, point]);
        return RectangleClient.isHit(rectangle, rangeRectangle);
    },

    getCornerPoints(rectangle: RectangleClient) {
        return RectangleClient.getCornerPoints(rectangle);
    },

    getTangentVectorByConnectionPoint(rectangle: RectangleClient, pointOfRectangle: PointOfRectangle) {
        const { points } = generateComponentPath(rectangle);
        const connectionPoint = RectangleClient.getConnectionPoint(rectangle, pointOfRectangle);
        return getUnitVectorByPointAndPoint(points.mainStart, connectionPoint);
    },

    getConnectorPoints(rectangle: RectangleClient) {
        const { points } = generateComponentPath(rectangle);
        return [
            [rectangle.x + rectangle.width / 2, rectangle.y],
            [rectangle.x + rectangle.width, rectangle.y + rectangle.height / 2],
            [rectangle.x + rectangle.width / 2, rectangle.y + rectangle.height],
            [points.mainStart[0], rectangle.y + rectangle.height / 2]
        ] as [Point, Point, Point, Point];
    },

    getTextRectangle(board: PlaitBoard, element: PlaitGeometry) {
        const elementRectangle = RectangleClient.getRectangleByPoints(element.points!);
        const strokeWidth = getStrokeWidthByElement(element);
        const width = elementRectangle.width - 24 - ShapeDefaultSpace.rectangleAndText * 2 - strokeWidth * 2;
        const text = element.text!;
        const textSize = getTextSize(board, text, width);
        return {
            height: textSize.height,
            width: width > 0 ? width : 0,
            x: elementRectangle.x + 24 + ShapeDefaultSpace.rectangleAndText + strokeWidth,
            y: elementRectangle.y + (elementRectangle.height - textSize.height) / 2
        };
    }
};
