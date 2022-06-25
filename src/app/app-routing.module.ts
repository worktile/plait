import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BasicBoardComponent } from './board/board.component';
import { BasicRichtextComponent } from './richtext/richtext.component';

const routes: Routes = [
    {
        path: '',
        component: BasicBoardComponent
    },
    {
        path: 'richtext',
        component: BasicRichtextComponent
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
