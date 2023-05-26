import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { TagTileComponent } from './tag-tile.component';
import { AppConfig, TOKEN } from '../../../app.service';

describe('TagTileComponent', () => {
  let component: TagTileComponent;
  let fixture: ComponentFixture<TagTileComponent>;
  let appConfig = new AppConfig();
  appConfig.supabaseAddress = "http://localhost:8080";
  appConfig.supabaseKey = "asdfasdf";
  appConfig.queryServerAddress = "http://localhost:8081";

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TagTileComponent],
      imports: [
        HttpClientModule,
        MatSnackBarModule,
        MatDialogModule,
        MatProgressSpinnerModule,
        MatCardModule,
        MatFormFieldModule,
        MatButtonModule,
        MatIconModule
      ],
      providers: [
        { provide: TOKEN, useValue: appConfig }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TagTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
