import Image from "next/image";

type Props = {
  className?: string;
};

export default function LogoMark({ className = "" }: Props) {
  return (
    <div
      className={[
        "size-10 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 transition-opacity dark:bg-zinc-950 dark:ring-zinc-800",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
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
