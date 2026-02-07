"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.onChatFileUploaded = exports.onFlagCreated = exports.onMessageCreated = exports.onRatingCreated = void 0;
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-functions/v2/firestore");
const storage_1 = require("firebase-functions/v2/storage");
admin.initializeApp();
const trust_limits_1 = require("./trust_limits");
// 1) rating created -> recalc trust for target user
exports.onRatingCreated = (0, firestore_1.onDocumentCreated)({
    document: "ratings/{id}",
    region: "us-central1",
}, trust_limits_1.onRatingCreatedHandler);
// 2) message created -> enforce message limits & trust reactions
exports.onMessageCreated = (0, firestore_1.onDocumentCreated)({
    document: "chats/{chatId}/messages/{msgId}",
    region: "us-central1",
}, trust_limits_1.onMessageCreatedHandler);
// 3) flag created -> enforce flag limits & possibly ban/limit target
exports.onFlagCreated = (0, firestore_1.onDocumentCreated)({
    document: "flags/{id}",
    region: "us-central1",
}, trust_limits_1.onFlagCreatedHandler);
// 4) storage upload (optional but recommended): count file uploads by day
exports.onChatFileUploaded = (0, storage_1.onObjectFinalized)({
    region: "us-central1",
}, trust_limits_1.onChatFileUploadedHandler);
//# sourceMappingURL=index.js.map