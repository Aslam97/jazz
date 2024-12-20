import clsx from "clsx";
import { LucideIcon } from "lucide-react";
import { Prose } from "./Prose";

export function LabelledFeatureIcon({
  label,
  icon: Icon,
  explanation,
  className,
}: {
  label: string;
  icon: LucideIcon;
  explanation: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        className,
        "text-base",
        "rounded-xl",
        "border p-4 shadow-sm",
      )}
    >
      <Icon
        className="size-8 text-blue p-1.5 rounded-lg bg-blue-50 dark:text-blue-500 dark:bg-stone-900 mb-2.5 md:size-10"
        strokeWidth={1.5}
        strokeLinecap="butt"
        size={80}
      />
      <div className="text-stone-900 font-medium md:text-base dark:text-stone-100 mb-2">
        {label}
      </div>
      <Prose>{explanation}</Prose>
    </div>
  );
}
