import { Component, OnInit } from '@angular/core';
import { Editor } from 'slate';

@Component({
    selector: 'basic-richtext',
    templateUrl: './richtext.component.html'
})
export class BasicRichtextComponent implements OnInit {
    value = {
        children: [
            { text: '富文本' }
        ]
    };
    ngOnInit(): void {}

    onChange(event: Editor) {
        console.log(event);
    }
}
