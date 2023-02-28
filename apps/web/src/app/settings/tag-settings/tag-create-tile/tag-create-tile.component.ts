import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SupabaseService } from '../../../supabase.service';

@Component({
  selector: 'app-tag-create-tile',
  templateUrl: './tag-create-tile.component.html',
  styleUrls: ['./tag-create-tile.component.sass']
})
export class TagCreateTileComponent implements OnInit {

  @Output() refetchRequired = new EventEmitter<undefined>();

  newName?: string;
  newDescription: string = "";

  editing: boolean = false;
  savePending: boolean = false; // Set to true when we start the tag create call, set to false once it finishes

  constructor(private supaService: SupabaseService, private snackbar: MatSnackBar) { }

  ngOnInit(): void { }

  async submitChanges() {
    if (this.newName == undefined || this.newDescription == undefined || this.newName.length == 0) {
      return;
    }

    this.savePending = true;

    const { error } = await this.supaService.createTag({
      name: this.newName,
      description: this.newDescription,
    });
    if (error) {
      this.snackbar.open(`Failed to create tag ${this.newName}: ${error}`, undefined, { duration: 7500 });
      this.savePending = false;
      return;
    }
    this.editing = false;
    this.savePending = false;
    this.refetchRequired.emit();
    this.snackbar.open(`Tag '${this.newName}' created successfully`, undefined, { duration: 3000 });
  }
}
