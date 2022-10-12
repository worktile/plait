import { Component, OnInit } from '@angular/core';
import { PlaitBoard, PlaitBoardChangeEvent, PlaitElement, Transforms, Viewport } from '@plait/core';
import { findPath, getSelectedMindmapElements, MINDMAP_ELEMENT_TO_COMPONENT, withMindmap, MindmapTransforms } from '@plait/mindmap';
import { MindmapLayoutType } from '@plait/layouts';
import { mockMindmapData } from '../mock/mindmap-data';

const LOCAL_DATA_KEY = 'plait-board-change-data';

@Component({
    selector: 'basic-board',
    templateUrl: './board.component.html'
})
export class BasicBoardComponent implements OnInit {
    plugins = [withMindmap];

    value: PlaitElement[] = [mockMindmapData];

    viewport!: Viewport;

    board!: PlaitBoard;

    ngOnInit(): void {
        // const data = this.getLocalData() as PlaitBoardChangeEvent;
        // if (data) {
        //     this.value = data.children;
        //     this.viewport = data.viewport;
        // }
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
        const selectedElements = getSelectedMindmapElements(this.board)?.[0];

        const nodeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(selectedElements);

        const path = nodeComponent ? findPath(this.board, nodeComponent.node) : [0];
        MindmapTransforms.setMindmapLayout(this.board, value, path);
    }

    plaitBoardInitialized(value: PlaitBoard) {
        this.board = value;
    }
}
