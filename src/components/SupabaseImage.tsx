import { useEffect, useState, type ImgHTMLAttributes } from "react";
import { supabase } from "@/integrations/supabase/client";
import { proxyImg } from "@/lib/site-data";

function mediaPathFromUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith("supabase.co")) return null;

    const publicPrefix = "/storage/v1/object/public/media/";
    const signedPrefix = "/storage/v1/object/sign/media/";
    const rawPrefix = "/storage/v1/object/media/";
    const prefix = [publicPrefix, signedPrefix, rawPrefix].find((item) => parsed.pathname.startsWith(item));
    if (!prefix) return null;

    return decodeURIComponent(parsed.pathname.slice(prefix.length));
  } catch {
    return null;
  }
}

export function SupabaseImage({ src, alt, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [resolvedSrc, setResolvedSrc] = useState(() => proxyImg(src));

  useEffect(() => {
    let mounted = true;
    const originalSrc = typeof src === "string" ? src : "";
    const mediaPath = originalSrc ? mediaPathFromUrl(originalSrc) : null;

    if (!mediaPath) {
      setResolvedSrc(proxyImg(originalSrc));
      return () => {
        mounted = false;
      };
    }

    supabase.storage
      .from("media")
      .createSignedUrl(mediaPath, 60 * 60)
      .then(({ data, error }) => {
        if (!mounted) return;
        setResolvedSrc(error || !data?.signedUrl ? originalSrc : data.signedUrl);
      });

    return () => {
      mounted = false;
    };
  }, [src]);

  if (!src) return null;

  return (
    <img
      src={resolvedSrc}
      alt={alt ?? ""}
      loading={props.loading ?? "lazy"}
      decoding={props.decoding ?? "async"}
      {...props}
    />
  );
}