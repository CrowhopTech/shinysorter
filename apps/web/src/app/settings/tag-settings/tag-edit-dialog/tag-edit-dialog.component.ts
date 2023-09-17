import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Tag } from '../../../supabase.service';

import { EventEmitter, Input, Output } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { APIUtilityService } from '../../../apiutility.service';
import { QuestionOptionCreate, QuestionPatch, QuestionWithOptions, SupabaseService } from '../../../supabase.service';

@Component({
  selector: 'app-tag-edit-dialog',
  templateUrl: './tag-edit-dialog.component.html',
  styleUrls: ['./tag-edit-dialog.component.sass']
})
export class TagEditDialogComponent implements OnInit {

  public tagCopy: Tag;

  constructor(public dialogRef: MatDialogRef<TagEditDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: { tag: Tag; }) {
    this.tagCopy = {
      id: data.tag.id,
      name: data.tag.name,
      description: data.tag.description,
      created_at: data.tag.created_at,
    };
  }

  ngOnInit(): void { }

}
