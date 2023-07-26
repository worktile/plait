import { DEFAULT_FONT_SIZE, MarkTypes, PlaitMarkEditor } from '@plait/text';
import { BASE, WithMindPluginKey } from '../../constants/default';
import { PlaitMind } from '../../interfaces/element';
import { MindElement } from '../../interfaces/element';
import { EmojiData } from '../../interfaces/element-data';
import { WithMindOptions } from '../../interfaces/options';
import { PlaitMindBoard } from '../../plugins/with-mind.board';
import { getEmojisWidthHeight } from './emoji';
import { Element } from 'slate';
import { ROOT_TOPIC_FONT_SIZE } from '../../constants/node-topic-style';
import { getStrokeWidthByElement } from '../node-style';

const NodeDefaultSpace = {
    horizontal: {
        nodeAndText: BASE * 2.5,
        emojiAndText: BASE * 1.5
    },
    vertical: {
        nodeAndText: BASE,
        nodeAndImage: BASE,
        imageAndText: BASE * 1.5
    }
};

const RootDefaultSpace = {
    horizontal: {
        nodeAndText: BASE * 4,
        emojiAndText: BASE * 2
    },
    vertical: {
        nodeAndText: BASE * 2
    }
};

const getHorizontalSpaceBetweenNodeAndText = (board: PlaitMindBoard, element: MindElement) => {
    const isMind = PlaitMind.isMind(element);
    const nodeAndText = isMind ? RootDefaultSpace.horizontal.nodeAndText : NodeDefaultSpace.horizontal.nodeAndText;
    return nodeAndText;
};

const getVerticalSpaceBetweenNodeAndText = (element: MindElement) => {
    const isMind = PlaitMind.isMind(element);
    const nodeAndText = isMind ? RootDefaultSpace.vertical.nodeAndText : NodeDefaultSpace.vertical.nodeAndText;
    return nodeAndText;
};

const getSpaceEmojiAndText = (element: MindElement) => {
    const isMind = PlaitMind.isMind(element);
    const emojiAndText = isMind ? RootDefaultSpace.horizontal.emojiAndText : NodeDefaultSpace.horizontal.emojiAndText;
    return emojiAndText;
};

export const NodeSpace = {
    getNodeWidth(board: PlaitMindBoard, element: MindElement) {
        const nodeAndText = getHorizontalSpaceBetweenNodeAndText(board, element);
        let rightSpace = nodeAndText;
        if (MindElement.hasImage(element) && element.data.image.width > element.width) {
            rightSpace = BASE;
        }

        const strokeWidth = getStrokeWidthByElement(board, element);

        if (MindElement.hasEmojis(element)) {
            return (
                NodeSpace.getEmojiLeftSpace(board, element) +
                getEmojisWidthHeight(board, element).width +
                getSpaceEmojiAndText(element) +
                NodeSpace.getNodeResizableWidth(board, element) +
                rightSpace +
                strokeWidth / 2
            );
        }
        return strokeWidth / 2 + nodeAndText + NodeSpace.getNodeResizableWidth(board, element) + rightSpace + strokeWidth / 2;
    },
    getNodeHeight(board: PlaitMindBoard, element: MindElement) {
        const nodeAndText = getVerticalSpaceBetweenNodeAndText(element);
        const strokeWidth = getStrokeWidthByElement(board, element);

        if (MindElement.hasImage(element)) {
            return (
                strokeWidth / 2 +
                NodeDefaultSpace.vertical.nodeAndImage +
                element.data.image.height +
                NodeDefaultSpace.vertical.imageAndText +
                element.height +
                nodeAndText +
                strokeWidth / 2
            );
        }
        return strokeWidth / 2 + nodeAndText + element.height + nodeAndText + strokeWidth / 2;
    },
    getNodeResizableWidth(board: PlaitMindBoard, element: MindElement) {
        const imageWidth = MindElement.hasImage(element) ? element.data.image?.width : 0;
        return Math.max(element.width, imageWidth);
    },
    getNodeResizableMinWidth(board: PlaitMindBoard, element: MindElement) {
        const minTopicWidth = NodeSpace.getNodeTopicMinWidth(board, element);
        if (MindElement.hasImage(element) && element.data.image.width > minTopicWidth) {
            return element.data.image.width;
        } else {
            return minTopicWidth;
        }
    },
    getNodeTopicMinWidth(board: PlaitMindBoard, element: MindElement, isRoot: boolean = false) {
        const defaultFontSize = getNodeDefaultFontSize(isRoot);
        const editor = MindElement.getTextEditor(element);
        const marks = PlaitMarkEditor.getMarks(editor);
        const fontSize = (marks[MarkTypes.fontSize] as number) || defaultFontSize;
        return fontSize;
    },
    getTextLeftSpace(board: PlaitMindBoard, element: MindElement) {
        const nodeAndText = getHorizontalSpaceBetweenNodeAndText(board, element);
        const strokeWidth = getStrokeWidthByElement(board, element);
        if (MindElement.hasEmojis(element)) {
            return NodeSpace.getEmojiLeftSpace(board, element) + getEmojisWidthHeight(board, element).width + getSpaceEmojiAndText(element);
        } else {
            return strokeWidth / 2 + nodeAndText;
        }
    },
    getTextTopSpace(board: PlaitMindBoard, element: MindElement) {
        const nodeAndText = getVerticalSpaceBetweenNodeAndText(element);
        const strokeWidth = getStrokeWidthByElement(board, element);
        if (MindElement.hasImage(element)) {
            return (
                strokeWidth / 2 +
                element.data.image.height +
                NodeDefaultSpace.vertical.nodeAndImage +
                NodeDefaultSpace.vertical.imageAndText
            );
        } else {
            return strokeWidth / 2 + nodeAndText;
        }
    },
    getImageTopSpace(board: PlaitMindBoard, element: MindElement) {
        const strokeWidth = getStrokeWidthByElement(board, element);

        return strokeWidth / 2 + NodeDefaultSpace.vertical.nodeAndImage;
    },
    getEmojiLeftSpace(board: PlaitMindBoard, element: MindElement<EmojiData>) {
        const options = board.getPluginOptions<WithMindOptions>(WithMindPluginKey);
        const nodeAndText = getHorizontalSpaceBetweenNodeAndText(board, element);
        const strokeWidth = getStrokeWidthByElement(board, element);
        return strokeWidth / 2 + nodeAndText - options.emojiPadding;
    },
    getEmojiTopSpace(element: MindElement) {
        const nodeAndText = getVerticalSpaceBetweenNodeAndText(element);
        return nodeAndText;
    }
};

export const getFontSizeBySlateElement = (text: string | Element) => {
    const defaultFontSize = DEFAULT_FONT_SIZE;
    if (typeof text === 'string') {
        return defaultFontSize;
    }
    const marks = PlaitMarkEditor.getMarksByElement(text);
    const fontSize = (marks[MarkTypes.fontSize] as number) || defaultFontSize;
    return fontSize;
};

export const getNodeDefaultFontSize = (isRoot = false) => {
    const defaultFontSize = isRoot ? ROOT_TOPIC_FONT_SIZE : DEFAULT_FONT_SIZE;
    return defaultFontSize;
};
