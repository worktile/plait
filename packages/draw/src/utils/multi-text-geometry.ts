import { PlaitElement, Point, RectangleClient, idCreator } from '@plait/core';
import { GeometryShapes, UMLSymbols, PlaitMultipleTextGeometry } from '../interfaces/geometry';
import { DefaultTextProperty, GEOMETRY_WITH_MULTIPLE_TEXT, MultipleTextGeometryTextKeys } from '../constants';
import { getEngine } from '../engines';
import { getMemorizedLatestByPointer } from './memorize';
import { DrawTextInfo } from '../generators/text.generator';
import { GeometryStyleOptions, getDefaultGeometryProperty } from './geometry';
import { PlaitDrawElement } from '../interfaces';
import { Alignment, buildText } from '@plait/common';

export const isMultipleTextShape = (shape: GeometryShapes) => {
    return GEOMETRY_WITH_MULTIPLE_TEXT.includes(shape as UMLSymbols);
};

export const isMultipleTextGeometry = (geometry: PlaitElement): geometry is PlaitMultipleTextGeometry => {
    return PlaitDrawElement.isGeometry(geometry) && isMultipleTextShape(geometry.shape);
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
    const drawShapeTexts: DrawTextInfo[] = buildDefaultTextsByShape(shape);
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

export const buildDefaultTextsByShape = (shape: GeometryShapes): DrawTextInfo[] => {
    const memorizedLatest = getMemorizedLatestByPointer(shape);
    const textProperties = { ...memorizedLatest.textProperties };
    const alignment = textProperties?.align;
    const textHeight = textProperties?.textHeight || DefaultTextProperty.height;
    delete textProperties?.align;
    delete textProperties?.textHeight;
    const defaultTexts = (getDefaultGeometryProperty(shape) as any)?.texts || [];
    const textKeys = getMultipleTextGeometryTextKeys(shape);
    return (textKeys || []).map((textKey: string) => {
        const text = defaultTexts?.find((item: { key: string }) => item?.key === textKey);
        return {
            id: textKey,
            text: buildText(text?.text || '', alignment || text?.align || Alignment.center, textProperties),
            textHeight: textHeight
        };
    });
};

export const getHitMultipleGeometryText = (element: PlaitMultipleTextGeometry, point: Point) => {
    const engine = getEngine<PlaitMultipleTextGeometry>(element.shape);
    const rectangle = RectangleClient.getRectangleByPoints([point, point]);
    let hitText;
    if (engine.getTextRectangle) {
        hitText = element.texts.find(text => {
            const textRectangle = engine.getTextRectangle!(element, { id: text.id });
            return RectangleClient.isHit(rectangle, textRectangle);
        });
    }
    return hitText;
};
