"use client";
import React from "react";
import { motion } from "framer-motion";

export type MotionImgProps = React.ComponentPropsWithoutRef<typeof motion.img>;

export default function MotionImg(props: MotionImgProps) {
  return <motion.img {...props} />;
}
