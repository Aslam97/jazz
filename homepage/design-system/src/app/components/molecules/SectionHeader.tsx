import { ReactNode } from "react";
import { H2 } from "../atoms/Headings";
import clsx from "clsx";

function H2Sub({ children }: { children: React.ReactNode }) {
    return (
        <p
            className={clsx(
                "text-lg lg:text-xl",
                "leading-snug",
                "tracking-tight",
                "max-w-2xl",
                "text-stone-700 dark:text-stone-500",
            )}
        >
            {children}
        </p>
    );
}

export function SectionHeader({
    title,
    slogan,
    className,
}: {
    title: ReactNode;
    slogan: ReactNode;
    className?: string;
}) {
    return (
        <hgroup className={clsx(className, "mb-5")}>
            <H2>{title}</H2>
            <H2Sub>{slogan}</H2Sub>
        </hgroup>
    );
}
