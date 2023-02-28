import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { TaggingComponent } from './tagging/tagging.component';
import { SearchingComponent } from './searching/searching.component';
import { TagqueryComponent } from './searching/searchinput/tagquery/tagquery.component';
import { HttpClientModule } from '@angular/common/http';
import { ExclusivetoggleComponent } from './searching/searchinput/exclusivetoggle/exclusivetoggle.component';
import { SearchinputComponent } from './searching/searchinput/searchinput.component';
import { QuestionComponent } from './tagging/question/question.component';
import { FileviewerComponent } from './fileviewer/fileviewer.component';
import { FileSaverModule } from 'ngx-filesaver';
import { APP_BASE_HREF } from '@angular/common';
import { SettingsComponent } from './settings/settings.component';
import { TagSettingsComponent } from './settings/tag-settings/tag-settings.component';
import { QuestionSettingsComponent, QuestionDeleteDialogComponent, QuestionReorderDialogComponent } from './settings/question-settings/question-settings.component';
import { TagTileComponent } from './settings/tag-settings/tag-tile/tag-tile.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TagCreateTileComponent } from './settings/tag-settings/tag-create-tile/tag-create-tile.component';
import { TagDeleteDialogComponent } from './settings/tag-settings/tag-delete-dialog/tag-delete-dialog.component';
import { QuestionTileComponent } from './settings/question-settings/question-tile/question-tile.component';
import { QuestionEditDialogComponent, TagOptionEditComponent } from './settings/question-settings/question-edit-dialog/question-edit-dialog.component';
import { TagChipComponent } from './tag-chip/tag-chip.component';
import { AppService } from './app.service';

// Use this to load config values **at runtime**! See the comment values around this file for a full example (mainly see providers in the module)

export function initApp(appService: AppService) {
  return () => appService.load().then(_ => {
    // Once the config is loaded, update the API client config with the new base path
    // if (appService.settings?.apiServerAddress) {
    //   apiConfig.basePath = appService.settings?.apiServerAddress
    // }
  });
}

// export const apiConfig = new Configuration({
//   basePath: ""
// });
// export function getApiConfig() {
//   return apiConfig;
// }

@NgModule({
  declarations: [
    AppComponent,
    ToolbarComponent,
    TaggingComponent,
    SearchingComponent,
    TagqueryComponent,
    ExclusivetoggleComponent,
    SearchinputComponent,
    QuestionComponent,
    FileviewerComponent,
    SettingsComponent,
    TagSettingsComponent,
    QuestionSettingsComponent,
    TagTileComponent,
    TagCreateTileComponent,
    TagDeleteDialogComponent,
    QuestionTileComponent,
    QuestionEditDialogComponent,
    TagOptionEditComponent,
    QuestionDeleteDialogComponent,
    QuestionReorderDialogComponent,
    TagChipComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatGridListModule,
    MatInputModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatTabsModule,
    MatTooltipModule,
    HttpClientModule,
    FileSaverModule,
    FormsModule,
    ReactiveFormsModule,
    // ApiModule.forRoot(getApiConfig)
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initApp,
      deps: [AppService],
      multi: true
    },
    {
      provide: APP_BASE_HREF,
      useValue: "/" + (window.location.pathname.split("/")[1] || ""),
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
