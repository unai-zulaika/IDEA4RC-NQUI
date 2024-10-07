import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog";
  import { ExclamationTriangleIcon, CheckCircledIcon } from "@radix-ui/react-icons";
  import { Button } from "@/components/ui/button";
  import React from "react";
  import { Term, TermData } from "@/components/ui/TermData";
  
  // Modify the props type to accept term_text and a Term object as data
  type TermDataDialogProps = {
    term_text: string;
    data: Term[];
    onCheck: (isChecked: boolean) => void; // callback to notify parent when checked state changes
  };
  
  export function TermDataDialog({ term_text, data, onCheck }: TermDataDialogProps) {
    const [isChecked, setIsChecked] = React.useState<boolean>(false);
  
    const handleValidation = () => {
      setIsChecked(true);
      onCheck(true); // Notify the parent when checked
    };
  
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline">
            {term_text}
            {isChecked ? (
              <CheckCircledIcon className="ml-2 h-4 w-4 text-green-500" />
            ) : (
              <ExclamationTriangleIcon className="ml-2 h-4 w-4 text-red-500" />
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Data description</AlertDialogTitle>
            <AlertDialogDescription>
              <TermData data={data} />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleValidation}
            >
              Validate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }
  