import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { TagDeleteDialogComponent } from './tag-delete-dialog.component';

describe('TagDeleteDialogComponent', () => {
  let component: TagDeleteDialogComponent;
  let fixture: ComponentFixture<TagDeleteDialogComponent>;

  let dialogData: { tagName: string }

  beforeEach(async () => {
    dialogData = { tagName: "NOT SET FOR TEST!!!" }
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: dialogData })

    await TestBed.configureTestingModule({
      declarations: [TagDeleteDialogComponent],
      imports: [
        MatButtonModule,
        MatDialogModule
      ],
      providers: [
        MAT_DIALOG_DATA, { provide: MatDialogRef, useValue: {} }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TagDeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    dialogData.tagName = "Should create"
    expect(component).toBeTruthy();
  });
});
