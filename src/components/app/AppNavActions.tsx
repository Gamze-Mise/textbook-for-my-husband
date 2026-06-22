import AppAccountMenu from "@/components/app/AppAccountMenu";
import AppNavLink from "@/components/app/AppNavLink";
import AppQuizNavLink from "@/components/app/AppQuizNavLink";
import PreviewSignInLink from "@/components/preview/PreviewSignInLink";
import { routesForMode } from "@/lib/preview/paths";
import type { AppMode } from "@/types/appMode";

type NavVariant = "library" | "study" | "quiz";

type Props = {
  mode: AppMode;
  variant: NavVariant;
};

export default function AppNavActions({ mode, variant }: Props) {
  const routes = routesForMode(mode);
  const isPreview = mode === "preview";

  return (
    <>
      {variant !== "library" ? (
        <AppNavLink href={routes.library}>Library</AppNavLink>
      ) : null}
      {variant !== "study" ? (
        <AppNavLink href={routes.study}>Study</AppNavLink>
      ) : null}
      {variant !== "quiz" ? (
        <AppQuizNavLink basePath={routes.quiz} />
      ) : null}
      {isPreview ? <PreviewSignInLink /> : <AppAccountMenu />}
    </>
  );
}
