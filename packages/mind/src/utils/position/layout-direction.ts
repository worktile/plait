import { PlaitBoard } from '@plait/core';
import { MindLayoutType, isHorizontalLayout, isIndentedLayout } from '@plait/layouts';
import { LayoutDirection, MindElement, PlaitMind } from '../../interfaces';
import { MindQueries } from '../../queries';
import { getLayoutReverseDirection } from '../layout';
import { getLayoutDirection as getNodeLayoutDirection } from '../point-placement';

export type LayoutRelation =
    | {
          type: 'parent-child';
          parent: MindElement;
          child: MindElement;
      }
    | {
          type: 'sibling';
          parent: MindElement;
          order: 'previous' | 'next';
      };

const isLayoutRoot = (element: MindElement) => {
    return PlaitMind.isMind(element) || !!element.layout;
};

export const resolveLayoutRelationDirection = (board: PlaitBoard, relation: LayoutRelation): LayoutDirection => {
    const layout = MindQueries.getCorrectLayoutByElement(board, relation.parent) as MindLayoutType;
    const parentNode = MindElement.getNode(relation.parent);

    if (relation.type === 'sibling') {
        // Siblings follow the cross axis and keep the parent's final mirrored orientation.
        const isSiblingHorizontal = !isHorizontalLayout(layout);
        const nextDirection = getNodeLayoutDirection(parentNode, isSiblingHorizontal);

        return relation.order === 'next' ? nextDirection : getLayoutReverseDirection(nextDirection);
    }

    if (isIndentedLayout(layout) && isLayoutRoot(relation.parent)) {
        return getNodeLayoutDirection(parentNode, false);
    }

    return getNodeLayoutDirection(MindElement.getNode(relation.child), isHorizontalLayout(layout));
};
