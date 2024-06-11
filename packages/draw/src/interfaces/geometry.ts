import { PlaitElement, Point } from '@plait/core';
import { StrokeStyle } from './element';
import { PlaitDrawShapeText } from '../generators/text.generator';
import { ParagraphElement } from '@plait/common';

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
    roundComment = 'roundComment',
    cloud = 'cloud'
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
    storedData = 'storedData',
    or = 'or',
    summingJunction = 'summingJunction',
    predefinedProcess = 'predefinedProcess',
    offPage = 'offPage',
    document = 'document',
    multiDocument = 'multiDocument',
    database = 'database',
    hardDisk = 'hardDisk',
    internalStorage = 'internalStorage',
    noteCurlyRight = 'noteCurlyRight',
    noteCurlyLeft = 'noteCurlyLeft',
    noteSquare = 'noteSquare',
    display = 'display'
}

export enum UMLSymbols {
    actor = 'actor',
    useCase = 'useCase',
    container = 'container',
    note = 'note',
    simpleClass = 'simpleClass',
    activityClass = 'activityClass',
    branchMerge = 'branchMerge',
    port = 'port',
    package = 'package',
    combinedFragment = 'combinedFragment',
    class = 'class',
    interface = 'interface',
    object = 'object',
    component = 'component',
    componentBox = 'componentBox',
    template = 'template',
    activation = 'activation',
    deletion = 'deletion',
    assembly = 'assembly',
    providedInterface = 'providedInterface',
    requiredInterface = 'requiredInterface'
}

export enum MultipleTextGeometryCommonTextKeys {
    name = 'name',
    content = 'content'
}

export type GeometryShapes = BasicShapes | FlowchartSymbols | UMLSymbols;

export type SwimlaneDirection = 'horizontal' | 'vertical';

export interface PlaitBaseGeometry extends PlaitElement {
    type: 'geometry';
    points: [Point, Point];
    shape: GeometryShapes;
}

export interface PlaitCommonGeometry extends PlaitBaseGeometry {
    // node style attributes
    fill?: string;
    strokeColor?: string;
    strokeWidth?: number;
    strokeStyle?: StrokeStyle;

    angle?: number;
    opacity?: number;
}

export interface PlaitMultipleTextGeometry extends PlaitCommonGeometry {
    texts: PlaitDrawShapeText[];
}

export interface PlaitGeometry extends PlaitCommonGeometry {
    text?: ParagraphElement;
    textHeight?: number;
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

export const PlaitGeometry = {};
