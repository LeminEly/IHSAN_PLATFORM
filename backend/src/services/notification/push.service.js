import OneSignal from 'onesignal-node';
import Environment from '../../config/environment.js';

class PushNotificationService {
  constructor() {
    this.client = new OneSignal.Client({
      userAuthKey: Environment.get('ONESIGNAL_REST_API_KEY'),
      app: {
        appAuthKey: Environment.get('ONESIGNAL_REST_API_KEY'),
        appId: Environment.get('ONESIGNAL_APP_ID'),
      },
    });
  }

  async sendToUser(userId, notification) {
    try {
      const response = await this.client.createNotification({
        app_id: Environment.get('ONESIGNAL_APP_ID'),
        include_external_user_ids: [userId],
        headings: { fr: notification.title },
        contents: { fr: notification.body },
        data: notification.data,
        priority: 10,
      });
      return response;
    } catch (error) {
      if (error instanceof OneSignal.HTTPError) {
        console.error('OneSignal error:', error.statusCode, error.body);
      } else {
        console.error('Push notification error:', error);
      }
      return null;
    }
  }

  async sendToRole(role, notification) {
    try {
      const response = await this.client.createNotification({
        app_id: Environment.get('ONESIGNAL_APP_ID'),
        filters: [{ field: 'tag', key: 'role', relation: '=', value: role }],
        headings: { en: notification.title },
        contents: { en: notification.body },
        data: notification.data,
      });
      return response;
    } catch (error) {
      if (error instanceof OneSignal.HTTPError) {
        console.error('OneSignal error:', error.statusCode, error.body);
      } else {
        console.error('Push notification error:', error);
      }
      return null;
    }
  }
}

export default new PushNotificationService();
