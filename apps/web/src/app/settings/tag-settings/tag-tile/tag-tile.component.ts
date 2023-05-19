import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SupabaseService, Tag } from '../../../supabase.service';
import { TagDeleteDialogComponent } from '../tag-delete-dialog/tag-delete-dialog.component';

@Component({
  selector: 'app-tag-tile',
  templateUrl: './tag-tile.component.html',
  styleUrls: ['./tag-tile.component.sass']
})
export class TagTileComponent implements OnInit {

  @Output() refetchRequired = new EventEmitter<undefined>();

  private _tag?: Tag;
  @Input() set tag(newTag: Tag | undefined) {
    this._tag = newTag;
    this.newName = newTag?.name; // Use a setter so that we can reset the form values if the tag changes
    this.newDescription = newTag?.description;
    this.savePending = false;
  }
  get tag() {
    return this._tag;
  }

  newName?: string;
  newDescription?: string;

  public editing: boolean = false;
  public savePending: boolean = false; // Set to true when we start the tag save call, set to false once it finishes

  constructor(private supaService: SupabaseService, public dialog: MatDialog, private snackbar: MatSnackBar) { }

  ngOnInit(): void { }

  resetValues(): void {
    if (!this.tag) {
      return;
    }

    this.newName = this.tag.name;
    this.newDescription = this.tag.description;
  }

  pastelColorForText(text: string | undefined): string {
    if (!text) {
      return "";
    }
    const hash = text.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    const pastelStrength = '93%';
    return `hsl(${hash % 360}, ${pastelStrength}, ${pastelStrength})`;
  }

  async submitChanges() {
    if (!this.tag) {
      return;
    }

    this.savePending = true;

    const { error } = await this.supaService.patchTag({
      id: this.tag.id,
      name: this.newName,
      description: this.newDescription
    });
    if (error) {
      this.snackbar.open(`Failed to update tag ${this.tag.name}: ${error.message}`, undefined, { duration: 7500 });
      this.savePending = false;
      throw error;
    }
    this.editing = false;
    this.refetchRequired.emit();
    this.snackbar.open(`Tag '${this.newName}' updated successfully`, undefined, { duration: 3000 });
  }

  deleteTag() {
    if (!this.tag) {
      return;
    }

    this.dialog.open(TagDeleteDialogComponent, {
      data: {
        tagName: this.tag.name
      }
    }).afterClosed().subscribe(async (result: boolean) => {
      if (result && this.tag) {
        const { error } = await this.supaService.deleteTag(this.tag.id);
        if (error) {
          this.snackbar.open(`Failed to delete tag ${this.tag.name}: ${error.message}`, undefined, { duration: 7500 });
          this.savePending = false;
        }
        this.refetchRequired.emit();
      }
    });
  }
}
