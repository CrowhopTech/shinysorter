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

describe('TagTileComponent', () => {
  let component: TagTileComponent;
  let fixture: ComponentFixture<TagTileComponent>;

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
