import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BasicBoardComponent } from './board/board.component';
import { BasicRichtextComponent } from './richtext/richtext.component';
import { BasicFlowComponent } from './flow/flow.component';

const routes: Routes = [
    {
        path: '',
        component: BasicBoardComponent
    },
    {
        path: 'richtext',
        component: BasicRichtextComponent
    },
    {
        path: 'flow',
        component: BasicFlowComponent
    }
];
@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            useHash: false,
            relativeLinkResolution: 'legacy'
        })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {}
