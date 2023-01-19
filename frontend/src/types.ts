export interface TLobby {
  method: string;
  end_time: number;
  state: string;
  id: string;
  players: TPlayer[];
  articles_to_find: string[];
  articles_found: any[];
  start_article: string;
  time: number;
}

export type TPlayer = [
  {
    id?: string;
    name?: string;
    points?: number;
    points_current_round?: number;
  },
  {
    rights?: string;
    moves?: TArticle[];
    current_position: string;
  }
];

export interface TArticle {
  url_name: string;
  pretty_name: string;
}

export interface TWikiUpdate {
  method: string;
  data: TWiki;
}

export interface TWiki {
  links: string[];
  title: string;
  content_html: string;
  url_ending: string;
}
