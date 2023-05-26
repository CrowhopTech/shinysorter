import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { QuestionSettingsComponent } from './question-settings.component';
import { AppConfig, TOKEN } from '../../app.service';

describe('QuestionSettingsComponent', () => {
  let component: QuestionSettingsComponent;
  let fixture: ComponentFixture<QuestionSettingsComponent>;
  let appConfig = new AppConfig();
  appConfig.supabaseAddress = "http://localhost:8080";
  appConfig.supabaseKey = "asdfasdf";
  appConfig.queryServerAddress = "http://localhost:8081";

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuestionSettingsComponent],
      imports: [
        HttpClientModule,
        MatProgressSpinnerModule,
        MatCardModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatSnackBarModule,
        MatSelectModule,
        MatExpansionModule
      ],
      providers: [
        { provide: TOKEN, useValue: appConfig }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(QuestionSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
