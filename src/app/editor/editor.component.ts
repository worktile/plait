import { Component, OnInit } from '@angular/core';
import { getSelectedElements, PlaitBoard, PlaitBoardChangeEvent, PlaitElement, Transforms, Viewport } from '@plait/core';
import { MindmapLayoutType } from '@plait/layouts';
import {
    findPath,
    MindmapNodeElement,
    MindmapNodeShape,
    MindmapTransforms,
    MINDMAP_ELEMENT_TO_COMPONENT,
    withMindmap
} from '@plait/mindmap';
import { PlaitBoardOptions } from '../../../dist/plait/interfaces';
import { mockMindmapData } from './mock-data';

const LOCAL_DATA_KEY = 'plait-board-change-data';

@Component({
    selector: 'basic-board-editor',
    templateUrl: './editor.component.html'
})
export class BasicBoardEditorComponent implements OnInit {
    plugins = [withMindmap];

    options: PlaitBoardOptions = {
        readonly: true,
        hideScrollbar: true,
        allowClearBoard: false
    };

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
        const selectedElements = getSelectedElements(this.board)?.[0];

        const nodeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(selectedElements as MindmapNodeElement);

        const path = nodeComponent ? findPath(this.board, nodeComponent.node) : [0];
        MindmapTransforms.setMindmapLayout(this.board, value, path);
    }

    shapeChange(event: Event) {
        const value = (event.target as HTMLSelectElement).value as MindmapNodeShape;
        const selectedElements = getSelectedElements(this.board)?.[0];

        const nodeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(selectedElements as MindmapNodeElement);

        const path = nodeComponent ? findPath(this.board, nodeComponent.node) : [0];
        Transforms.setNode(this.board, { shape: value }, path);
    }

    plaitBoardInitialized(value: PlaitBoard) {
        this.board = value;
    }
}
