interface heliotropeValueUrl {
  value: string;
  url: string;
}

interface heliotropeGalleryInfo {}

interface heliotropeInfo {
  title: string;
  thumbnail: string;
  artist: Array<heliotropeValueUrl>;
  group: Array<heliotropeValueUrl>;
  type?: Array<heliotropeValueUrl>;
  language?: Array<heliotropeValueUrl>;
  series: Array<heliotropeValueUrl>;
  character: Array<heliotropeValueUrl>;
  tags: Array<heliotropeValueUrl>;
  date: string;
}

export interface heliotropeList {
  status: number;
  list: Array<heliotropeInfo>;
  total: number;
}
