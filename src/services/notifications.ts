import { Platform } from 'react-native';
import Constants from 'expo-constants';

const isExpoGo = Constants.appOwnership === 'expo';

let Notifications: typeof import('expo-notifications') | null = null;
if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications');
  } catch {
    Notifications = null;
  }
}

export const configureNotifications = async () => {
  if (isExpoGo || !Notifications) {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: true,
    }),
  });

  const settings = await Notifications.getPermissionsAsync();
  if (!settings.granted) {
    await Notifications.requestPermissionsAsync();
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'DroPiPêche',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
};

export const sendLocalNotification = async (title: string, body: string) => {
  if (isExpoGo || !Notifications) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: false },
    trigger: null,
  });
};

