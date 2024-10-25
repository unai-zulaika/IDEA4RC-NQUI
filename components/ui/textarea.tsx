"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileType2, Loader2 } from "lucide-react";
import { TermDataDialog } from "@/components/ui/TermDataDialog";
import { Separator } from "./separator";
import { FinishedDemo } from "./FinishedDemo";
import { Term } from "./TermData";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    const [richInputText, setRichInputText] = useState<React.ReactNode>();
    const [userInputText, setUserInputText] = useState<string>("");
    const [matchTerms, setMatchTerms] = useState<any>({}); // Object where keys are terms, values are lists
    const [isInputSent, setIsInputSent] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [checkedStates, setCheckedStates] = useState<Record<string, boolean>>(
      {}
    ); // Track checked state per term
    const [isEverythingChecked, setIsEverythingChecked] =
      useState<boolean>(false);
    const [_, setShowAlert] = useState<boolean>(false);
    const [trigger, setTrigger] = useState<boolean>(false); // Trigger state to force updates

    useEffect(() => {
      if (trigger) {
        if (Object.keys(matchTerms).length > 0) {
          const newInputText = replaceWithButton(userInputText, matchTerms);
          setRichInputText(newInputText);
          // Initialize the checked states for each term in matchTerms
          const initialCheckedStates = Object.keys(matchTerms).reduce(
            (acc, key) => {
              acc[key] = false;
              return acc;
            },
            {} as Record<string, boolean>
          );
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
      const allChecked = Object.values(checkedStates).every(
        (state) => state === true
      );
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

    // Utility function to preprocess matchedTerms and remove shorter terms if they share common words
    function filterMatchedTerms(matchedTerms: { [key: string]: Term[] }): {
      [key: string]: Term[];
    } {
      const termEntries = Object.entries(matchedTerms);
      const termsToKeep: any = {};

      // Compare each term with every other term
      for (let i = 0; i < termEntries.length; i++) {
        const [termA, dataA] = termEntries[i];
        const wordsA = new Set(termA.split(" ").map((w) => w.trim()));

        let shouldKeepA = true;

        for (let j = 0; j < termEntries.length; j++) {
          if (i === j) continue; // Skip comparing the same term

          const [termB] = termEntries[j];
          const wordsB = new Set(termB.split(" ").map((w) => w.trim()));

          // Check if both terms share words
          const commonWords = [...wordsA].filter((word) => wordsB.has(word));

          // If they share words and termA has fewer words than termB, skip termA
          if (commonWords.length > 0 && wordsA.size < wordsB.size) {
            shouldKeepA = false;
            break; // No need to check further if termA is already disqualified
          }
        }

        // If termA is not disqualified, keep it
        if (shouldKeepA) {
          termsToKeep[termA] = dataA;
        }
      }

      return termsToKeep;
    }

    // Helper function to check if all words in the matchedTerms are present in the text slice (ignoring order and whitespace)
    function subsetWordsMatch(
      sliceToMatch: string[],
      matchWordsSet: Set<string>
    ): boolean {
      const wordsInSlice = new Set(
        sliceToMatch.map((word) => word.trim()).filter((word) => word !== "")
      );

      // Check if all words in the slice are in the matchWordsSet
      for (const word of wordsInSlice) {
        if (!matchWordsSet.has(word)) {
          return false; // If any word in the slice is not in matchWordsSet, it's not a match
        }
      }

      return true; // All words in sliceToMatch are in matchWordsSet (subset match)
    }

    // Function to replace dictionary keys in the long string with buttons
    function replaceWithButton(
      text: string,
      matchedTerms: { [key: string]: Term[] }
    ): React.ReactNode {
      // Preprocess the matchedTerms to remove shorter overlapping terms
      const filteredMatchedTerms = filterMatchedTerms(matchedTerms);

      // Sort the matchedTerms based on the number of words in descending order (to prioritize multi-word matches)
      const sortedTerms = Object.entries(filteredMatchedTerms);

      const elements: React.ReactNode[] = [];
      const words = text.split(/(\s+)/); // Split text including spaces, preserving them
      const unmatchedTerms: Set<string> = new Set(
        sortedTerms.map(([term]) => term)
      ); // Track unmatched terms

      let i = 0;
      while (i < words.length) {
        // Skip whitespaces in the text when matching
        if (words[i].trim() === "") {
          elements.push(<span key={i}>{words[i]}</span>);
          i += 1; // Move to the next word (this is just whitespace)
          continue;
        }

        let matchFound = false;

        // Try matching each term from the sorted dictionary (ignoring order and length)
        for (const [matchKey, data] of sortedTerms) {
          const matchWordsSet = new Set(
            matchKey.split(" ").map((w) => w.trim())
          );

          // Collect a slice of words to compare, ignoring whitespaces
          let sliceToMatch: string[] = [];
          let tempIndex = i;
          while (
            tempIndex < words.length &&
            sliceToMatch.length < matchWordsSet.size
          ) {
            if (words[tempIndex].trim() !== "") {
              sliceToMatch.push(words[tempIndex].trim());
            }
            tempIndex++;
          }

          // Check if the slice of words matches a subset of the matched term (ignoring order)
          if (subsetWordsMatch(sliceToMatch, matchWordsSet)) {
            // We've found a match
            const matchedText = words.slice(i, tempIndex).join(""); // Join without trimming to preserve spaces

            // Create the button element for the matched phrase
            elements.push(
              <TermDataDialog
                key={i}
                term_text={matchedText}
                data={data as Term[]} // Cast the data to Term[]
                onCheck={(isChecked: boolean) =>
                  handleTermValidation(matchKey, isChecked)
                }
              />
            );

            // Mark this term as matched and remove it from the unmatchedTerms set
            unmatchedTerms.delete(matchKey);

            // Move the index forward by the number of matched words (including spaces)
            i = tempIndex;
            matchFound = true;
            break;
          }
        }

        // If no match was found, just push the current word as plain text
        if (!matchFound) {
          elements.push(<span key={i}>{words[i]}</span>);
          i += 1; // Move to the next word
        }
      }

      // Return the updated text with buttons and plain text
      return <p>{elements}</p>;
    }

    const onProcessTextClicked = async () => {
      setIsLoading(true);
      setTrigger(true);
      console.log(userInputText.replace(/[^a-zA-Z0-9\s\-]/g, ""));
      try {
        const response = await fetch("/api/py/match_terms", {
          // Use Next.js API route
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text_to_match: userInputText.replace(/[^a-zA-Z0-9\s\-]/g, ""),
            threshold: 42,
          }),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const matchedJson = await response.json();
        if (matchedJson === matchTerms) {
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
            <p className="text-sm text-muted-foreground text-center mb-8">
              Validate the identified data:
            </p>
            <div>{richInputText}</div>
            <div className="mt-4">
              {isEverythingChecked ? (
                <p className="text-green-600 text-center">
                  All terms have been validated!
                </p>
              ) : (
                <p className="text-red-600 text-center">
                  Not all terms have been validated yet.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground text-center mb-8">
              Write your cohort:
            </p>
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
            <FinishedDemo
              isEverythingChecked={isEverythingChecked}
              onClick={() => {
                setShowAlert(true);
              }}
            />
          </div>
        ) : (
          <Button onClick={onProcessTextClicked} className="w-min m-auto">
            <FileType2 className="mr-2 h-4 w-4" /> Process text
          </Button>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
