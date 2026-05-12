import type { Word } from "@prisma/client";
import {
  cloudinaryImageDeliveryUrl,
  cloudinaryVideoDeliveryUrl,
} from "@/lib/cloudinaryDelivery";

/** API/client payload: only Cloudinary ids in DB; playback URLs derived at read time. */
export function wordToClient(w: Word) {
  return {
    id: String(w.id),
    term: w.term,
    meaning: w.meaning,
    example: w.example,
    bucket: w.bucket,
    audioPublicId: w.audioPublicId,
    exampleAudioPublicId: w.exampleAudioPublicId,
    audioSrc: cloudinaryVideoDeliveryUrl(w.audioPublicId),
    exampleAudioSrc: cloudinaryVideoDeliveryUrl(w.exampleAudioPublicId),
    imagePublicId: w.imagePublicId,
    imageSrc: cloudinaryImageDeliveryUrl(w.imagePublicId),
  };
}
