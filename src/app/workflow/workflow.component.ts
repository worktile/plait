import { Component, OnInit } from '@angular/core';
import { PlaitBoard, PlaitBoardChangeEvent, PlaitElement, Viewport } from '@plait/core';
import { MindmapLayoutType } from '@plait/layouts';
import { withWorkflow } from '@plait/workflow';
import { mockWorkflowData } from '../mock/workflow-data';

const LOCAL_DATA_KEY = 'plait-board-workflow-change-data';

@Component({
    selector: 'basic-workflow',
    templateUrl: './workflow.component.html'
})
export class BasicWorkflowComponent implements OnInit {
    plugins = [withWorkflow];

    value: PlaitElement[] = mockWorkflowData;

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
