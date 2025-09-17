import { DEFAULT_FONT_FAMILY, ElementSize, getElementSize, ParagraphElement } from '@plait/common';
import { PlaitBoard } from '@plait/core';
import { DEFAULT_FONT_SIZE } from '@plait/text-plugins';
import { MIN_TEXT_WIDTH } from '../constants';

export const getTextSize = (board: PlaitBoard, text: ParagraphElement, maxWidth?: number): ElementSize => {
    const textSize = getElementSize(board, text, { fontSize: DEFAULT_FONT_SIZE, fontFamily: DEFAULT_FONT_FAMILY }, maxWidth);
    const normalizedTextSize = normalizeWidthAndHeight(textSize);
    return normalizedTextSize;
};

export const normalizeWidthAndHeight = (textSize: ElementSize) => {
    return { ...textSize, width: textSize.width < MIN_TEXT_WIDTH ? MIN_TEXT_WIDTH : textSize.width };
};
