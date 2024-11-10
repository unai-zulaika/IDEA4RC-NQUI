import { CopyIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Loader2 } from "lucide-react";
import { Separator } from "@radix-ui/react-separator";

type FinishedDemoProps = {
  isEverythingChecked: boolean;
  onClick: () => void;
  onCloseClick: () => void;
  sqlText: string;
  isSQLText: boolean;
};

export function FinishedDemo({
  isEverythingChecked,
  onClick,
  onCloseClick,
  sqlText,
  isSQLText,
}: FinishedDemoProps) {
  const textToCopy = "https://forms.gle/5XZVWR2yCKvijePj9";
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          disabled={!isEverythingChecked}
          className={`w-min m-auto button ${
            isEverythingChecked ? "button-enabled" : "button-disabled"
          }`}
          onClick={() => {
            onClick();
          }}
        >
          <Brain className="mr-2 h-4 w-4" /> Send to AI
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {isSQLText ? (
          <DialogHeader>
            <DialogTitle>Fetching cohort from the database...</DialogTitle>
            <DialogDescription>
              {/* Would you please fill the next survey? Its just 2 minutes. */}
              Please be patient, this may take a few moments.
            </DialogDescription>
          </DialogHeader>
        ) : (
          <DialogHeader>
            <DialogTitle>Sending data to AI</DialogTitle>
            <DialogDescription>
              {/* Would you please fill the next survey? Its just 2 minutes. */}
              Please be patient, this may take a few moments.
            </DialogDescription>
          </DialogHeader>
        )}
        {isSQLText ? (
          <div>
            <div>The obtained SQL query is:</div>
            <Separator />
            <div>{sqlText}</div>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Button disabled>
              <Loader2 className="animate-spin" />
              Please wait
            </Button>
            {/* <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input id="link" defaultValue={textToCopy} readOnly />
          </div>
          <Button
            type="submit"
            size="sm"
            className="px-3"
            onClick={() => {
              navigator.clipboard.writeText(textToCopy);
            }}
          >
            <span className="sr-only">Copy</span>
            <CopyIcon className="h-4 w-4" />
          </Button>*/}
          </div>
        )}
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onCloseClick()}
            >
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
