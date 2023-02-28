import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { TagCreateTileComponent } from './tag-create-tile.component';

describe('TagCreateTileComponent', () => {
  let component: TagCreateTileComponent;
  let fixture: ComponentFixture<TagCreateTileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TagCreateTileComponent],
      imports: [
        HttpClientModule,
        MatFormFieldModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TagCreateTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
