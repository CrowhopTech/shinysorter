import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { QuestionTileComponent } from './question-tile.component';

describe('QuestionTileComponent', () => {
  let component: QuestionTileComponent;
  let fixture: ComponentFixture<QuestionTileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuestionTileComponent],
      imports: [
        HttpClientModule,
        MatDialogModule,
        MatChipsModule,
        MatExpansionModule,
        MatButtonModule,
        MatIconModule,
        NoopAnimationsModule
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(QuestionTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
