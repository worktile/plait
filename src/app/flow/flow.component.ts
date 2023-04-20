import { Component, OnInit } from '@angular/core';
import { PlaitBoard, PlaitBoardChangeEvent, PlaitElement, Viewport } from '@plait/core';
import { withFlow } from '@plait/flow';
import { mockFlowData } from './flow-data';
import { withDraw } from './plugins/with-draw';

const LOCAL_DATA_KEY = 'plait-board-flow-change-data';

@Component({
    selector: 'basic-flow',
    templateUrl: './flow.component.html'
})
export class BasicFlowComponent implements OnInit {
    plugins = [withFlow, withDraw];

    value: PlaitElement[] = mockFlowData;

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

    plaitBoardInitialized(value: PlaitBoard) {
        this.board = value;
    }
}
