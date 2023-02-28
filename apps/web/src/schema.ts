export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      files: {
        Row: {
          id: number
          md5sum: string
          hasBeenTagged: boolean
          storageID: string
          mimeType: string
          filename: string
        }
        Insert: {
          id?: number
          md5sum?: string
          hasBeenTagged?: boolean
          storageID: string
          mimeType?: string
          filename?: string
        }
        Update: {
          id?: number
          md5sum?: string
          hasBeenTagged?: boolean
          storageID?: string
          mimeType?: string
          filename?: string
        }
      }
      filetags: {
        Row: {
          id: number
          fileid: number
          tagid: number
        }
        Insert: {
          id?: number
          fileid: number
          tagid: number
        }
        Update: {
          id?: number
          fileid?: number
          tagid?: number
        }
      }
      questionoptions: {
        Row: {
          id: number
          tagid: number | null
          questionid: number | null
          optiontext: string | null
          description: string | null
        }
        Insert: {
          id?: number
          tagid?: number | null
          questionid?: number | null
          optiontext?: string | null
          description?: string | null
        }
        Update: {
          id?: number
          tagid?: number | null
          questionid?: number | null
          optiontext?: string | null
          description?: string | null
        }
      }
      questions: {
        Row: {
          id: number
          orderingID: number
          questionText: string
          mutuallyExclusive: boolean
          description: string | null
        }
        Insert: {
          id?: number
          orderingID?: number
          questionText?: string
          mutuallyExclusive?: boolean
          description?: string | null
        }
        Update: {
          id?: number
          orderingID?: number
          questionText?: string
          mutuallyExclusive?: boolean
          description?: string | null
        }
      }
      tags: {
        Row: {
          id: number
          created_at: string | null
          name: string
          description: string
        }
        Insert: {
          id?: number
          created_at?: string | null
          name?: string
          description?: string
        }
        Update: {
          id?: number
          created_at?: string | null
          name?: string
          description?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

