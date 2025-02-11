import {
    PlaitBoard,
    Point,
    PointOfRectangle,
    RectangleClient,
    getNearestPointBetweenPointAndDiscreteSegments,
    getNearestPointBetweenPointAndSegments,
    setStrokeLinecap
} from '@plait/core';
import { getUnitVectorByPointAndPoint } from '@plait/common';
import { DrawOptions, GeometryCommonTextKeys, PlaitMultipleTextGeometry, ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { RectangleEngine } from '../basic-shapes/rectangle';
import { getStrokeWidthByElement } from '../../utils';
import { ShapeDefaultSpace } from '../../constants';
import { DrawTextInfo } from '../../generators/text.generator';

interface PackagePathData {
    headerHeight: number;
    points: {
        leftTop: Point;
        topStart: Point;
        topEnd: Point;
        cornerPoint: Point;
        rightTop: Point;
        rightBottom: Point;
        leftBottom: Point;
        leftMiddle: Point;
        middlePoint: Point;
    };
}

function generatePackagePath(rectangle: RectangleClient): PackagePathData {
    const headerHeight = 25;
    const topWidth = rectangle.width * 0.7;
    const cornerX = rectangle.x + rectangle.width * 0.8;
    
    return {
        headerHeight,
        points: {
            leftTop: [rectangle.x, rectangle.y + headerHeight],
            topStart: [rectangle.x, rectangle.y],
            topEnd: [rectangle.x + topWidth, rectangle.y],
            cornerPoint: [cornerX, rectangle.y + headerHeight],
            rightTop: [rectangle.x + rectangle.width, rectangle.y + headerHeight],
            rightBottom: [rectangle.x + rectangle.width, rectangle.y + rectangle.height],
            leftBottom: [rectangle.x, rectangle.y + rectangle.height],
            leftMiddle: [rectangle.x, rectangle.y + headerHeight],
            middlePoint: [cornerX, rectangle.y + headerHeight]
        }
    };
}

export const PackageEngine: ShapeEngine<PlaitMultipleTextGeometry, DrawOptions, DrawTextInfo> = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const rs = PlaitBoard.getRoughSVG(board);
        const { points } = generatePackagePath(rectangle);
        
        const pathData = [
            `M${points.leftTop[0]} ${points.leftTop[1]}`,
            `V${points.topStart[1]}`,
            `H${points.topEnd[0]}`,
            `L${points.cornerPoint[0]} ${points.cornerPoint[1]}`,
            `H${points.rightTop[0]}`,
            `V${points.rightBottom[1]}`,
            `H${points.leftBottom[0]}`,
            `V${points.leftMiddle[1]}`,
            `H${points.middlePoint[0]}`
        ].join(' ');

        const shape = rs.path(pathData, { ...options, fillStyle: 'solid' });
        setStrokeLinecap(shape, 'round');
        return shape;
    },
    isInsidePoint(rectangle: RectangleClient, point: Point) {
        const rangeRectangle = RectangleClient.getRectangleByPoints([point, point]);
        return RectangleClient.isHit(rectangle, rangeRectangle);
    },
    getCornerPoints(rectangle: RectangleClient) {
        return RectangleClient.getCornerPoints(rectangle);
    },
    getNearestPoint(rectangle: RectangleClient, point: Point) {
        const { points } = generatePackagePath(rectangle);
        
        const segments: [Point, Point][] = [
            // 左边竖线
            [points.topStart, points.leftTop],
            [points.leftTop, points.leftBottom],
            // 底边
            [points.leftBottom, points.rightBottom],
            // 右边竖线
            [points.rightBottom, points.rightTop],
            // 顶部折线
            [points.topStart, points.topEnd],
            [points.topEnd, points.cornerPoint],
            [points.cornerPoint, points.rightTop],
            // 中间横线
            [points.leftMiddle, points.middlePoint]
        ];

        return getNearestPointBetweenPointAndDiscreteSegments(point, segments);
    },
    getConnectorPoints(rectangle: RectangleClient) {
        return RectangleClient.getEdgeCenterPoints(rectangle);
    },
    getTangentVectorByConnectionPoint(rectangle: RectangleClient, pointOfRectangle: PointOfRectangle) {
        const connectionPoint = RectangleClient.getConnectionPoint(rectangle, pointOfRectangle);
        if (connectionPoint[0] > rectangle.x + rectangle.width * 0.7 && connectionPoint[1] < rectangle.y + 25) {
            return getUnitVectorByPointAndPoint([rectangle.x + rectangle.width * 0.7, rectangle.y], connectionPoint);
        }
        return getUnitVectorByPointAndPoint([rectangle.x + rectangle.width * 0.8, rectangle.y + 25], connectionPoint);
    },
    getTextRectangle(element: PlaitMultipleTextGeometry, options?: DrawTextInfo) {
        const elementRectangle = RectangleClient.getRectangleByPoints(element.points!);
        const strokeWidth = getStrokeWidthByElement(element);
        const textHeight = element.texts?.find(item => item.id === options?.id)?.textHeight!;
        if (options?.id === GeometryCommonTextKeys.name) {
            const width = elementRectangle.width * 0.7 - ShapeDefaultSpace.rectangleAndText - strokeWidth;
            return {
                height: textHeight,
                width: width > 0 ? width : 0,
                x: elementRectangle.x + ShapeDefaultSpace.rectangleAndText + strokeWidth,
                y: elementRectangle.y + (25 - textHeight) / 2
            };
        }
        if (options?.id === GeometryCommonTextKeys.content) {
            const width = elementRectangle.width - ShapeDefaultSpace.rectangleAndText * 2 - strokeWidth * 2;
            return {
                height: textHeight,
                width: width > 0 ? width : 0,
                x: elementRectangle.x + ShapeDefaultSpace.rectangleAndText + strokeWidth,
                y: elementRectangle.y + 25 + (elementRectangle.height - 25 - textHeight) / 2
            };
        }
        return elementRectangle;
    }
};
