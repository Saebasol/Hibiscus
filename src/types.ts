export interface heliotropeValueUrl {
  value: string;
  url: string;
}

export interface heliotropeImageInfo {
  name: string;
  url: string;
}

export interface heliotropeImageList {
  status: number;
  files: heliotropeImageInfo[];
}

interface heliotropeGalleryInfo {}

export interface heliotropeInfo {
  index: string;
  title: string;
  thumbnail: string;
  artist: heliotropeValueUrl[];
  group: heliotropeValueUrl[];
  type: heliotropeValueUrl[] | null;
  language: heliotropeValueUrl[] | null;
  series: heliotropeValueUrl[];
  character: heliotropeValueUrl[];
  tags: heliotropeValueUrl[];
  date: string;
}

export interface heliotropeList {
  status: number;
  list: heliotropeInfo[];
  total: number;
}
