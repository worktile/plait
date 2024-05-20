import { Point, RectangleClient, idCreator } from '@plait/core';
import {
    GeometryShapes,
    UMLSymbols,
    PlaitMultipleTextGeometry,
    MultipleTextGeometryCommonTextKeys,
    PlaitCommonGeometry
} from '../interfaces/geometry';
import { Alignment, buildText } from '@plait/text';
import { DefaultTextProperty, MultipleTextGeometryTextKeys } from '../constants';
import { getEngine } from '../engines';
import { getMemorizedLatestByPointer } from './memorize';
import { PlaitDrawShapeText } from '../generators/text.generator';
import { GeometryStyleOptions, getDefaultGeometryProperty } from './geometry';

export const isMultipleTextShape = (shape: GeometryShapes) => {
    return [UMLSymbols.package, UMLSymbols.combinedFragment].includes(shape as UMLSymbols);
};

export const isMultipleTextGeometry = (geometry: PlaitCommonGeometry): geometry is PlaitMultipleTextGeometry => {
    return !!geometry.texts;
};

export const getMultipleTextGeometryTextKeys = (shape: GeometryShapes) => {
    return MultipleTextGeometryTextKeys[shape];
};

export const createMultipleTextGeometryElement = (
    shape: GeometryShapes,
    points: [Point, Point],
    options: GeometryStyleOptions = {}
): PlaitMultipleTextGeometry => {
    const id = idCreator();
    const drawShapeTexts: PlaitDrawShapeText[] = buildDefaultTextsByShape(shape, id);
    return {
        id,
        type: 'geometry',
        shape,
        angle: 0,
        opacity: 1,
        texts: drawShapeTexts,
        points,
        ...options
    };
};

export const buildDefaultTextsByShape = (shape: GeometryShapes, elementId: string) => {
    const memorizedLatest = getMemorizedLatestByPointer(shape);
    const textProperties = { ...memorizedLatest.textProperties };
    const alignment = textProperties?.align;
    const textHeight = textProperties?.textHeight || DefaultTextProperty.height;
    delete textProperties?.align;
    delete textProperties?.textHeight;
    const defaultProperty = (getDefaultGeometryProperty(shape) as unknown) as PlaitMultipleTextGeometry;
    const defaultTexts = defaultProperty.texts || [];
    const textKeys = getMultipleTextGeometryTextKeys(shape);
    return (textKeys || []).map((textKey: string) => {
        const text = defaultTexts?.find((item: PlaitDrawShapeText) => item?.key === textKey);
        return {
            key: `${elementId}-${textKey}`,
            text: buildText(text?.text || '', alignment || defaultProperty.align || Alignment.center, textProperties),
            textHeight: textHeight
        };
    });
};

export const getHitText = (element: PlaitMultipleTextGeometry, point: Point) => {
    const engine = getEngine<PlaitMultipleTextGeometry>(element.shape);
    const rectangle = RectangleClient.getRectangleByPoints([point, point]);
    let hitText;
    if (engine.getTextRectangle) {
        hitText = element.texts.find(text => {
            const textRectangle = engine.getTextRectangle!(element, { key: text.key });
            return RectangleClient.isHit(rectangle, textRectangle);
        });
    }
    return hitText || element.texts.find(item => item.key.includes(MultipleTextGeometryCommonTextKeys.content)) || element.texts[0];
};

export const getElementTextKeyByName = (element: PlaitMultipleTextGeometry, textName: string) => {
    return `${element.id}-${textName}`;
};
