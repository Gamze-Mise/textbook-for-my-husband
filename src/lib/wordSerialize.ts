import type { Word } from "@prisma/client";
import {
  cloudinaryDeliveryPublicId,
  cloudinaryExampleAudioFolder,
  cloudinaryWordAudioFolder,
  cloudinaryWordImageDeliveryPublicId,
} from "@/lib/cloudinaryAsset";
import {
  cloudinaryImageDeliveryUrl,
  cloudinaryVideoDeliveryUrl,
} from "@/lib/cloudinaryDelivery";
import { objectPositionFromFocus } from "@/lib/wordImageFocus";

/** API/client payload: only Cloudinary ids in DB; playback URLs derived at read time. */
export function wordToClient(w: Word) {
  const wordAudioFolder = cloudinaryWordAudioFolder(w.userId);
  const exampleAudioFolder = cloudinaryExampleAudioFolder(w.userId);
  return {
    id: String(w.id),
    term: w.term,
    meaning: w.meaning,
    example: w.example,
    bucket: w.bucket,
    audioPublicId: w.audioPublicId,
    exampleAudioPublicId: w.exampleAudioPublicId,
    audioSrc: cloudinaryVideoDeliveryUrl(
      cloudinaryDeliveryPublicId(w.audioPublicId, wordAudioFolder),
    ),
    exampleAudioSrc: cloudinaryVideoDeliveryUrl(
      cloudinaryDeliveryPublicId(w.exampleAudioPublicId, exampleAudioFolder),
    ),
    imagePublicId: w.imagePublicId,
    imageSrc: cloudinaryImageDeliveryUrl(
      cloudinaryWordImageDeliveryPublicId(w.imagePublicId, w.userId),
    ),
    imageFocusX: w.imageFocusX,
    imageFocusY: w.imageFocusY,
    imageObjectPosition: objectPositionFromFocus(w.imageFocusX, w.imageFocusY),
  };
}
