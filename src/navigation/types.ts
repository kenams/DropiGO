import { NavigatorScreenParams } from '@react-navigation/native';

export type BuyerStackParamList = {
  BuyerHome: undefined;
  ListingDetail: { listingId: string };
  OrderTracking: { reservationId: string };
};

export type BuyerTabsParamList = {
  Feed: NavigatorScreenParams<BuyerStackParamList> | undefined;
  Cart: undefined;
  Reservations: undefined;
  Profile: undefined;
};

export type FisherTabsParamList = {
  Home: undefined;
  Add: undefined;
  Reservations: undefined;
  Profile: undefined;
};
