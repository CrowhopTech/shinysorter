import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-tag-delete-dialog',
  templateUrl: './tag-delete-dialog.component.html',
  styleUrls: ['./tag-delete-dialog.component.sass']
})
export class TagDeleteDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<TagDeleteDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: { tagName: string }) { }

  ngOnInit(): void { }

}
