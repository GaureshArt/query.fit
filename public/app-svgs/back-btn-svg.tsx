import { cn } from "@/lib/utils";

export default function BackBtnSvg() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width="18px"
      height="18px"
      viewBox="0 0 20 20"
    >
      <line
        x1="17"
        y1="10"
        x2="3"
        y2="10"
        fill="none"
        stroke="rgba(34, 34, 34, 0.83)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        data-color="color-2"
      ></line>
      <polyline
        points="8 5 3 10 8 15"
        fill="none"
        stroke="rgba(34, 34, 34, 0.83)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      ></polyline>
    </svg>
  );
}
