import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { PlaitBoardComponent } from './board/board.component';
import { PlaitElementComponent } from './core/element/element.component';
import { PlaitToolbarComponent } from './core/toolbar/toolbar.component';
import { PlaitChildrenElement } from './core/children/children.component';

const COMPONENTS = [PlaitBoardComponent, PlaitChildrenElement, PlaitElementComponent, PlaitToolbarComponent];

@NgModule({
    declarations: [...COMPONENTS],
    imports: [BrowserModule],
    exports: [...COMPONENTS]
})
export class PlaitModule {}
