"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Slide } from "@/lib/deck";

export const SLIDE_WIDTH = 1280;
export const SLIDE_HEIGHT = 720;

interface SlideViewProps {
  slide: Slide;
  /** Highest step index to reveal; omit to reveal everything. */
  step?: number;
  scale?: number;
}

/** One rendered slide at its natural 1280x720 size, optionally scaled. */
export function SlideView({ slide, step = Number.MAX_SAFE_INTEGER, scale = 1 }: SlideViewProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    root.querySelectorAll<HTMLElement>(".step").forEach((node) => {
      const index = Number(node.dataset.step ?? "0");
      node.dataset.visible = index <= step ? "true" : "false";
    });
  }, [slide.html, step]);

  return (
    <div
      ref={ref}
      className="slide"
      data-layout={slide.layout}
      style={scale === 1 ? undefined : { transform: `scale(${scale})` }}
      dangerouslySetInnerHTML={{ __html: slide.html }}
    />
  );
}

interface SlideFrameProps extends SlideViewProps {
  /** Replay the transition when this changes (usually the slide index). */
  transitionKey?: number;
}

/** Fits a slide to its container while keeping the 16:9 shape exact. */
export function SlideFrame({ slide, step, transitionKey }: SlideFrameProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useLayoutEffect(() => {
    const element = wrapRef.current;
    if (!element) return;

    const measure = () => {
      const { width, height } = element.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      setScale(Math.min(width / SLIDE_WIDTH, height / SLIDE_HEIGHT));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="stage-wrap" ref={wrapRef}>
      <div
        className="slide-frame slide-stage"
        style={{ width: SLIDE_WIDTH * scale, height: SLIDE_HEIGHT * scale }}
      >
        <SlideView key={transitionKey} slide={slide} step={step} scale={scale} />
      </div>
    </div>
  );
}
