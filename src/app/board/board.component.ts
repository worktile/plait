import { Component, OnInit } from '@angular/core';
import { withMindmap } from 'mindmap';
import { PlaitElement, PlaitBoardChangeEvent, Viewport } from 'plait';
import { mockMindmapData } from '../mock/mindmap-data';

const LOCAL_DATA_KEY = 'plait-board-change-data';

@Component({
    selector: 'basic-board',
    template: `
        <plait-board [plaitPlugins]="plugins" [plaitValue]="value" [plaitViewport]="viewport" (plaitChange)="change($event)"></plait-board>
    `
})
export class BasicBoardComponent implements OnInit {
    plugins = [withMindmap];

    value: PlaitElement[] = [mockMindmapData];

    viewport!: Viewport;

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
}
