
export interface Task {
  id: string;
  text: string;
  completed: boolean;
  date?: Date;
  subjectId?: string;
}

export interface FileItem {
  id: string;
  name: string;
  dataUrl: string;
  subjectTagId?: string;
}

export interface Folder {
  id: string;
  name: string;
  files: FileItem[];
}

export interface Chapter {
  id: string;
  name: string;
  completed: boolean;
}

export interface Subject {
  id: string;
  name: string;
  chapters: Chapter[];
  color: string;
}

export interface SubjectTag {
    id: string;
    name: string;
}
