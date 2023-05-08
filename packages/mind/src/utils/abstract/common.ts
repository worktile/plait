import { AbstractNode } from '@plait/layouts';
import { MindElement } from '../../interfaces/element';

export const separateChildren = (parentElement: MindElement) => {
    const rightNodeCount = parentElement.rightNodeCount!;
    const children = parentElement.children;
    let rightChildren = [],
        leftChildren = [];

    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (AbstractNode.isAbstract(child) && child.end < rightNodeCount) {
            rightChildren.push(child);
            continue;
        }
        if (AbstractNode.isAbstract(child) && child.start >= rightNodeCount) {
            leftChildren.push(child);
            continue;
        }

        if (i < rightNodeCount) {
            rightChildren.push(child);
        } else {
            leftChildren.push(child);
        }
    }

    return { leftChildren, rightChildren };
};
