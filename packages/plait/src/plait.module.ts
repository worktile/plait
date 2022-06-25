import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { PlaitBoardComponent } from './board/board.component';
import { PlaitElementComponent } from './core/element/element.component';

@NgModule({
    declarations: [PlaitBoardComponent, PlaitElementComponent],
    imports: [BrowserModule],
    exports: [PlaitBoardComponent, PlaitElementComponent]
})
export class PlaitModule {}
