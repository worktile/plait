import { PlaitBaseTable } from './table';

export enum SwimlaneSymbols {
    swimlaneVertical = 'swimlaneVertical',
    swimlaneHorizontal = 'swimlaneHorizontal'
}

export interface PlaitSwimlane extends PlaitBaseTable {
    type: 'swimlane';
    shape: SwimlaneSymbols;
}

export interface PlaitSwimlaneVertical extends PlaitSwimlane {
    shape: SwimlaneSymbols.swimlaneVertical;
}

export interface PlaitSwimlaneHorizontal extends PlaitSwimlane {
    shape: SwimlaneSymbols.swimlaneHorizontal;
}
