import { PlaitBoard, Point, idCreator, isNullOrUndefined } from '@plait/core';
import { MindLayoutType } from '@plait/layouts';
import { BranchShape, MindElement, MindElementShape } from '../../interfaces/element';
import { Element } from 'slate';
import { NodeSpace } from '../space';
import { PlaitMindBoard } from '../../plugins/with-mind.board';
import { buildText } from '@plait/common';
import { getDefaultMindNameText, getTopicSize } from '../common';

export const createEmptyMind = (board: PlaitBoard, point: Point) => {
    const text = getDefaultMindNameText(board);
    const topicSize = getTopicSize(true, false, buildText(text));
    const element = createMindElement(text, topicSize.width, topicSize.height, { layout: MindLayoutType.right });
    element.isRoot = true;
    element.type = 'mindmap';
    const width = NodeSpace.getNodeWidth(board as PlaitMindBoard, element);
    const height = NodeSpace.getNodeHeight(board as PlaitMindBoard, element);
    element.points = [[point[0] - width / 2, point[1] - height / 2]];
    return element;
};

export const createMindElement = (text: string | Element, width: number, height: number, options: InheritAttribute) => {
    const newElement: MindElement = {
        id: idCreator(),
        data: {
            topic: buildText(text)
        },
        children: [],
        width,
        height
    };

    let key: keyof typeof options;
    for (key in options) {
        if (!isNullOrUndefined(options[key])) {
            (newElement as any)[key] = options[key];
        }
    }

    return newElement;
};

export interface InheritAttribute {
    fill?: string;
    strokeColor?: string;
    strokeWidth?: number;
    strokeStyle?: number;
    shape?: MindElementShape;
    layout?: MindLayoutType;
    branchColor?: string;
    branchWidth?: number;
    branchShape?: BranchShape;
}

export const INHERIT_ATTRIBUTE_KEYS = [
    'fill',
    'strokeColor',
    'strokeWidth',
    'strokeStyle',
    'shape',
    'layout',
    'branchColor',
    'branchWidth',
    'branchShape'
];
