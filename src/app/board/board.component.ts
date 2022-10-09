import { Component, OnInit } from '@angular/core';
import { findPath, getSelectedMindmapElements, MINDMAP_ELEMENT_TO_COMPONENT, setMindmapLayout, withMindmap } from '@plait/mindmap';
import { PlaitElement, PlaitBoardChangeEvent, Viewport, PlaitBoard, Transforms } from '@plait/core';
import { mockMindmapData } from '../mock/mindmap-data';
import { MindmapLayoutType } from '@plait/layouts';

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

    readonly = false;

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
        const layout = (event.target as HTMLSelectElement).value as MindmapLayoutType;
        const selectedElements = getSelectedMindmapElements(this.board)?.[0];

        const nodeComponent = MINDMAP_ELEMENT_TO_COMPONENT.get(selectedElements);

        const path = nodeComponent ? findPath(this.board, nodeComponent.node) : [0];
        setMindmapLayout(this.board, layout, path);
    }

    plaitBoardInitialized(value: PlaitBoard) {
        this.board = value;
    }
}
