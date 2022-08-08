import { Component, OnInit } from '@angular/core';
import { withMindmap } from 'mindmap';
import { PlaitElement, PlaitBoardChangeEvent, Viewport, PlaitBoard, Transforms } from 'plait';
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
        const value = (event.target as HTMLSelectElement).value;
        Transforms.setNode(this.board, { layout: value }, [0]);
    }

    plaitBoardInitialized(value: PlaitBoard) {
        this.board = value;
    }
}
