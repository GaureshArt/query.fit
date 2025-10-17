import { cn } from "@/lib/utils";

export default function BorderPlusUi() {
    return (
        <>
            <div
                className={cn(
                    "absolute -right-2 -top-2 font-extralight transition-all duration-200",
                    "group-hover:-right-1 group-hover:-top-1 group-hover:rotate-45"
                )}
            >
                +
            </div>

            <div
                className={cn(
                    "absolute -right-2 -bottom-2 font-extralight transition-all duration-200",
                    "group-hover:-right-1 group-hover:-bottom-1 group-hover:rotate-45"
                )}
            >
                +
            </div>

            <div
                className={cn(
                    "absolute -left-2 -top-2 font-extralight transition-all duration-200",
                    "group-hover:-left-1 group-hover:-top-1 group-hover:rotate-45"
                )}
            >
                +
            </div>

            <div
                className={cn(
                    "absolute -left-2 -bottom-2 font-extralight transition-all duration-200",
                    "group-hover:-left-1 group-hover:-bottom-1 group-hover:rotate-45"
                )}
            >
                +
            </div>
        </>
    );
}
