
export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export interface FileItem {
  id: string;
  name: string;
  dataUrl: string;
}

export interface Folder {
  id: string;
  name: string;
  files: FileItem[];
}
