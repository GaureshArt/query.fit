import { cn } from "@/lib/utils";


interface IPlusSvgProps{
  opacity?:number
}
export default function PlusSvg({opacity = 0.4}:IPlusSvgProps) {
  return (
    <>
    
    <svg width="32" height="32" viewBox="0 0 48 48" className={cn(
        "stroke-zinc-900 absolute -left-4 -top-4"
    )}>
      <g fill="none" opacity={opacity}>
        <path d="M48 23.5L0 23.5" ></path>
        <path d="M48 47.5001L0 " ></path>
        <path d="M23.5 0V48" ></path>
        <path d="M47.5 " ></path>
      </g>
    </svg>
    <svg width="32" height="32" viewBox="0 0 48 48" className={cn(
        "stroke-zinc-900 absolute -right-4 -top-4"
    )}>
      <g fill="none" opacity={opacity}>
        <path d="M48 23.5L0 23.5" ></path>
        <path d="M48 47.5001L0 " ></path>
        <path d="M23.5 0V48" ></path>
        <path d="M47.5 " ></path>
      </g>
    </svg>
    <svg width="32" height="32" viewBox="0 0 48 48" className={cn(
        "stroke-zinc-900 absolute -left-4 -bottom-4"
    )}>
      <g fill="none" opacity={opacity}>
        <path d="M48 23.5L0 23.5" ></path>
        <path d="M48 47.5001L0 " ></path>
        <path d="M23.5 0V48" ></path>
        <path d="M47.5 " ></path>
      </g>
    </svg>
    <svg width="32" height="32" viewBox="0 0 48 48" className={cn(
        "stroke-zinc-900 absolute -right-4 -bottom-4"
    )}>
      <g fill="none" opacity={opacity}>
        <path d="M48 23.5L0 23.5" ></path>
        <path d="M48 47.5001L0 " ></path>
        <path d="M23.5 0V48" ></path>
        <path d="M47.5 " ></path>
      </g>
    </svg>
    </>
  );
}
