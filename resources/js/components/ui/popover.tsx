"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface PopoverContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const PopoverContext = React.createContext<PopoverContextType | undefined>(undefined);

const usePopover = () => {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error("usePopover must be used within a Popover component");
  }
  return context;
};

interface PopoverProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Popover = ({ children, open: controlledOpen, onOpenChange }: PopoverProps) => {
  const [internalOpen, setInternalOpen] = React.useState(false);
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div className="relative">{children}</div>
    </PopoverContext.Provider>
  );
};

interface PopoverTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
}

const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ asChild = false, children, className, ...props }, ref) => {
    const { open, setOpen } = usePopover();

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...props,
        ref,
        onClick: (e: React.MouseEvent) => {
          e.preventDefault();
          setOpen(!open);
          if (children.props.onClick) {
            children.props.onClick(e);
          }
        },
      });
    }

    return (
      <button
        ref={ref}
        className={className}
        onClick={() => setOpen(!open)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

PopoverTrigger.displayName = "PopoverTrigger";

interface PopoverContentProps {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
}

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  ({ children, className, align = "center", side = "bottom", sideOffset = 4, ...props }, ref) => {
    const { open, setOpen } = usePopover();
    const contentRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
          setOpen(false);
        }
      };

      if (open) {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
      }
    }, [open, setOpen]);

    React.useEffect(() => {
      const handleEscapeKey = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setOpen(false);
        }
      };

      if (open) {
        document.addEventListener("keydown", handleEscapeKey);
        return () => document.removeEventListener("keydown", handleEscapeKey);
      }
    }, [open, setOpen]);

    if (!open) return null;

    const getPositionClasses = () => {
      let classes = "absolute z-50 ";
      
      if (side === "bottom") {
        classes += `top-full mt-${sideOffset} `;
      } else if (side === "top") {
        classes += `bottom-full mb-${sideOffset} `;
      } else if (side === "left") {
        classes += `right-full mr-${sideOffset} `;
      } else if (side === "right") {
        classes += `left-full ml-${sideOffset} `;
      }

      if (align === "start") {
        classes += side === "bottom" || side === "top" ? "left-0 " : "top-0 ";
      } else if (align === "end") {
        classes += side === "bottom" || side === "top" ? "right-0 " : "bottom-0 ";
      } else {
        classes += side === "bottom" || side === "top" ? "left-1/2 transform -translate-x-1/2 " : "top-1/2 transform -translate-y-1/2 ";
      }

      return classes;
    };

    return (
      <div
        ref={(node) => {
          contentRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className={cn(
          getPositionClasses(),
          "min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-none",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent };