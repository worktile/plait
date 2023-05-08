import { BASE } from '../constants/default';
import { PlaitMind } from '../interfaces/element';
import { MindElement } from '../interfaces/element';
import { getEmojisRectangle } from '../plugins/emoji/emoji';

const NodeDefaultSpace = {
    horizontal: {
        nodeAndText: BASE * 3,
        emojiAndText: BASE * 1.5
    },
    vertical: {
        nodeAndText: BASE * 1.5
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

const getHorizontalSpaceBetweenNodeAndText = (element: MindElement) => {
    const isMind = PlaitMind.isMind(element);
    const nodeAndText = isMind ? RootDefaultSpace.horizontal.nodeAndText : NodeDefaultSpace.horizontal.nodeAndText;
    return nodeAndText;
};

const getHorizontalSpaceEmojiAndText = (element: MindElement) => {
    const isMind = PlaitMind.isMind(element);
    const emojiAndText = isMind ? RootDefaultSpace.horizontal.emojiAndText : NodeDefaultSpace.horizontal.emojiAndText;
    return emojiAndText;
};

const getVerticalSpaceBetweenNodeAndText = (element: MindElement) => {
    const isMind = PlaitMind.isMind(element);
    const nodeAndText = isMind ? RootDefaultSpace.vertical.nodeAndText : NodeDefaultSpace.vertical.nodeAndText;
    return nodeAndText;
};

export const NodeSpace = {
    getNodeWidth(element: MindElement) {
        const nodeAndText = getHorizontalSpaceBetweenNodeAndText(element);
        if (MindElement.hasEmojis(element)) {
            return nodeAndText + getEmojisRectangle(element).width + getHorizontalSpaceEmojiAndText(element) + element.width + nodeAndText;
        }
        return nodeAndText + element.width + nodeAndText;
    },
    getNodeHeight(element: MindElement) {
        const nodeAndText = getVerticalSpaceBetweenNodeAndText(element);
        return nodeAndText + element.height + nodeAndText;
    },
    getTextHorizontalSpace(element: MindElement) {
        const nodeAndText = getHorizontalSpaceBetweenNodeAndText(element);
        if (MindElement.hasEmojis(element)) {
            return nodeAndText + getEmojisRectangle(element).width + getHorizontalSpaceEmojiAndText(element);
        } else {
            return nodeAndText;
        }
    },
    getTextVerticalSpace(element: MindElement) {
        const nodeAndText = getVerticalSpaceBetweenNodeAndText(element);
        return nodeAndText;
    },
    getEmojiHorizontalSpace(element: MindElement) {
        const nodeAndText = getHorizontalSpaceBetweenNodeAndText(element);
        return nodeAndText;
    },
    getEmojiVerticalSpace(element: MindElement) {
        const nodeAndText = getVerticalSpaceBetweenNodeAndText(element);
        return nodeAndText;
    }
};
