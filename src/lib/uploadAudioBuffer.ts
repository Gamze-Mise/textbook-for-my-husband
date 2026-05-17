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

  const audioSrc = cloudinaryVideoDeliveryUrl(uploaded.public_id);
  if (!audioSrc) {
    throw new Error("Cloudinary delivery URL could not be built.");
  }

  return {
    audioPublicId: uploaded.public_id,
    audioSrc,
  };
}
