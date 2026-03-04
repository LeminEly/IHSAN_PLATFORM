import OneSignal from '@onesignal/node-oneshot';
import Environment from '../../config/environment.js';

class PushNotificationService {
  constructor() {
    const configuration = OneSignal.createConfiguration({
      appKey: Environment.get('ONESIGNAL_REST_API_KEY')
    });

    this.client = new OneSignal.DefaultApi(configuration);
    this.appId = Environment.get('ONESIGNAL_APP_ID');
  }

  async sendToUser(userId, notification) {
    try {
      const response = await this.client.createNotification({
        app_id: this.appId,
        include_external_user_ids: [userId],
        headings: { fr: notification.title },
        contents: { fr: notification.body },
        data: notification.data,
        priority: 10
      });

      return response;
    } catch (error) {
      console.error('Push notification error:', error);
      // Ne pas bloquer le flux principal
      return null;
    }
  }

  async sendToRole(role, notification) {
    try {
      const response = await this.client.createNotification({
        app_id: this.appId,
        filters: [
          { field: 'tag', key: 'role', relation: '=', value: role }
        ],
        headings: { fr: notification.title },
        contents: { fr: notification.body },
        data: notification.data
      });

      return response;
    } catch (error) {
      console.error('Push notification error:', error);
      return null;
    }
  }
}

export default new PushNotificationService();