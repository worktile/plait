import { DEFAULT_FONT_SIZE, MarkTypes, PlaitMarkEditor } from '@plait/text';
import { BASE } from '../../constants/default';
import { PlaitMind } from '../../interfaces/element';
import { MindElement } from '../../interfaces/element';
import { EmojiData } from '../../interfaces/element-data';
import { WithMindOptions } from '../../interfaces/options';
import { PlaitMindBoard } from '../../plugins/with-mind.board';
import { WithMindPluginKey, getStrokeWidthByElement } from '../../public-api';
import { getEmojisWidthHeight } from './emoji';
import { Element } from 'slate';
import { ROOT_TOPIC_FONT_SIZE } from '../../constants/node-topic-style';

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
    return nodeAndText + strokeWidth / 2;
};

const getVerticalSpaceBetweenNodeAndText = (board: PlaitMindBoard, element: MindElement) => {
    const isMind = PlaitMind.isMind(element);
    const strokeWidth = getStrokeWidthByElement(board, element);
    const nodeAndText = isMind ? RootDefaultSpace.vertical.nodeAndText : NodeDefaultSpace.vertical.nodeAndText;
    return nodeAndText + strokeWidth / 2;
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
                NodeSpace.getNodeResizableWidth(board, element) +
                nodeAndText
            );
        }
        return nodeAndText + NodeSpace.getNodeResizableWidth(board, element) + nodeAndText;
    },
    getNodeHeight(board: PlaitMindBoard, element: MindElement) {
        const nodeAndText = getVerticalSpaceBetweenNodeAndText(board, element);
        if (MindElement.hasImage(element)) {
            return NodeSpace.getTextTopSpace(board, element) + element.height + nodeAndText;
        }
        return nodeAndText + element.height + nodeAndText;
    },
    getNodeResizableWidth(board: PlaitMindBoard, element: MindElement) {
        const imageWidth = MindElement.hasImage(element) ? element.data.image?.width : 0;
        return element.manualWidth || Math.max(element.width, imageWidth);
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

        return strokeWidth / 2 + NodeDefaultSpace.vertical.nodeAndImage;
    },
    getEmojiLeftSpace(board: PlaitMindBoard, element: MindElement<EmojiData>) {
        const options = board.getPluginOptions<WithMindOptions>(WithMindPluginKey);
        const nodeAndText = getHorizontalSpaceBetweenNodeAndText(board, element);
        const strokeWidth = getStrokeWidthByElement(board, element);

        return strokeWidth / 2 + nodeAndText - options.emojiPadding;
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

export const getNodeDefaultFontSize = (isRoot = false) => {
    const defaultFontSize = isRoot ? ROOT_TOPIC_FONT_SIZE : DEFAULT_FONT_SIZE;
    return defaultFontSize;
};
