import { Component, Input, OnInit } from '@angular/core';
import { PlaitBoard } from '../../interfaces/board';
import { PlaitElement } from '../../interfaces/element';
import { PlaitEffect } from './effect';
import { Ancestor } from '../../interfaces/node';
import { PlaitElementComponent } from '../element/element.component';
import { NgFor } from '@angular/common';

@Component({
    selector: 'plait-children',
    template: `
        <plait-element
            *ngFor="let item of parent.children; let index = index; trackBy: trackBy"
            [index]="index"
            [element]="item"
            [parent]="parent"
            [board]="board"
            [effect]="effect"
            [parentG]="parentG"
        ></plait-element>
    `,
    standalone: true,
    imports: [NgFor, PlaitElementComponent]
})
export class PlaitChildrenElementComponent implements OnInit {
    @Input() board!: PlaitBoard;

    @Input() parent!: any;

    @Input() effect?: PlaitEffect;

    @Input() parentG!: SVGGElement;

    constructor() {}

    ngOnInit(): void {
        if (!this.parent) {
            this.parent = this.board;
        }
        if (!this.parentG) {
            this.parentG = PlaitBoard.getElementHost(this.board);
        }
    }

    trackBy = (index: number, element: PlaitElement) => {
        return element.id;
    };
}
