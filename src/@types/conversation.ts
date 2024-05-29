import { ObjectId } from 'mongoose';

interface Chat {
  _id: ObjectId;
  sentBy: ObjectId;
  content: string;
  timestamp: Date;
  viewed: boolean;
}

export interface ConversationDocument extends Document {
  participants: ObjectId[];
  participantsId: string;
  chats: Chat[];
}
