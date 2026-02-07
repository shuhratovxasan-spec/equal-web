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
exports.onRatingCreatedHandler = onRatingCreatedHandler;
exports.onMessageCreatedHandler = onMessageCreatedHandler;
exports.onFlagCreatedHandler = onFlagCreatedHandler;
exports.onChatFileUploadedHandler = onChatFileUploadedHandler;
const admin = __importStar(require("firebase-admin"));
const firebase_functions_1 = require("firebase-functions");
const firestore_1 = require("firebase-admin/firestore");
// ====== CONFIG (под себя можно менять) ======
const LIMITS = {
    // сутки (UTC)
    messagesPerDayNew: 50,
    messagesPerDayTrusted: 200,
    messagesPerDayVerified: 500,
    filesPerDayNew: 5,
    filesPerDayTrusted: 20,
    filesPerDayVerified: 50,
    flagsPerDayNew: 3,
    flagsPerDayTrusted: 10,
    flagsPerDayVerified: 20,
    // временные лимиты
    limitHoursAfterSpam: 24, // блок сообщений на 24ч
    limitHoursAfterFlags: 24, // блок флагов на 24ч
    // auto-ban thresholds
    banIfFlagsAgainstUserToday: 5, // если на пользователя 5+ флагов за сутки -> бан
};
const TRUST = {
    // badge thresholds (по trustScore)
    trustedScore: 45,
    verifiedScore: 75,
    // minimum ratingCount gate for badges
    trustedMinRatings: 3,
    verifiedMinRatings: 10,
    // rating weight
    ratingWeight: 60, // вклад рейтинга в score
    activityWeight: 25, // вклад активности
    flagsWeight: 15, // штраф флагами
};
// ====== UTILS ======
function startOfUtcDay(date) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0));
}
function endOfUtcDay(date) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59));
}
function dayKeyUTC(date = new Date()) {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, "0");
    const d = String(date.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}
function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
}
function badgeFrom(score, ratingCount) {
    if (score >= TRUST.verifiedScore && ratingCount >= TRUST.verifiedMinRatings)
        return "Verified";
    if (score >= TRUST.trustedScore && ratingCount >= TRUST.trustedMinRatings)
        return "Trusted";
    return "New";
}
function limitsForBadge(badge) {
    if (badge === "Verified") {
        return {
            messagesPerDay: LIMITS.messagesPerDayVerified,
            filesPerDay: LIMITS.filesPerDayVerified,
            flagsPerDay: LIMITS.flagsPerDayVerified,
        };
    }
    if (badge === "Trusted") {
        return {
            messagesPerDay: LIMITS.messagesPerDayTrusted,
            filesPerDay: LIMITS.filesPerDayTrusted,
            flagsPerDay: LIMITS.flagsPerDayTrusted,
        };
    }
    return {
        messagesPerDay: LIMITS.messagesPerDayNew,
        filesPerDay: LIMITS.filesPerDayNew,
        flagsPerDay: LIMITS.flagsPerDayNew,
    };
}
async function incUsage(uid, field, delta = 1) {
    const key = dayKeyUTC();
    const ref = admin.firestore().doc(`usage/${uid}_${key}`);
    await admin.firestore().runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists) {
            tx.set(ref, {
                uid,
                dayKey: key,
                messages: field === "messages" ? delta : 0,
                files: field === "files" ? delta : 0,
                flags: field === "flags" ? delta : 0,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        else {
            tx.update(ref, {
                [field]: admin.firestore.FieldValue.increment(delta),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
    });
    return ref;
}
async function getUsage(uid) {
    const key = dayKeyUTC();
    const ref = admin.firestore().doc(`usage/${uid}_${key}`);
    const snap = await ref.get();
    return { ref, data: snap.exists ? snap.data() : null };
}
async function ensureUser(uid) {
    const ref = admin.firestore().doc(`users/${uid}`);
    const snap = await ref.get();
    if (!snap.exists) {
        // если user-doc не был создан на клиенте — создаём
        await ref.set({
            uid,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            trustScore: 0,
            badge: "New",
            ratingCount: 0,
            ratingAvg: 0,
            flagsAgainstToday: 0,
            isBanned: false,
        }, { merge: true });
        return (await ref.get()).data();
    }
    return snap.data();
}
async function setLimit(uid, field, hours) {
    const until = firestore_1.Timestamp.fromDate(new Date(Date.now() + hours * 3600 * 1000));
    await admin.firestore().doc(`users/${uid}`).set({
        [field]: until,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
}
async function banUser(uid, reason) {
    await admin.firestore().doc(`users/${uid}`).set({
        isBanned: true,
        banReason: reason,
        bannedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
}
// ====== TRUST CALC ======
async function calcTrustFor(uid) {
    var _a, _b;
    const user = await ensureUser(uid);
    // ratings aggregate (быстро: читаем последние 200 рейтингов)
    const ratingsSnap = await admin
        .firestore()
        .collection("ratings")
        .where("toUid", "==", uid)
        .orderBy("createdAt", "desc")
        .limit(200)
        .get();
    let sum = 0;
    let count = 0;
    ratingsSnap.forEach((d) => {
        const stars = Number(d.data().stars || 0);
        if (stars >= 1 && stars <= 5) {
            sum += stars;
            count += 1;
        }
    });
    const avg = count ? sum / count : 0;
    // activity: messages sent today (из usage)
    const usage = await getUsage(uid);
    const messagesToday = Number(((_a = usage.data) === null || _a === void 0 ? void 0 : _a.messages) || 0);
    const filesToday = Number(((_b = usage.data) === null || _b === void 0 ? void 0 : _b.files) || 0);
    // flags against user today
    const today = new Date();
    const from = startOfUtcDay(today);
    const to = endOfUtcDay(today);
    const flagsSnap = await admin
        .firestore()
        .collection("flags")
        .where("toUid", "==", uid)
        .where("createdAt", ">=", firestore_1.Timestamp.fromDate(from))
        .where("createdAt", "<=", firestore_1.Timestamp.fromDate(to))
        .get();
    const flagsAgainstToday = flagsSnap.size;
    // --- score parts ---
    // rating part: avg 1..5 -> 0..100 then weighted
    const ratingPart = count
        ? (clamp((avg - 1) / 4, 0, 1) * 100 * TRUST.ratingWeight) / 100
        : 0;
    // activity part: soft cap
    const activityRaw = clamp((messagesToday / 50) * 60 + (filesToday / 5) * 40, 0, 100);
    const activityPart = (activityRaw * TRUST.activityWeight) / 100;
    // flags penalty: 0 flags => 0 penalty, 5+ => full penalty
    const flagsRaw = clamp((flagsAgainstToday / 5) * 100, 0, 100);
    const flagsPenalty = (flagsRaw * TRUST.flagsWeight) / 100;
    const score = clamp(Math.round(ratingPart + activityPart - flagsPenalty), 0, 100);
    const badge = badgeFrom(score, count);
    const limits = limitsForBadge(badge);
    await admin.firestore().doc(`users/${uid}`).set({
        trustScore: score,
        badge,
        ratingCount: count,
        ratingAvg: avg,
        flagsAgainstToday,
        limits,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    return { score, badge, ratingCount: count, ratingAvg: avg, flagsAgainstToday, limits };
}
// ====== HANDLERS ======
async function onRatingCreatedHandler(event) {
    var _a;
    const data = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
    if (!data)
        return;
    const toUid = String(data.toUid || "");
    if (!toUid)
        return;
    firebase_functions_1.logger.info("rating created -> recalc trust", { toUid });
    await calcTrustFor(toUid);
}
async function onMessageCreatedHandler(event) {
    var _a, _b, _c;
    const msg = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
    if (!msg)
        return;
    const from = String(msg.from || "");
    const type = String(msg.type || "text");
    if (!from)
        return;
    // count usage
    await incUsage(from, "messages", 1);
    if (type === "file")
        await incUsage(from, "files", 1);
    // get user + trust/badge + limits
    const user = await ensureUser(from);
    const badge = user.badge || "New";
    const limits = limitsForBadge(badge);
    const usage = await getUsage(from);
    const messagesToday = Number(((_b = usage.data) === null || _b === void 0 ? void 0 : _b.messages) || 0);
    const filesToday = Number(((_c = usage.data) === null || _c === void 0 ? void 0 : _c.files) || 0);
    // enforce limits -> if exceeded, set limitedUntil
    if (messagesToday > limits.messagesPerDay) {
        firebase_functions_1.logger.warn("message limit exceeded -> limiting user", { from, messagesToday, limit: limits.messagesPerDay });
        await setLimit(from, "limitedUntil", LIMITS.limitHoursAfterSpam);
    }
    if (type === "file" && filesToday > limits.filesPerDay) {
        firebase_functions_1.logger.warn("file limit exceeded -> limiting user", { from, filesToday, limit: limits.filesPerDay });
        await setLimit(from, "limitedUntil", LIMITS.limitHoursAfterSpam);
    }
    // OPTIONAL: keep trust fresh sometimes
    // (чтобы не дергать на каждый msg — можно реже, но сейчас ок)
    await calcTrustFor(from).catch(() => { });
}
async function onFlagCreatedHandler(event) {
    var _a, _b;
    const flag = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
    if (!flag)
        return;
    const fromUid = String(flag.fromUid || "");
    const toUid = String(flag.toUid || "");
    if (!fromUid || !toUid)
        return;
    await incUsage(fromUid, "flags", 1);
    // enforce flag per-day limits for reporter
    const reporter = await ensureUser(fromUid);
    const badge = reporter.badge || "New";
    const limits = limitsForBadge(badge);
    const usage = await getUsage(fromUid);
    const flagsToday = Number(((_b = usage.data) === null || _b === void 0 ? void 0 : _b.flags) || 0);
    if (flagsToday > limits.flagsPerDay) {
        firebase_functions_1.logger.warn("flag limit exceeded -> limiting flags", { fromUid, flagsToday, limit: limits.flagsPerDay });
        await setLimit(fromUid, "flagLimitedUntil", LIMITS.limitHoursAfterFlags);
    }
    // auto-ban target if too many flags against today
    const today = new Date();
    const from = startOfUtcDay(today);
    const to = endOfUtcDay(today);
    const flagsAgainstSnap = await admin
        .firestore()
        .collection("flags")
        .where("toUid", "==", toUid)
        .where("createdAt", ">=", firestore_1.Timestamp.fromDate(from))
        .where("createdAt", "<=", firestore_1.Timestamp.fromDate(to))
        .get();
    const flagsAgainstToday = flagsAgainstSnap.size;
    await admin.firestore().doc(`users/${toUid}`).set({
        flagsAgainstToday,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    if (flagsAgainstToday >= LIMITS.banIfFlagsAgainstUserToday) {
        firebase_functions_1.logger.error("auto-ban user due to flags", { toUid, flagsAgainstToday });
        await banUser(toUid, `Auto-ban: ${flagsAgainstToday} flags today`);
    }
    // recalc trust for both
    await calcTrustFor(fromUid).catch(() => { });
    await calcTrustFor(toUid).catch(() => { });
}
/**
 * Storage finalize hook: when a file uploaded under chatFiles/... we count it.
 * This prevents "send file" attempts from bypassing file/day limit.
 */
async function onChatFileUploadedHandler(event) {
    const object = event.data;
    const name = (object === null || object === void 0 ? void 0 : object.name) || "";
    if (!name)
        return;
    // expect: chatFiles/{chatId}/{uid}/...
    if (!name.startsWith("chatFiles/"))
        return;
    const parts = name.split("/");
    if (parts.length < 3)
        return;
    const uid = parts[2];
    if (!uid)
        return;
    await incUsage(uid, "files", 1).catch(() => { });
    await calcTrustFor(uid).catch(() => { });
}
//# sourceMappingURL=trust_limit.js.map