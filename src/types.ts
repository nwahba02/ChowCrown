export interface ApiCompetition {
  id: string;
  title: string;
  category: string;
  city: string;
  quarter: string;
  description: string;
  image: string;
  active: boolean;
  createdAt: string;
}

export interface ApiRestaurant {
  id: string;
  name: string;
  dish: string;
  competitionId: string;
  location: string;
  image: string;
  active: boolean;
}
