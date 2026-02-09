import { NavigatorScreenParams } from '@react-navigation/native';

export type BuyerStackParamList = {
  BuyerHome: undefined;
  ListingDetail: { listingId: string };
};

export type BuyerTabsParamList = {
  Feed: NavigatorScreenParams<BuyerStackParamList> | undefined;
  Favorites: undefined;
  Reservations: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type FisherTabsParamList = {
  Home: undefined;
  Add: undefined;
  Reservations: undefined;
  Favorites: undefined;
  Notifications: undefined;
  Profile: undefined;
};
