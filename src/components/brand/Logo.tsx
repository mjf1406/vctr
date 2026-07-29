/** @format */

import logo from "/brand/logo/icon-and-text-horizontal.webp";
import icon from "/brand/logo/icon-688.webp";
import textLogo from "/brand/logo/text.webp";
import logoXS from "/brand/logo/icon-86.webp";
import { APP_CONFIG } from "@/config/app";
import { ImageSkeleton } from "../ui/image-skeleton";

export function LogoBig() {
  return <ImageSkeleton src={logo} alt={`${APP_CONFIG.name} Logo`} width={399} height={125} />;
}

export function Logo() {
  return (
    <ImageSkeleton
      src={logo}
      alt={`${APP_CONFIG.name} Logo`}
      width={169}
      height={53}
      objectFit="contain"
    />
  );
}

export function Icon({ className }: { className?: string } = {}) {
  const width = className ? undefined : 64;
  const height = className ? undefined : 64;
  return (
    <ImageSkeleton
      src={icon}
      alt={`${APP_CONFIG.name} Icon`}
      width={width}
      height={height}
      className={className}
    />
  );
}

export function TextLogo({ className }: { className?: string } = {}) {
  const width = className ? undefined : 200;
  const height = className ? undefined : 40;
  return (
    <ImageSkeleton
      src={textLogo}
      alt={`${APP_CONFIG.name} Text Logo`}
      width={width}
      height={height}
      className={className}
    />
  );
}

export function LogoXS({ className }: { className?: string } = {}) {
  const width = className ? undefined : 172;
  const height = className ? undefined : 155;
  return (
    <ImageSkeleton
      src={logoXS}
      alt={`${APP_CONFIG.name} Logo`}
      width={width}
      height={height}
      className={className}
    />
  );
}
