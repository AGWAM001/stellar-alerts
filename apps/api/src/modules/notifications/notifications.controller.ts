/**
 * Notifications Controller
 * 
 * Handles HTTP requests for notification preferences.
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { notificationsService } from './notifications.service';
import { AuthenticationError, AuthorizationError, ProviderError, ValidationError } from '../../lib/errors';

export class NotificationsController {
  /**
   * Update notification preferences
   */
  async updatePreferences(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      throw new AuthenticationError('User not authenticated');
    }

    const body = request.body as any;
    const { mfaToken, ...preferences } = body;

    try {
      await notificationsService.updatePreferences(
        request.user.id,
        preferences,
        mfaToken
      );

      return reply.send({
        success: true,
        message: 'Notification preferences updated successfully',
      });
    } catch (error: any) {
      if (error.message === 'MFA token required') {
        throw new AuthorizationError(
          'Multi-factor authentication is enabled. Please provide a valid TOTP token.',
          'MFA_TOKEN_REQUIRED',
        );
      }

      if (error.message === 'Invalid MFA token') {
        throw new AuthorizationError('The provided TOTP token is invalid or expired.', 'INVALID_MFA_TOKEN');
      }

      if (
        error.message.startsWith('Invalid WhatsApp number') ||
        error.message.startsWith('A valid WhatsApp number is required')
      ) {
        throw new ValidationError(error.message, undefined, 'INVALID_WHATSAPP_PREFERENCES');
      }

      throw error;
    }
  }

  /**
   * Get notification preferences
   */
  async getPreferences(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      throw new AuthenticationError('User not authenticated');
    }

    const preferences = await notificationsService.getPreferences(request.user.id);
    return reply.send({
      success: true,
      preferences: preferences || {},
    });
  }

  /**
   * Send a one-off test ping on a configured channel (used by the
   * onboarding wizard to verify a link before activation).
   */
  async sendTestPing(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      throw new AuthenticationError('User not authenticated');
    }

    const body = request.body as { channel?: string };
    const channel = body?.channel;

    if (channel !== 'telegram') {
      throw new ValidationError('channel must be "telegram"');
    }

    try {
      const result = await notificationsService.sendTestPing(request.user.id, channel);
      if (!result.success) {
        // The channel provider (e.g. Telegram) was reachable but the send
        // itself failed/was rejected — a provider error, not a caller-input
        // problem (that's the ValidationError below).
        throw new ProviderError(result.message, 'TEST_PING_PROVIDER_FAILURE');
      }
      return reply.send({ success: true, message: result.message });
    } catch (error: any) {
      if (error instanceof ProviderError) throw error;
      // Preserves the pre-existing 400 status for a failed send (as opposed
      // to the 502 above for a service-reported-but-not-thrown failure) —
      // this is a caller-input problem (e.g. no Telegram chat linked yet),
      // not an upstream provider failure.
      throw new ValidationError(error.message, undefined, 'TEST_PING_FAILED');
    }
  }
}

export const notificationsController = new NotificationsController();
