import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AppModule } from '../app.module';

import { TaggingComponent } from './tagging.component';

describe('TaggingComponent', () => {
  let component: TaggingComponent;
  let fixture: ComponentFixture<TaggingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TaggingComponent],
      imports: [
        HttpClientModule,
        RouterModule,
        RouterTestingModule,
        MatProgressSpinnerModule,
        MatToolbarModule,
        MatRadioModule,
        MatCheckboxModule,
        MatButtonModule,
        MatIconModule,
        AppModule
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TaggingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
