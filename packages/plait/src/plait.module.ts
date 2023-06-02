import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaitBoardComponent } from './board/board.component';
import { PlaitElementComponent } from './core/element/element.component';
import { PlaitChildrenElement } from './core/children/children.component';

const COMPONENTS = [PlaitBoardComponent, PlaitChildrenElement, PlaitElementComponent];

@NgModule({
    declarations: [...COMPONENTS],
    imports: [CommonModule],
    exports: [...COMPONENTS]
})
export class PlaitModule {}
