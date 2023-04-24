import { Component, OnInit } from '@angular/core';
import { getSelectedElements, idCreator, PlaitBoard, PlaitBoardChangeEvent, PlaitElement, Transforms, Viewport } from '@plait/core';
import { MindmapLayoutType, isBottomLayout, isIndentedLayout, isLeftLayout, isRightLayout, isTopLayout } from '@plait/layouts';
import {
    MindmapNodeElement,
    MindmapNodeShape,
    MindmapTransforms,
    MINDMAP_ELEMENT_TO_COMPONENT,
    withMindmap,
    GRAY_COLOR,
    MindmapQueries
} from '@plait/mindmap';
import { mockMindmapData } from './mock-data';

const LOCAL_DATA_KEY = 'plait-board-change-data';

@Component({
    selector: 'basic-board-editor',
    templateUrl: './editor.component.html'
})
export class BasicBoardEditorComponent implements OnInit {
    plugins = [withMindmap];

    value: PlaitElement[] = [...mockMindmapData];

    viewport!: Viewport;

    board!: PlaitBoard;

    ngOnInit(): void {
        const data = this.getLocalData() as PlaitBoardChangeEvent;
        if (data) {
            this.value = data.children;
            this.viewport = data.viewport;
        }
    }

    change(event: PlaitBoardChangeEvent) {
        this.setLocalData(JSON.stringify(event));
    }

    setLocalData(data: string) {
        localStorage.setItem(`${LOCAL_DATA_KEY}`, data);
    }

    getLocalData() {
        const data = localStorage.getItem(`${LOCAL_DATA_KEY}`);
        return data ? JSON.parse(data) : null;
    }

    layoutChange(event: Event) {
        const value = (event.target as HTMLSelectElement).value as MindmapLayoutType;
        const selectedElement = getSelectedElements(this.board)?.[0];
        if (selectedElement) {
            const path = PlaitBoard.findPath(this.board, selectedElement);
            MindmapTransforms.setMindmapLayout(this.board, value, path);
        }
    }

    shapeChange(event: Event) {
        const value = (event.target as HTMLSelectElement).value as MindmapNodeShape;
        const selectedElement = getSelectedElements(this.board)?.[0];
        if (selectedElement) {
            const path = PlaitBoard.findPath(this.board, selectedElement);
            Transforms.setNode(this.board, { shape: value }, path);
        }
    }

    setAbstract(event: Event) {
        const selectedElements = getSelectedElements(this.board);
        const nodeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(selectedElements[selectedElements.length - 1] as MindmapNodeElement);

        const start = nodeComponent?.parent.children.findIndex(child => {
            return child.origin.id === selectedElements[0].id;
        });
        if (nodeComponent && start !== undefined) {
            const path = [...findPath(this.board, nodeComponent.parent), nodeComponent.parent.children.length];
            let nodeLayout = MindmapQueries.getLayoutByElement(nodeComponent.node.origin);
            let layout: MindmapLayoutType = MindmapLayoutType.right;
            if (isLeftLayout(nodeLayout)) {
                layout = MindmapLayoutType.left;
            }
            if (isRightLayout(nodeLayout)) {
                layout = MindmapLayoutType.right;
            }
            if (isBottomLayout(nodeLayout) && !isIndentedLayout(nodeLayout)) {
                layout = MindmapLayoutType.downward;
            }
            if (isTopLayout(nodeLayout) && !isIndentedLayout(nodeLayout)) {
                layout = MindmapLayoutType.upward;
            }
            Transforms.insertNode(
                this.board,
                {
                    id: idCreator(),
                    value: { children: [{ text: '概要' }] },
                    layout,
                    children: [],
                    start,
                    end: start + selectedElements.length - 1,
                    width: 28,
                    height: 20,
                    strokeColor: GRAY_COLOR,
                    linkLineColor: GRAY_COLOR
                },
                path
            );
        }
    }

    plaitBoardInitialized(value: PlaitBoard) {
        this.board = value;
    }
}
