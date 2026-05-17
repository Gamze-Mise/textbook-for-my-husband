import {
  cloudinaryDeliveryPublicId,
  cloudinaryStoragePublicId,
} from "@/lib/cloudinaryAsset";
import { cloudinary } from "@/lib/cloudinary";
import { cloudinaryVideoDeliveryUrl } from "@/lib/cloudinaryDelivery";

export async function uploadAudioBuffer(args: {
  buffer: Buffer;
  folder: string;
  publicId: string;
}): Promise<{ audioPublicId: string; audioSrc: string }> {
  const uploaded = await new Promise<{ public_id: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder: args.folder,
        public_id: args.publicId,
        overwrite: true,
      },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve({ public_id: result.public_id });
      },
    );
    stream.end(args.buffer);
  });

  const audioPublicId = cloudinaryStoragePublicId(
    uploaded.public_id,
    args.folder,
  );
  const audioSrc = cloudinaryVideoDeliveryUrl(
    cloudinaryDeliveryPublicId(audioPublicId, args.folder),
  );
  if (!audioSrc) {
    throw new Error("Cloudinary delivery URL could not be built.");
  }

  return {
    audioPublicId,
    audioSrc,
  };
}
