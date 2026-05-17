import type { Word } from "@prisma/client";
import {
  cloudinaryDeliveryPublicId,
  cloudinaryExampleAudioFolder,
  cloudinaryWordAudioFolder,
  cloudinaryWordImageFolder,
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
  const imageFolder = cloudinaryWordImageFolder(w.userId);

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
      cloudinaryDeliveryPublicId(w.imagePublicId, imageFolder),
    ),
    imageFocusX: w.imageFocusX,
    imageFocusY: w.imageFocusY,
    imageObjectPosition: objectPositionFromFocus(w.imageFocusX, w.imageFocusY),
  };
}
