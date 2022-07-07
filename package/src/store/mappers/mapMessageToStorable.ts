import type { MessageResponse } from 'stream-chat';

import { mapDateTimeToStorable } from './mapDateTimeToStorable';

import type { MessageRow } from '../types';

export const mapMessageToStorable = (message: MessageResponse): MessageRow => {
  const {
    attachments,
    cid,
    created_at,
    deleted_at,
    id,
    reaction_counts,
    text,
    type,
    updated_at,
    user,
    ...extraData
  } = message;

  return {
    attachments: JSON.stringify(attachments),
    cid: cid || '',
    createdAt: mapDateTimeToStorable(created_at),
    deletedAt: mapDateTimeToStorable(deleted_at),
    extraData: JSON.stringify(extraData),
    id,
    reactionCounts: JSON.stringify(reaction_counts),
    text,
    type,
    updatedAt: mapDateTimeToStorable(updated_at),
    userId: user?.id,
  };
};
