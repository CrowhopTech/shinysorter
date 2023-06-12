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
          ahashb12: number | null
          ahashb34: number | null
          ahashb56: number | null
          ahashb78: number | null
          phashb12: number | null
          phashb34: number | null
          phashb56: number | null
          phashb78: number | null
          dhashb12: number | null
          dhashb34: number | null
          dhashb56: number | null
          dhashb78: number | null
        }
        Insert: {
          id?: number
          md5sum?: string
          hasBeenTagged?: boolean
          storageID: string
          mimeType?: string
          filename?: string
          ahashb12?: number | null
          ahashb34?: number | null
          ahashb56?: number | null
          ahashb78?: number | null
          phashb12?: number | null
          phashb34?: number | null
          phashb56?: number | null
          phashb78?: number | null
          dhashb12?: number | null
          dhashb34?: number | null
          dhashb56?: number | null
          dhashb78?: number | null
        }
        Update: {
          id?: number
          md5sum?: string
          hasBeenTagged?: boolean
          storageID?: string
          mimeType?: string
          filename?: string
          ahashb12?: number | null
          ahashb34?: number | null
          ahashb56?: number | null
          ahashb78?: number | null
          phashb12?: number | null
          phashb34?: number | null
          phashb56?: number | null
          phashb78?: number | null
          dhashb12?: number | null
          dhashb34?: number | null
          dhashb56?: number | null
          dhashb78?: number | null
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
          requiredOptions: number[]
        }
        Insert: {
          id?: number
          orderingID?: number
          questionText?: string
          mutuallyExclusive?: boolean
          description?: string | null
          requiredOptions?: number[]
        }
        Update: {
          id?: number
          orderingID?: number
          questionText?: string
          mutuallyExclusive?: boolean
          description?: string | null
          requiredOptions?: number[]
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

