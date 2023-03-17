import { CLIP_BOARD_FORMAT_KEY, getSelectedElements, Path, PlaitBoard, PlaitElement, Point, Transforms } from '@plait/core';
import { MindmapNodeElement } from '../interfaces';
import { buildMindmap, buildNodes, extractNodesText, findPath } from '../utils';
import { getRectangleByNode, getRectangleByNodes } from '../utils/graph';
import { MINDMAP_ELEMENT_TO_COMPONENT } from '../utils/weak-maps';
import { MindmapNodeComponent } from '../node.component';

export const buildClipBoardData = (selectedNodes: PlaitElement[]) => {
    let result: PlaitElement[] = [];
    const selectedMindmapNodes = Array.from(selectedNodes, node => {
        return (MINDMAP_ELEMENT_TO_COMPONENT.get(node as MindmapNodeElement) as MindmapNodeComponent)?.node;
    });

    const nodesRectangle = getRectangleByNodes(selectedMindmapNodes);

    selectedNodes.forEach((node, index) => {
        const nodeRectangle = getRectangleByNode(selectedMindmapNodes[index]);
        result.push({
            ...node,
            points: [[nodeRectangle.x - nodesRectangle.x, nodeRectangle.y - nodesRectangle.y]]
        });
    });

    return result;
};

export const setClipBoardData = (data: DataTransfer | null, nodeData: PlaitElement[]) => {
    const stringObj = JSON.stringify(nodeData);
    const encoded = window.btoa(encodeURIComponent(stringObj));
    const text = nodeData.reduce((string, currentNode) => {
        return string + extractNodesText(currentNode.nodeData as MindmapNodeElement);
    }, '');
    data?.setData(`application/${CLIP_BOARD_FORMAT_KEY}`, encoded);
    data?.setData(`text/plain`, text);
};

export const getDataFromClipBoard = (data: DataTransfer | null) => {
    const encoded = data?.getData(`application/${CLIP_BOARD_FORMAT_KEY}`);
    let nodesData: PlaitElement[] = [];
    if (encoded) {
        const decoded = decodeURIComponent(window.atob(encoded));
        nodesData = JSON.parse(decoded);
    }
    return nodesData;
};

export const insertClipBoardData = (board: PlaitBoard, nodesData: PlaitElement[], targetPoint: Point) => {
    let selectedElementPath: Path, newElement: MindmapNodeElement, path: Path;
    const element = getSelectedElements(board)?.[0];
    const selectedComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(element as MindmapNodeElement) as MindmapNodeComponent;

    if (selectedComponent) {
        selectedElementPath = findPath(board, selectedComponent.node);
    }

    nodesData.forEach((item: PlaitElement, index: number) => {
        if (getSelectedElements(board).length === 1) {
            newElement = buildNodes(item as MindmapNodeElement);
            path = selectedElementPath.concat(selectedComponent.node.children.length + index);
        } else {
            newElement = buildMindmap(item as MindmapNodeElement, [
                targetPoint[0] + item.points![0][0],
                targetPoint[1] + item.points![0][1]
            ]);
            path = [board.children.length];
        }

        Transforms.insertNode(board, newElement, path);
        return;
    });
};
