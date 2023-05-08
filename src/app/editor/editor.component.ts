import { Component, OnInit } from '@angular/core';
import { getSelectedElements, PlaitBoard, PlaitBoardChangeEvent, PlaitElement, Transforms, Viewport } from '@plait/core';
import { MindmapLayoutType } from '@plait/layouts';
import {
    MindElement,
    MindmapNodeShape,
    MindTransforms,
    MINDMAP_ELEMENT_TO_COMPONENT,
    withMind,
    GRAY_COLOR,
    createMindElement
} from '@plait/mind';
import { mockData } from './mock-data';
import { withEmojiExtend } from './emoji/with-emoji-extend';

const LOCAL_DATA_KEY = 'plait-board-change-data';

@Component({
    selector: 'basic-board-editor',
    templateUrl: './editor.component.html'
})
export class BasicBoardEditorComponent implements OnInit {
    plugins = [withMind, withEmojiExtend];

    value: PlaitElement[] = [...mockData];

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
            MindTransforms.setLayout(this.board, value, path);
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
        const nodeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(selectedElements[selectedElements.length - 1] as MindElement);

        const start = nodeComponent?.parent.children.findIndex(child => {
            return child.origin.id === selectedElements[0].id;
        });
        if (nodeComponent && start !== undefined) {
            const path = [...PlaitBoard.findPath(this.board, nodeComponent.parent.origin), nodeComponent.parent.children.length];
            const mindElement = createMindElement('概要', 28, 20, { strokeColor: GRAY_COLOR, linkLineColor: GRAY_COLOR });
            mindElement.start = start;
            mindElement.end = start + selectedElements.length - 1;
            Transforms.insertNode(this.board, mindElement, path);
        }
    }

    plaitBoardInitialized(value: PlaitBoard) {
        this.board = value;
    }
}
