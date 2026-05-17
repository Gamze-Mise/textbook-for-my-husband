import {
  cloudinaryDeliveryPublicId,
  cloudinaryExampleAudioFolder,
  cloudinaryWordAudioFolder,
  cloudinaryWordImageFolder,
} from "@/lib/cloudinaryAsset";
import { cloudinary } from "@/lib/cloudinary";

export type { CloudinaryAssetDeleteJob } from "@/lib/cloudinaryDeleteQueue";
export { queueCloudinaryAssetReplace } from "@/lib/cloudinaryDeleteQueue";

export async function deleteCloudinaryAsset(args: {
  stored: string | null | undefined;
  folder: string;
  resourceType: "video" | "image";
}): Promise<void> {
  const publicId = cloudinaryDeliveryPublicId(args.stored, args.folder);
  if (!publicId) return;

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: args.resourceType,
      invalidate: true,
    });
    if (result.result !== "ok" && result.result !== "not found") {
      console.warn("[cloudinary delete] unexpected result:", publicId, result.result);
    }
  } catch (e) {
    console.error("[cloudinary delete]", publicId, e);
  }
}

/** Remove all media for a word from Cloudinary (best-effort; does not throw). */
export async function deleteWordCloudinaryAssets(word: {
  userId: number;
  audioPublicId: string | null;
  exampleAudioPublicId: string | null;
  imagePublicId: string | null;
}): Promise<void> {
  await Promise.allSettled([
    deleteCloudinaryAsset({
      stored: word.audioPublicId,
      folder: cloudinaryWordAudioFolder(word.userId),
      resourceType: "video",
    }),
    deleteCloudinaryAsset({
      stored: word.exampleAudioPublicId,
      folder: cloudinaryExampleAudioFolder(word.userId),
      resourceType: "video",
    }),
    deleteCloudinaryAsset({
      stored: word.imagePublicId,
      folder: cloudinaryWordImageFolder(word.userId),
      resourceType: "image",
    }),
  ]);
}
