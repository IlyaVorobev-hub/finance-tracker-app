declare module "next/link" {
  import { ComponentPropsWithoutRef, ComponentType } from "react";

  interface LinkProps extends ComponentPropsWithoutRef<"a"> {
    href: string;
    replace?: boolean;
    scroll?: boolean;
    prefetch?: boolean | null;
  }

  const Link: ComponentType<LinkProps>;
  export default Link;
}

declare module "next/navigation" {
  export function useRouter(): {
    push: (url: string) => void;
    replace: (url: string) => void;
    prefetch: (url: string) => void;
    back: () => void;
    refresh: () => void;
  };
  export function usePathname(): string;
  export function useSearchParams(): URLSearchParams;
  export function useParams<T extends Record<string, string> = Record<string, string>>(): T;
  export function redirect(url: string): never;
}

declare module "next/server" {
  import { NextRequest as BaseNextRequest } from "next/dist/server/web/spec-extension/request";
  import { NextResponse as BaseNextResponse } from "next/dist/server/web/spec-extension/response";

  export type NextRequest = BaseNextRequest;
  export const NextResponse: typeof BaseNextResponse;
  export type NextResponse<T = unknown> = BaseNextResponse<T>;
}

declare module "next" {
  const next: {
    version: string;
  };
  export default next;

  export interface Metadata {
    title?: string | { default: string; template?: string };
    description?: string;
    [key: string]: unknown;
  }

  export type NextConfig = Record<string, unknown>;
}

declare module "next/dist/lib/metadata/types/metadata-interface.js" {
  export interface ResolvingMetadata {}
  export interface ResolvingViewport {}
}

declare module "next/types.js" {
  export interface ResolvingMetadata {}
  export interface ResolvingViewport {}
}

declare module "next/font/google" {
  interface NextFont {
    className: string;
    style: { fontFamily: string; fontWeight?: string };
  }

  export function Inter(options?: { subsets?: string[]; weight?: string | string[] }): NextFont;
  export function Roboto(options?: { subsets?: string[]; weight?: string | string[] }): NextFont;
}
