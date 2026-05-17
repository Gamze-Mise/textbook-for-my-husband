import {
  cloudinaryDeliveryPublicId,
  cloudinaryExampleAudioFolder,
  cloudinaryWordAudioFolder,
  cloudinaryWordImageDeliveryPublicId,
} from "@/lib/cloudinaryAsset";
import { cloudinary } from "@/lib/cloudinary";

export type { CloudinaryAssetDeleteJob } from "@/lib/cloudinaryDeleteQueue";
export { queueCloudinaryAssetReplace } from "@/lib/cloudinaryDeleteQueue";

export type CloudinaryResolvedDeleteJob = {
  publicId: string;
  resourceType: "video" | "image";
};

export async function deleteCloudinaryAssetByPublicId(
  publicId: string,
  resourceType: "video" | "image",
): Promise<void> {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });
    if (result.result !== "ok" && result.result !== "not found") {
      console.warn("[cloudinary delete] unexpected result:", publicId, result.result);
    }
  } catch (e) {
    console.error("[cloudinary delete]", publicId, e);
  }
}

export async function deleteCloudinaryAsset(args: {
  stored: string | null | undefined;
  folder: string;
  resourceType: "video" | "image";
}): Promise<void> {
  const publicId = cloudinaryDeliveryPublicId(args.stored, args.folder);
  if (!publicId) return;
  await deleteCloudinaryAssetByPublicId(publicId, args.resourceType);
}

export function queueCloudinaryImageReplace(
  jobs: CloudinaryResolvedDeleteJob[],
  args: {
    previous: string | null;
    next: string | null | undefined;
    userId: number;
  },
): void {
  if (!args.previous) return;
  if (args.next === undefined) return;
  if ((args.next ?? null) === args.previous) return;
  const publicId = cloudinaryWordImageDeliveryPublicId(args.previous, args.userId);
  if (publicId) jobs.push({ publicId, resourceType: "image" });
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
    (async () => {
      const publicId = cloudinaryWordImageDeliveryPublicId(
        word.imagePublicId,
        word.userId,
      );
      if (publicId) await deleteCloudinaryAssetByPublicId(publicId, "image");
    })(),
  ]);
}
