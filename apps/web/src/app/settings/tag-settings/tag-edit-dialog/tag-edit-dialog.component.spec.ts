import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { TagEditDialogComponent } from './tag-edit-dialog.component';

describe('TagEditDialogComponent', () => {
  let component: TagEditDialogComponent;
  let fixture: ComponentFixture<TagEditDialogComponent>;

  let dialogData: { tagName: string; };

  beforeEach(async () => {
    dialogData = { tagName: "NOT SET FOR TEST!!!" };
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: dialogData });

    await TestBed.configureTestingModule({
      declarations: [TagEditDialogComponent],
      imports: [
        MatButtonModule,
        MatDialogModule
      ],
      providers: [
        MAT_DIALOG_DATA, { provide: MatDialogRef, useValue: {} }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TagEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    dialogData.tagName = "Should create";
    expect(component).toBeTruthy();
  });
});
