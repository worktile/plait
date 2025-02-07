import { PlaitBoard, Point, PointOfRectangle, RectangleClient, SVGArcCommand, distanceBetweenPointAndPoint, setPathStrokeLinecap } from '@plait/core';
import { PlaitGeometry, ShapeEngine } from '../../interfaces';
import { Options } from 'roughjs/bin/core';
import { getPolygonEdgeByConnectionPoint } from '../../utils/polygon';
import { getStrokeWidthByElement } from '../../utils';
import { ShapeDefaultSpace } from '../../constants';
import { getNearestPointBetweenPointAndArc } from '@plait/core';


export function generateCloudPath(rectangle: RectangleClient): { startPoint: Point; arcCommands: SVGArcCommand[] } {
    const divisionWidth = rectangle.width / 7;
    const divisionHeight = rectangle.height / 3.2;
    const xRadius = divisionWidth / 8.5;
    const yRadius = divisionHeight / 20;

    const startPoint = [rectangle.x + divisionWidth, rectangle.y + divisionHeight] as Point;

    const arcCommands: SVGArcCommand[] = [
        {
            rx: xRadius,
            ry: yRadius * 1.2,
            xAxisRotation: 0,
            largeArcFlag: 1,
            sweepFlag: 1,
            endX: rectangle.x + divisionWidth * 2,
            endY: rectangle.y + divisionHeight / 2
        },
        {
            rx: xRadius,
            ry: yRadius,
            xAxisRotation: 0,
            largeArcFlag: 1,
            sweepFlag: 1,
            endX: rectangle.x + divisionWidth * 4.2,
            endY: rectangle.y + divisionHeight / 2.2
        },
        {
            rx: xRadius,
            ry: yRadius,
            xAxisRotation: 0,
            largeArcFlag: 1,
            sweepFlag: 1,
            endX: rectangle.x + divisionWidth * 5.8,
            endY: rectangle.y + divisionHeight
        },
        {
            rx: xRadius,
            ry: yRadius * 1.3,
            xAxisRotation: 0,
            largeArcFlag: 1,
            sweepFlag: 1,
            endX: rectangle.x + divisionWidth * 6,
            endY: rectangle.y + divisionHeight * 2.2
        },
        {
            rx: xRadius,
            ry: yRadius * 1.2,
            xAxisRotation: 0,
            largeArcFlag: 1,
            sweepFlag: 1,
            endX: rectangle.x + divisionWidth * 5,
            endY: rectangle.y + divisionHeight * 2.8
        },
        {
            rx: xRadius,
            ry: yRadius / 1.2,
            xAxisRotation: 0,
            largeArcFlag: 1,
            sweepFlag: 1,
            endX: rectangle.x + divisionWidth * 2.8,
            endY: rectangle.y + divisionHeight * 2.8
        },
        {
            rx: xRadius,
            ry: yRadius,
            xAxisRotation: 0,
            largeArcFlag: 1,
            sweepFlag: 1,
            endX: rectangle.x + divisionWidth,
            endY: rectangle.y + divisionHeight * 2.2
        },
        {
            rx: xRadius,
            ry: yRadius * 1.42,
            xAxisRotation: 0,
            largeArcFlag: 1,
            sweepFlag: 1,
            endX: rectangle.x + divisionWidth,
            endY: rectangle.y + divisionHeight
        }
    ];

    return { startPoint, arcCommands };
}

export const CloudEngine: ShapeEngine = {
    draw(board: PlaitBoard, rectangle: RectangleClient, options: Options) {
        const rs = PlaitBoard.getRoughSVG(board);
        const { startPoint, arcCommands } = generateCloudPath(rectangle);

        const pathData =
            `M ${startPoint[0]} ${startPoint[1]} ` +
            arcCommands
                .map((command) => `A ${command.rx} ${command.ry} ${command.xAxisRotation} ${command.largeArcFlag} ${command.sweepFlag} ${command.endX} ${command.endY}`)
                .join('\n') +
            ' Z';

        const svgElement = rs.path(pathData, { ...options, fillStyle: 'solid' });
        setPathStrokeLinecap(svgElement, 'round');
        return svgElement;
    },
    isInsidePoint(rectangle: RectangleClient, point: Point) {
        const rangeRectangle = RectangleClient.getRectangleByPoints([point, point]);
        return RectangleClient.isHit(rectangle, rangeRectangle);
    },
    getCornerPoints(rectangle: RectangleClient) {
        return RectangleClient.getCornerPoints(rectangle);
    },
    getNearestPoint(rectangle: RectangleClient, point: Point) {
        const { startPoint, arcCommands } = generateCloudPath(rectangle);
        let minDistance = Infinity;
        let nearestPoint = point;

        let currentStart = startPoint;
        for (const arcCommand of arcCommands) {
            const arcNearestPoint = getNearestPointBetweenPointAndArc(point, currentStart, arcCommand);
            const distance = distanceBetweenPointAndPoint(point[0], point[1], arcNearestPoint[0], arcNearestPoint[1]);

            if (distance < minDistance) {
                minDistance = distance;
                nearestPoint = arcNearestPoint;
            }

            currentStart = [arcCommand.endX, arcCommand.endY];
        }

        return nearestPoint;
    },
    getEdgeByConnectionPoint(rectangle: RectangleClient, pointOfRectangle: PointOfRectangle): [Point, Point] | null {
        const corners = CloudEngine.getCornerPoints(rectangle);
        const point = RectangleClient.getConnectionPoint(rectangle, pointOfRectangle);
        return getPolygonEdgeByConnectionPoint(corners, point);
    },
    getConnectorPoints(rectangle: RectangleClient) {
        return RectangleClient.getEdgeCenterPoints(rectangle);
    },
    getTextRectangle(element: PlaitGeometry) {
        const elementRectangle = RectangleClient.getRectangleByPoints(element.points!);
        const strokeWidth = getStrokeWidthByElement(element);
        const height = element.textHeight!;
        const originWidth = elementRectangle.width - ShapeDefaultSpace.rectangleAndText * 2 - strokeWidth * 2;
        const width = originWidth / 1.5;
        return {
            height,
            width: width > 0 ? width : 0,
            x: elementRectangle.x + ShapeDefaultSpace.rectangleAndText + strokeWidth + originWidth / 6,
            y: elementRectangle.y + elementRectangle.height / 6 + ((elementRectangle.height * 4) / 6 - height) / 2
        };
    }
};
