"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const MovingBorder = ({
  children,
  duration = 2000,
  className,
  containerClassName,
  borderClassName,
  as: Component = "button",
  ...otherProps
}) => {
  return (
    <Component
      className={cn(
        "relative p-[1px] overflow-hidden",
        containerClassName
      )}
      {...otherProps}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(90deg, transparent, #3b82f6, transparent)`,
        }}
      >
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: duration / 1000,
            repeat: Infinity,
            ease: "linear",
          }}
          className={cn(
            "absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent",
            borderClassName
          )}
        />
      </div>
      <div
        className={cn(
          "relative bg-slate-900 backdrop-blur-xl text-white flex items-center justify-center",
          className
        )}
      >
        {children}
      </div>
    </Component>
  );
};
