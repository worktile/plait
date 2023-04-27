import { ConnectingPosition, LayoutNode, LayoutOptions, OriginNode, isHorizontalLayout, isHorizontalLogicLayout, isIndentedLayout } from "@plait/layouts";
import { MindElement } from "./interfaces/element";
import { BASE, STROKE_WIDTH } from "./constants/default";
import { CHILD_NODE_TEXT_HORIZONTAL_GAP, CHILD_NODE_TEXT_VERTICAL_GAP, MindmapNodeShape, ROOT_NODE_TEXT_HORIZONTAL_GAP, ROOT_NODE_TEXT_VERTICAL_GAP } from "./constants/node";
import { getRootLayout } from "./utils/layout";

export const getLayoutOptions = () => {
    function getMainAxle(element: MindElement, parent?: LayoutNode) {
        const strokeWidth = element.strokeWidth || STROKE_WIDTH;
        if (element.isRoot) {
            return BASE * 12;
        }
        if (parent && parent.isRoot()) {
            return BASE * 3 + strokeWidth / 2;
        }
        return BASE * 3 + strokeWidth / 2;
    }

    function getSecondAxle(element: MindElement, parent?: LayoutNode) {
        const strokeWidth = element.strokeWidth || STROKE_WIDTH;
        if (element.isRoot) {
            return BASE * 10 + strokeWidth / 2;
        }
        return BASE * 6 + strokeWidth / 2;
    }

    return {
        getHeight(element: MindElement) {
            const textGap = element.isRoot ? ROOT_NODE_TEXT_VERTICAL_GAP : CHILD_NODE_TEXT_VERTICAL_GAP;
            return element.height + textGap * 2;
        },
        getWidth(element: MindElement) {
            const textGap = element.isRoot ? ROOT_NODE_TEXT_HORIZONTAL_GAP : CHILD_NODE_TEXT_HORIZONTAL_GAP;
            return element.width + textGap * 2;
        },
        getHorizontalGap(element: MindElement, parent?: LayoutNode) {
            const _layout = (parent && parent.layout) || getRootLayout(element);
            const isHorizontal = isHorizontalLayout(_layout);
            const strokeWidth = element.strokeWidth || STROKE_WIDTH;
            if (isIndentedLayout(_layout)) {
                return BASE * 4 + strokeWidth;
            }
            if (!isHorizontal) {
                return getMainAxle(element, parent);
            } else {
                return getSecondAxle(element, parent);
            }
        },
        getVerticalGap(element: MindElement, parent?: LayoutNode) {
            const _layout = (parent && parent.layout) || getRootLayout(element);
            if (isIndentedLayout(_layout)) {
                return BASE;
            }
            const isHorizontal = isHorizontalLayout(_layout);
            if (isHorizontal) {
                return getMainAxle(element, parent);
            } else {
                return getSecondAxle(element, parent);
            }
        },
        getVerticalConnectingPosition(element: MindElement, parent?: LayoutNode) {
            if (element.shape === MindmapNodeShape.underline && parent && isHorizontalLogicLayout(parent.layout)) {
                return ConnectingPosition.bottom;
            }
            return undefined;
        },
        getExtendHeight(node: OriginNode) {
            return BASE * 6;
        },
        getIndentedCrossLevelGap() {
            return BASE * 2;
        }
    } as LayoutOptions;
}