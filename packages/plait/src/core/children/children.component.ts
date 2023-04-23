import { Component, Input, OnInit } from '@angular/core';
import { PlaitBoard } from '../../interfaces/board';
import { PlaitElement } from '../../interfaces/element';
import { PlaitEffect } from './effect';
import { Ancestor } from '../../interfaces/node';

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
    `
})
export class PlaitChildrenElement implements OnInit {
    @Input() board!: PlaitBoard;

    @Input() parent!: Ancestor;

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
