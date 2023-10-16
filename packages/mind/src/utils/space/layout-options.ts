import {
    ConnectingPosition,
    LayoutNode,
    LayoutOptions,
    OriginNode,
    isHorizontalLayout,
    isHorizontalLogicLayout,
    isIndentedLayout
} from '@plait/layouts';
import { MindElement, MindElementShape } from '../../interfaces/element';
import { BASE, STROKE_WIDTH } from '../../constants/default';
import { getRootLayout } from '../layout';
import { NodeSpace } from './node-space';
import { PlaitMindBoard } from '../../plugins/with-mind.board';

export const getLayoutOptions = (board: PlaitMindBoard) => {
    function getMainAxle(element: MindElement, parent?: LayoutNode) {
        if (element.isRoot) {
            return BASE * 12;
        }
        if (parent && parent.isRoot()) {
            return BASE * 3;
        }
        return BASE * 3;
    }

    function getSecondAxle(element: MindElement, parent?: LayoutNode) {
        if (element.isRoot) {
            return BASE * 10;
        }
        return BASE * 6;
    }

    return {
        getHeight(element: MindElement) {
            return NodeSpace.getNodeHeight(board, element);
        },
        getWidth(element: MindElement) {
            return NodeSpace.getNodeWidth(board, element);
        },
        getHorizontalGap(element: MindElement, parent?: LayoutNode) {
            const _layout = (parent && parent.layout) || getRootLayout(element);
            const isHorizontal = isHorizontalLayout(_layout);
            if (isIndentedLayout(_layout)) {
                return BASE * 4;
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
            if (element.shape === MindElementShape.underline && parent && isHorizontalLogicLayout(parent.layout)) {
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
};
