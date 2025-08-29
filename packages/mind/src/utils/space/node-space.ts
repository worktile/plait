import { BASE, WithMindPluginKey } from '../../constants/default';
import { PlaitMind } from '../../interfaces/element';
import { MindElement } from '../../interfaces/element';
import { EmojiData } from '../../interfaces/element-data';
import { WithMindOptions } from '../../interfaces/options';
import { PlaitMindBoard } from '../../plugins/with-mind.board';
import { getEmojisWidthHeight } from './emoji';
import { Element } from 'slate';
import { getStrokeWidthByElement } from '../node-style/shape';
import { getDefaultMindElementFontSize } from '../mind';
import { DEFAULT_FONT_SIZE, getFirstTextMarks, MarkTypes, PlaitMarkEditor } from '@plait/text-plugins';
import { DEFAULT_FONT_FAMILY, getElementSize, getFirstTextEditor } from '@plait/common';
import { NodeTopicThreshold } from '../../constants/node-topic-style';

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
    const strokeWidth = getStrokeWidthByElement(board, element);
    return nodeAndText + strokeWidth;
};

const getVerticalSpaceBetweenNodeAndText = (board: PlaitMindBoard, element: MindElement) => {
    const isMind = PlaitMind.isMind(element);
    const strokeWidth = getStrokeWidthByElement(board, element);
    const nodeAndText = isMind ? RootDefaultSpace.vertical.nodeAndText : NodeDefaultSpace.vertical.nodeAndText;
    return nodeAndText + strokeWidth;
};

const getSpaceEmojiAndText = (element: MindElement) => {
    const isMind = PlaitMind.isMind(element);
    const emojiAndText = isMind ? RootDefaultSpace.horizontal.emojiAndText : NodeDefaultSpace.horizontal.emojiAndText;
    return emojiAndText;
};

export const NodeSpace = {
    getNodeWidth(board: PlaitMindBoard, element: MindElement) {
        const nodeAndText = getHorizontalSpaceBetweenNodeAndText(board, element);
        if (MindElement.hasEmojis(element)) {
            return (
                NodeSpace.getEmojiLeftSpace(board, element) +
                getEmojisWidthHeight(board, element).width +
                getSpaceEmojiAndText(element) +
                NodeSpace.getTopicDynamicWidth(board, element) +
                nodeAndText
            );
        }
        return nodeAndText + NodeSpace.getTopicDynamicWidth(board, element) + nodeAndText;
    },
    getNodeHeight(board: PlaitMindBoard, element: MindElement) {
        const topicSize = getElementSize(
            board,
            element.data.topic,
            { fontSize: DEFAULT_FONT_SIZE, fontFamily: DEFAULT_FONT_FAMILY },
            NodeSpace.getTopicMaxDynamicWidth(board, element)
        );
        const normalizedSize = normalizeWidthAndHeight(board, element, topicSize.width, topicSize.height);
        const nodeAndText = getVerticalSpaceBetweenNodeAndText(board, element);
        if (MindElement.hasImage(element)) {
            return NodeSpace.getTextTopSpace(board, element) + normalizedSize.height + nodeAndText;
        }
        return nodeAndText + normalizedSize.height + nodeAndText;
    },
    getTopicDynamicWidth(board: PlaitMindBoard, element: MindElement) {
        const topicSize = getElementSize(
            board,
            element.data.topic,
            { fontSize: getDefaultMindElementFontSize(board, element), fontFamily: DEFAULT_FONT_FAMILY },
            NodeSpace.getTopicMaxDynamicWidth(board, element)
        );
        const normalizedSize = normalizeWidthAndHeight(board, element, topicSize.width, topicSize.width);
        const width = element.manualWidth || normalizedSize.width;
        const imageWidth = MindElement.hasImage(element) ? element.data.image?.width : 0;
        return Math.max(width, imageWidth);
    },
    getTopicHeight(board: PlaitMindBoard, element: MindElement) {
        const topicSize = getElementSize(
            board,
            element.data.topic,
            { fontSize: DEFAULT_FONT_SIZE, fontFamily: DEFAULT_FONT_FAMILY },
            NodeSpace.getTopicMaxDynamicWidth(board, element)
        );
        const normalizedSize = normalizeWidthAndHeight(board, element, topicSize.width, topicSize.height);
        return normalizedSize.height;
    },
    getTopicMaxDynamicWidth(board: PlaitMindBoard, element: MindElement) {
        return Math.max(
            NodeTopicThreshold.defaultTextMaxWidth,
            element.manualWidth || 0,
            MindElement.hasImage(element) ? element.data.image?.width : 0
        );
    },
    /**
     * use it when upload image first or resize image
     */
    getNodeNewDynamicWidth(board: PlaitMindBoard, element: MindElement, imageWidth: number) {
        const width = element.manualWidth || element.width;
        return Math.max(width, imageWidth);
    },
    getNodeResizableMinWidth(board: PlaitMindBoard, element: MindElement) {
        const minTopicWidth = NodeSpace.getNodeTopicMinWidth(board, element);
        if (MindElement.hasImage(element) && element.data.image.width > minTopicWidth) {
            return element.data.image.width;
        } else {
            return minTopicWidth;
        }
    },
    getNodeTopicMinWidth(board: PlaitMindBoard, element: MindElement) {
        const defaultFontSize = getDefaultMindElementFontSize(board, element);
        const firstText = getFirstTextMarks(element.data.topic);
        const fontSize = (firstText[MarkTypes.fontSize] ? Number(firstText[MarkTypes.fontSize]) : null) || defaultFontSize;
        return fontSize;
    },
    getTextLeftSpace(board: PlaitMindBoard, element: MindElement) {
        const nodeAndText = getHorizontalSpaceBetweenNodeAndText(board, element);
        if (MindElement.hasEmojis(element)) {
            return NodeSpace.getEmojiLeftSpace(board, element) + getEmojisWidthHeight(board, element).width + getSpaceEmojiAndText(element);
        } else {
            return nodeAndText;
        }
    },
    getTextTopSpace(board: PlaitMindBoard, element: MindElement) {
        const nodeAndText = getVerticalSpaceBetweenNodeAndText(board, element);
        if (MindElement.hasImage(element)) {
            return NodeSpace.getImageTopSpace(board, element) + element.data.image.height + NodeDefaultSpace.vertical.imageAndText;
        } else {
            return nodeAndText;
        }
    },
    getImageTopSpace(board: PlaitMindBoard, element: MindElement) {
        const strokeWidth = getStrokeWidthByElement(board, element);
        return strokeWidth + NodeDefaultSpace.vertical.nodeAndImage;
    },
    getEmojiLeftSpace(board: PlaitMindBoard, element: MindElement<EmojiData>) {
        const options = board.getPluginOptions<WithMindOptions>(WithMindPluginKey);
        const nodeAndText = getHorizontalSpaceBetweenNodeAndText(board, element);
        return nodeAndText - options.emojiPadding;
    },
    getEmojiTopSpace(board: PlaitMindBoard, element: MindElement) {
        const nodeAndText = getVerticalSpaceBetweenNodeAndText(board, element);
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

export const normalizeWidthAndHeight = (board: PlaitMindBoard, element: MindElement, width: number, height: number) => {
    const minWidth = NodeSpace.getNodeTopicMinWidth(board, element);
    const newWidth = width < minWidth ? minWidth : width;
    return { width: newWidth, height };
};
