import Image from "next/image";

export type MascotVariant =
  | "main"
  | "talking"
  | "watching"
  | "avatar"
  | "mini"
  | "welcome"
  | "intro";

const variantMap: Record<MascotVariant, string> = {
  main: "/images/mascot/xiaoman-main.svg",
  talking: "/images/mascot/xiaoman-talking.svg",
  watching: "/images/mascot/xiaoman-watching.svg",
  avatar: "/images/mascot/xiaoman-avatar.svg",
  mini: "/images/mascot/xiaoman-mini.svg",
  welcome: "/images/mascot/xiaoman-welcome.svg",
  intro: "/images/mascot/xiaoman-intro.svg"
};

export function Mascot({
  variant,
  width,
  height,
  className,
  priority = false
}: {
  variant: MascotVariant;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={variantMap[variant]}
      alt="小满"
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
}
