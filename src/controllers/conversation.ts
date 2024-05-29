import { Request, Response } from 'express';

import { asyncHandler } from 'middlewares/async';
import User from 'models/User';
import Conversation from 'models/Conversation';
import { formatUser, sendErrorResponse } from 'utils/helpers';

export const getOrCreateConversation = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      params: { id },
      user,
    } = req;

    const existedUser = await User.findById(id);
    if (!existedUser) return sendErrorResponse(res, 'user not found', 404);

    const participants = [user.id, existedUser._id];
    // return unique and same string if users ids change orders
    // ['abc', 'adc'] -> 'abc_adc'
    // ['adc','abc'] -> 'abc_adc'
    const participantsId = participants.sort().join('_');

    // if there's no conversation with this participantsId -> create new conversation with upsert: true
    const conversation = await Conversation.findOneAndUpdate(
      { participantsId },
      {
        // insert only if upsert founds nothing as participants
        $setOnInsert: {
          participantsId,
          participants,
        },
      },
      { upsert: true, new: true }
    );

    return res.json({
      status: 'success',
      data: {
        data: conversation._id,
      },
    });
  }
);
