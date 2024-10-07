"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileType2, Loader2 } from "lucide-react";
import { TermDataDialog } from "@/components/ui/TermDataDialog";
import { Separator } from "./separator";
import { FinishedDemo } from "./FinishedDemo";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  const [richInputText, setRichInputText] = useState<React.ReactNode>();
  const [userInputText, setUserInputText] = useState<string>("");
  const [matchTerms, setMatchTerms] = useState<any>({}); // Object where keys are terms, values are lists
  const [isInputSent, setIsInputSent] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [checkedStates, setCheckedStates] = useState<Record<string, boolean>>({}); // Track checked state per term
  const [isEverythingChecked, setIsEverythingChecked] = useState<boolean>(false);
  const [_, setShowAlert] = useState<boolean>(false);
  const [trigger, setTrigger] = useState<boolean>(false); // Trigger state to force updates

  useEffect(() => {
    if (trigger) {
      if (Object.keys(matchTerms).length > 0) {
        const newInputText = replaceWithButton(userInputText, matchTerms);
        setRichInputText(newInputText);
        // Initialize the checked states for each term in matchTerms
        const initialCheckedStates = Object.keys(matchTerms).reduce((acc, key) => {
          acc[key] = false;
          return acc;
        }, {} as Record<string, boolean>);
        setCheckedStates(initialCheckedStates);
      } else {
        setRichInputText(userInputText);
      }
      setIsLoading(false);
      setIsInputSent(true);
    }

  }, [matchTerms]);

  useEffect(() => {
    // Check if all terms in the checkedStates object are true
    const allChecked = Object.values(checkedStates).every((state) => state === true);
    setIsEverythingChecked(allChecked);
  }, [checkedStates]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setUserInputText(value);
  };

  const handleTermValidation = (term: string, isChecked: boolean) => {
    setCheckedStates((prev) => ({
      ...prev,
      [term]: isChecked,
    }));
  };

  // Function to replace dictionary keys in the long string with buttons
  function replaceWithButton(text: string, matchedTerms: any): React.ReactNode {
    const elements: React.ReactNode[] = [];
    const words = text.replace(/[^a-zA-Z0-9\s\-]/g, '').split(/(\s+)/); // Split the text into words including spaces

    words.forEach((word, index) => {
      if (matchedTerms.hasOwnProperty(word.trim()) && word.trim() !== "") {
        // Create a TermDataDialog for each matched term
        const button = (
          <TermDataDialog
            key={index}
            term_text={word}
            data={matchedTerms[word.trim()]} // Pass the list of data for the term
            onCheck={(isChecked: boolean) => handleTermValidation(word.trim(), isChecked)} // Update checked state for the term
          />
        );
        elements.push(button);
      } else {
        elements.push(<span key={index}>{word}</span>);
      }
    });

    return <p>{elements}</p>;
  }

  const onProcessTextClicked = async () => {
    setIsLoading(true);
    setTrigger(true);
    console.log(userInputText.replace(/[^a-zA-Z0-9\s\-]/g, ''));
    try {
      const response = await fetch("/api/py/match_terms", { // Use Next.js API route
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text_to_match: userInputText.replace(/[^a-zA-Z0-9\s\-]/g, ''), threshold: 50 }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const matchedJson = await response.json();
      if (matchedJson === matchTerms) {
        console.log("SASASA");
        setTrigger(!trigger);
      }
      setMatchTerms(matchedJson); // Set matchTerms as an object of terms to lists
      console.log("Response from /api/match_terms:", matchedJson);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  return (
    <div className="grid w-1/2 items-center gap-4 pb-20">
      {isInputSent ? (
        <div>
          <p className="text-sm text-muted-foreground text-center mb-8">Validate the identified data:</p>
          <div>{richInputText}</div>
          <div className="mt-4">
            {isEverythingChecked ? (
              <p className="text-green-600 text-center">All terms have been validated!</p>
            ) : (
              <p className="text-red-600 text-center">Not all terms have been validated yet.</p>
            )}
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm text-muted-foreground text-center mb-8">Write your cohort:</p>
          <textarea
            className={cn(
              "flex min-h-[60px] h-32 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
            ref={ref}
            onInput={handleChange}
            value={userInputText}
            {...props}
          />
        </div>
      )}
      <Separator />
      {isLoading ? (
        <Button disabled className="w-min m-auto">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Please wait
        </Button>
      ) : isInputSent ? (
        <div className="grid grid-flow-col auto-cols-max gap-x-8 justify-self-center">
          <Button
            variant="destructive"
            className="w-min m-auto"
            onClick={() => {
              setIsInputSent(false);
            }}
          >
            Cancel
          </Button>
          <FinishedDemo isEverythingChecked={isEverythingChecked} onClick={() => { setShowAlert(true); }} />
        </div>
      ) : (
        <Button onClick={onProcessTextClicked} className="w-min m-auto">
          <FileType2 className="mr-2 h-4 w-4" /> Process text
        </Button>
      )}
    </div>
  );
});

Textarea.displayName = "Textarea";

export { Textarea };
