// lib/upload.ts
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase";

export async function uploadChatFile(args: {
  chatId: string;
  file: File;
}): Promise<{
  url: string;
  path: string;
  contentType: string;
  name: string;
  size: number;
}> {
  const { chatId, file } = args;
  if (!chatId) throw new Error("uploadChatFile: chatId is required");
  if (!file) throw new Error("uploadChatFile: file is required");

  const safeName = file.name.replace(/[^\w.\-() ]+/g, "_");
  const path = `chats/${chatId}/${Date.now()}_${safeName}`;
  const fileRef = ref(storage, path);

  await uploadBytes(fileRef, file, {
    contentType: file.type || "application/octet-stream",
  });

  const url = await getDownloadURL(fileRef);

  return {
    url,
    path,
    contentType: file.type || "application/octet-stream",
    name: file.name,
    size: file.size,
  };
}
