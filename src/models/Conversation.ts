import { Model, ObjectId, Schema, model } from 'mongoose';
import { ConversationDocument } from 'src/@types/conversation';

interface Methods {
  compareToken(token: string): Promise<boolean>;
}

const ConversationSchema = new Schema<ConversationDocument, {}, Methods>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    participantsId: {
      type: String,
      unique: true,
      required: true,
    },
    chats: [
      {
        sentBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        viewed: {
          type: Boolean,
          default: false,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Conversation = model('Conversation', ConversationSchema) as Model<
  ConversationDocument,
  {},
  Methods
>;
export default Conversation;
