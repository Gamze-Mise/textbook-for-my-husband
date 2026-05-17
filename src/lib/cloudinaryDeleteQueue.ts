export type CloudinaryAssetDeleteJob = {
  stored: string;
  folder: string;
  resourceType: "video" | "image";
};

/** Queue removal of a replaced or cleared Cloudinary asset. */
export function queueCloudinaryAssetReplace(
  jobs: CloudinaryAssetDeleteJob[],
  args: {
    previous: string | null;
    next: string | null | undefined;
    folder: string;
    resourceType: "video" | "image";
  },
): void {
  if (!args.previous) return;
  if (args.next === undefined) return;
  if ((args.next ?? null) === args.previous) return;
  jobs.push({
    stored: args.previous,
    folder: args.folder,
    resourceType: args.resourceType,
  });
}
