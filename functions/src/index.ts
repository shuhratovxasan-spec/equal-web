import * as admin from "firebase-admin";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { onObjectFinalized } from "firebase-functions/v2/storage";

admin.initializeApp();

import {
  onRatingCreatedHandler,
  onMessageCreatedHandler,
  onFlagCreatedHandler,
  onChatFileUploadedHandler,
} from "./trust_limits";

// 1) rating created -> recalc trust for target user
export const onRatingCreated = onDocumentCreated(
  {
    document: "ratings/{id}",
    region: "us-central1",
  },
  onRatingCreatedHandler
);

// 2) message created -> enforce message limits & trust reactions
export const onMessageCreated = onDocumentCreated(
  {
    document: "chats/{chatId}/messages/{msgId}",
    region: "us-central1",
  },
  onMessageCreatedHandler
);

// 3) flag created -> enforce flag limits & possibly ban/limit target
export const onFlagCreated = onDocumentCreated(
  {
    document: "flags/{id}",
    region: "us-central1",
  },
  onFlagCreatedHandler
);

// 4) storage upload (optional but recommended): count file uploads by day
export const onChatFileUploaded = onObjectFinalized(
  {
    region: "us-central1",
  },
  onChatFileUploadedHandler
);
