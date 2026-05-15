import Image from "next/image";

export default function LogoMark() {
  return (
    <div className="size-10 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
      <Image
        src="/favicon.png"
        alt="Vocabulary"
        width={40}
        height={40}
        priority
      />
    </div>
  );
}

