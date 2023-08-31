import { Component, OnInit } from '@angular/core';
import {
    BoardTransforms,
    PlaitBoard,
    PlaitBoardChangeEvent,
    PlaitBoardOptions,
    PlaitElement,
    PlaitTheme,
    ThemeColorMode,
    Viewport
} from '@plait/core';
import { mockData } from './mock-data';
import { withMind, PlaitMindBoard } from '@plait/mind';
import { AbstractResizeState, MindThemeColors } from '@plait/mind';
import { withMindExtend } from '../plugins/with-mind-extend';
import { PlaitGeometry, withDraw } from '@plait/draw';

const LOCAL_DATA_KEY = 'plait-board-change-data';

@Component({
    selector: 'basic-board-editor',
    templateUrl: './editor.component.html'
})
export class BasicBoardEditorComponent implements OnInit {
    plugins = [withMind, withMindExtend, withDraw];

    value: (PlaitElement | PlaitGeometry)[] = [...mockData];

    options: PlaitBoardOptions = {
        readonly: false,
        hideScrollbar: false,
        disabledScrollOnNonFocus: false,
        themeColors: MindThemeColors
    };

    viewport!: Viewport;

    theme!: PlaitTheme;

    board!: PlaitBoard;

    ngOnInit(): void {
        const data = this.getLocalData() as PlaitBoardChangeEvent;
        if (data) {
            this.value = data.children;
            this.viewport = data.viewport;
            this.theme = data.theme;
        }
    }

    change(event: PlaitBoardChangeEvent) {
        this.setLocalData(JSON.stringify(event));
        console.log(event.children);
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
        (this.board as PlaitMindBoard).onAbstractResize = (state: AbstractResizeState) => {};
    }

    themeChange(event: Event) {
        const value = (event.target as HTMLSelectElement).value;
        BoardTransforms.updateThemeColor(this.board, value as ThemeColorMode);
    }
}
