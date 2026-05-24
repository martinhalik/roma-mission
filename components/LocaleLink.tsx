"use client";

import Link from "next/link";
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { useTranslation } from "@/components/LanguageProvider";
import { buildPath, type RouteKey } from "@/lib/i18n/routes";

type LinkProps = ComponentPropsWithoutRef<typeof Link>;

type LocaleLinkProps =
  | (Omit<LinkProps, "href"> & { routeKey: RouteKey; href?: never })
  | (LinkProps & { routeKey?: undefined });

const LocaleLink = forwardRef<HTMLAnchorElement, LocaleLinkProps>(
  function LocaleLink(props, ref) {
    const { locale } = useTranslation();
    if ("routeKey" in props && props.routeKey) {
      const { routeKey, ...rest } = props;
      return <Link ref={ref} href={buildPath(locale, routeKey)} {...rest} />;
    }
    return <Link ref={ref} {...(props as LinkProps)} />;
  }
);

export default LocaleLink;
