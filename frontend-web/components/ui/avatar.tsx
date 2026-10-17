import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarContextValue {
  imageLoaded: boolean;
  setImageLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  imageError: boolean;
  setImageError: React.Dispatch<React.SetStateAction<boolean>>;
}

const AvatarContext = React.createContext<AvatarContextValue | undefined>(undefined);

const Avatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  return (
    <AvatarContext.Provider
      value={{ imageLoaded, setImageLoaded, imageError, setImageError }}
    >
      <div
        ref={ref}
        className={cn(
          "relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border bg-muted",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </AvatarContext.Provider>
  );
});
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, src, alt, ...props }, ref) => {
  const context = React.useContext(AvatarContext);

  React.useEffect(() => {
    // Reset status when src changes
    if (context) {
      context.setImageLoaded(false);
      context.setImageError(false);
    }
  }, [src]);

  if (!src || context?.imageError) {
    return null;
  }

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      onLoad={() => context?.setImageLoaded(true)}
      onError={() => context?.setImageError(true)}
      className={cn(
        "aspect-square h-full w-full object-cover transition-opacity duration-200",
        context?.imageLoaded ? "opacity-100" : "opacity-0",
        className
      )}
      {...props}
    />
  );
});
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const context = React.useContext(AvatarContext);

  // If image loaded successfully, hide fallback
  if (context?.imageLoaded && !context?.imageError) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted font-heading text-xs font-semibold uppercase text-muted-foreground select-none",
        className
      )}
      {...props}
    />
  );
});
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
