import { PlaitBaseTable } from './table';

export enum SwimlaneSymbols {
    swimlaneVertical = 'swimlaneVertical',
    swimlaneHorizontal = 'swimlaneHorizontal'
}

export enum SwimlaneDrawSymbols {
    swimlaneVertical = 'swimlaneVertical',
    swimlaneHorizontal = 'swimlaneHorizontal',
    swimlaneVerticalWithHeader = 'swimlaneVerticalWithHeader',
    swimlaneHorizontalWithHeader = 'swimlaneHorizontalWithHeader'
}

export interface PlaitSwimlane extends PlaitBaseTable {
    type: 'swimlane';
    shape: SwimlaneSymbols;
    header?: boolean;
}

export interface PlaitSwimlaneVertical extends PlaitSwimlane {
    shape: SwimlaneSymbols.swimlaneVertical;
}

export interface PlaitSwimlaneHorizontal extends PlaitSwimlane {
    shape: SwimlaneSymbols.swimlaneHorizontal;
}
