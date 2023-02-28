import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchingComponent } from './searching/searching.component';
import { QuestionSettingsComponent } from './settings/question-settings/question-settings.component';
import { SettingsComponent } from './settings/settings.component';
import { TagSettingsComponent } from './settings/tag-settings/tag-settings.component';
import { TaggingComponent } from './tagging/tagging.component';

const routes: Routes = [
  { path: "tag", component: TaggingComponent },
  { path: "search", component: SearchingComponent },
  {
    path: "settings", component: SettingsComponent, children: [
      { path: "tags", component: TagSettingsComponent },
      { path: "questions", component: QuestionSettingsComponent },
      { path: "", redirectTo: 'tags', pathMatch: 'full' },
    ]
  },
  { path: "", redirectTo: "/search", pathMatch: "full" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
