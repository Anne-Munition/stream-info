interface EventSub_Sub {
  type: string;
  version: string;
  condition: {
    broadcaster_user_id?: string;
    moderator_user_id?: string;
    from_broadcaster_user_id?: string;
    to_broadcaster_user_id?: string;
    reward_id?: string;
    category_id?: string;
    campaign_id?: string;
    extension_client_id?: string;
    client_id?: string;
    user_id?: string;
  };
  transport: {
    method: 'webhook';
    callback: string;
    secret: string;
  };
}

interface EventSub_Response {
  data: EventSub[];
  total: number;
  total_cost: number;
  max_total_cost: number;
}

interface EventSub {
  id: string;
  status:
    | 'enabled'
    | 'webhook_callback_verification_pending'
    | 'webhook_callback_verification_failed'
    | 'notification_failures_exceeded'
    | 'authorization_revoked'
    | 'user_removed';
  type: string;
  version: string;
  condition: {
    user_id: string;
  };
  created_at: string;
  transport: {
    method: string;
    callback: string;
  };
  cost: number;
}

interface ES_ChannelFollow {
  user_id: string;
  user_login: string;
  user_name: string;
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  followed_at: string;
}
