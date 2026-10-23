import type { ReactNode } from "react";
import P3Veil from "@/components/P3Veil";

/* tag 区共享布局:P3Veil 挂在这里 —— /tags 与 /tags/[tag] 之间导航时
   布局持久存活,纱幕不卸载、不重挂,转场覆盖态全程连续(修 iOS 闪帧)。 */
export default function TagsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <P3Veil />
      {children}
    </>
  );
}
