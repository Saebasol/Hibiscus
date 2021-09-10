export interface heliotropeValueUrl {
  value: string;
  url: string;
}

interface heliotropeGalleryInfo {}

export interface heliotropeInfo {
  index: string,
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
