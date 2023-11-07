import { PlaitBoard, PlaitElement, Point, PointOfRectangle, RectangleClient, Vector } from '@plait/core';
import { GeometryComponent } from '../geometry.component';
import { Options } from 'roughjs/bin/core';
import { ParagraphElement } from '@plait/text';
import { StrokeStyle } from './element';

export enum BasicShapes {
    rectangle = 'rectangle',
    ellipse = 'ellipse',
    diamond = 'diamond',
    roundRectangle = 'roundRectangle',
    parallelogram = 'parallelogram',
    text = 'text',
    triangle = 'triangle',
    leftArrow = 'leftArrow',
    trapezoid = 'trapezoid',
    rightArrow = 'rightArrow',
    cross = 'cross',
    star = 'star',
    pentagon = 'pentagon',
    hexagon = 'hexagon',
    octagon = 'octagon',
    pentagonArrow = 'pentagonArrow',
    processArrow = 'processArrow',
    twoWayArrow = 'twoWayArrow',
    comment = 'comment',
    roundComment = 'roundComment'
}

export enum FlowchartSymbols {
    process = 'process',
    decision = 'decision',
    data = 'data',
    connector = 'connector',
    terminal = 'terminal',
    manualInput = 'manualInput',
    preparation = 'preparation',
    manualLoop = 'manualLoop',
    merge = 'merge',
    delay = 'delay',
    storedData = 'storedData'
}

export type GeometryShapes = BasicShapes | FlowchartSymbols;

export interface PlaitGeometry extends PlaitElement {
    points: [Point, Point];
    type: 'geometry';
    shape: GeometryShapes;

    text: ParagraphElement;
    textHeight: number;

    // node style attributes
    fill?: string;
    strokeColor?: string;
    strokeWidth?: number;
    strokeStyle?: StrokeStyle;

    angle: number;
    opacity: number;
}

export interface PlaitRectangle extends PlaitGeometry {
    shape: BasicShapes.rectangle;
}

export interface PlaitEllipse extends PlaitGeometry {
    shape: BasicShapes.ellipse;
}

export interface PlaitDiamond extends PlaitGeometry {
    shape: BasicShapes.diamond;
}

export const PlaitGeometry = {
    getTextEditor(element: PlaitGeometry) {
        return PlaitGeometry.getTextManage(element).componentRef.instance.editor;
    },
    getTextManage(element: PlaitGeometry) {
        const component = PlaitElement.getComponent(element) as GeometryComponent;
        if (component) {
            return component.textManage;
        }
        throw new Error('can not get correctly component in get text editor');
    }
};

export interface ShapeEngine {
    isHit: (rectangle: RectangleClient, point: Point) => boolean;
    getNearestPoint: (rectangle: RectangleClient, point: Point) => Point;
    getConnectorPoints: (rectangle: RectangleClient) => Point[];
    getCornerPoints: (rectangle: RectangleClient) => Point[];
    getEdgeByConnectionPoint?: (rectangle: RectangleClient, point: PointOfRectangle) => [Point, Point] | null;
    getTangentVectorByConnectionPoint?: (rectangle: RectangleClient, point: PointOfRectangle) => Vector | null;
    draw: (board: PlaitBoard, rectangle: RectangleClient, options: Options) => SVGGElement;
    getTextRectangle?: (element: PlaitGeometry) => RectangleClient;
}
