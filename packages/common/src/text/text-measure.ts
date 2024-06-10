import { Node } from 'slate';
import { CustomText, ParagraphElement } from './types';
import { getLineHeightByFontSize } from '../utils/text';

export function measureElement(
    element: ParagraphElement,
    options: {
        fontSize: number;
        fontFamily: string;
    },
    containerMaxWidth: number = 10000
) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const textEntries = Node.texts(element);
    const lines: CustomText[][] = [[]];
    for (const textEntry of textEntries) {
        const [text] = textEntry;
        const textString = Node.string(text);
        const textArray = textString.split('\n');
        textArray.forEach((segmentTextString: string, index: number) => {
            const segmentText = { ...text, text: segmentTextString };
            if (index === 0) {
                const currentLine = lines[lines.length - 1];
                currentLine.push(segmentText);
            } else {
                const newLine: CustomText[] = [];
                newLine.push(segmentText);
                lines.push(newLine);
            }
        });
    }
    let width = 0;
    let height = 0;
    lines.forEach((lineTexts: CustomText[], index: number) => {
        let lineWidth = 0;
        let maxLineHeight = getLineHeightByFontSize(options.fontSize);
        lineTexts.forEach((text: CustomText, index: number) => {
            const font = getFont(text, { fontFamily: options.fontFamily, fontSize: options.fontSize });
            ctx.font = font;
            const textMetrics = ctx.measureText(text.text);
            lineWidth += textMetrics.width;
            const isLast = index === lineTexts.length - 1;
            // skip when text is empty and is not last text of line
            if (text['font-size'] && (isLast || text.text !== '')) {
                const lineHeight = getLineHeightByFontSize(parseFloat(text['font-size']));
                if (lineHeight > maxLineHeight) {
                    maxLineHeight = lineHeight;
                }
            }
        });
        if (lineWidth <= containerMaxWidth) {
            if (lineWidth > width) {
                width = lineWidth;
            }
            height += maxLineHeight;
        } else {
            width = containerMaxWidth;
            const lineWrapNumber = Math.ceil(lineWidth / containerMaxWidth);
            height += maxLineHeight * lineWrapNumber;
        }
    });
    return { width, height };
}

const getFont = (
    text: CustomText,
    options: {
        fontSize: number;
        fontFamily: string;
    }
) => {
    return `${text.italic ? 'italic ' : ''} ${text.bold ? 'bold ' : ''} ${text['font-size'] || options.fontSize}px ${options.fontFamily} `;
};
