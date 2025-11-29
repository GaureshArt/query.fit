import { ShimmeringText } from "@/components/external-ui/shimmering-text";
import {
  SlideToUnlock,
  SlideToUnlockHandle,
  SlideToUnlockText,
  SlideToUnlockTrack,
} from "@/components/external-ui/slide-to-unlock";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface IQueryApproveInterruptProps {
  value: string;
  approveSubmit: () => void;
  disapproveSubmit: () => void;
}
export default function QueryApproveInterrupt({
  value,
  approveSubmit,
  disapproveSubmit,
}: IQueryApproveInterruptProps) {
  return (
    <div className="w-full px-4 py-2 border rounded-md text-red-400 font-bold">
      interrupt: {value}
      <div className="flex gap-4">
        <SlideToUnlock
          className=" w-70 h-10 rounded-md"
          onUnlock={approveSubmit}
        >
          <SlideToUnlockTrack className="">
            <SlideToUnlockText className=" ">
              {({ isDragging }) => (
                <ShimmeringText
                  text="slide to confirm"
                  isStopped={isDragging}
                />
              )}
            </SlideToUnlockText>
            <SlideToUnlockHandle className="h-8" />
          </SlideToUnlockTrack>
        </SlideToUnlock>
        <Button
          className={cn("font-semibold cursor-pointer")}
          variant={"secondary"}
          onClick={disapproveSubmit}
        >
          Stop
        </Button>
      </div>
    </div>
  );
}
