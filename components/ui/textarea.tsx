"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileType2, Loader2, Copy } from "lucide-react";
import { TermDataDialog } from "@/components/ui/TermDataDialog";
import { Separator } from "./separator";
import { FinishedDemo } from "./FinishedDemo";
import { Term } from "./TermData";
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

    const [sqlText, setSqlText] = useState<string>("");
    const [isSQLAnswered, setIsSQLAnswered] = useState<boolean>(false);
    const [dbOutput, setDbOutput] = useState<string[]>([]);
    const [showPatientDialog, setShowPatientDialog] = useState<boolean>(false);
    const [patientIDs, setPatientIDs] = useState<string[]>([]);

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
    function filterMatchedTerms(matchedTerms: any, original_text: string): any {
      const termEntries = Object.entries(matchedTerms);
      const termsToKeep: any = {};
      const wordsC = original_text
        .toLowerCase()
        .split(" ")
        .map((w) => w.trim());

      // Compare each term with every other term
      for (let i = 0; i < termEntries.length; i++) {
        const [termA, dataA] = termEntries[i];
        const wordsA = new Set(termA.split(" ").map((w) => w.trim()));

        let shouldKeepA = true;
        let shouldKeepByUnique = false;

        for (let j = 0; j < termEntries.length; j++) {
          if (i === j) continue; // Skip comparing the same term

          const [termB, dataB] = termEntries[j];
          const wordsB = new Set(termB.split(" ").map((w) => w.trim()));

          const hasUniqueInAandInC = [...wordsA].some(
            (word) => !wordsB.has(word) && wordsC.includes(word)
          );

          // Check if both terms share words
          const commonWords = [...wordsA].filter((word) => wordsB.has(word));

          // If they share words and termA has fewer words than termB, skip termA
          if (
            commonWords.length > 0 &&
            wordsA.size < wordsB.size &&
            !hasUniqueInAandInC
          ) {
            shouldKeepA = false;

            for (const term of dataA as Term[]) {
              term.validated = false; // Mark term as not validated
            }
            (dataB as Term[]).push(...(dataA as Term[])); // Merge data from termA into termB
            break; // No need to check further if termA is already disqualified
          }
        }

        // If termA is not disqualified, keep it
        if (shouldKeepA) {
          for (const term of dataA as Term[]) {
            if (term.validated === undefined) term.validated = true;
          }
          termsToKeep[termA] = dataA;
        }
        // if (shouldKeepByUnique) {
        //   termsToKeep[termA] = [...dataA];
        // }
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

    // Function to find the shortest slice that includes all words in the sortedTerm
    function findMinimalCommonSlice(
      words: string[],
      startIndex: number,
      matchWordsSet: Set<string>
    ): { slice: string[]; endIndex: number; startIndex: number } | null {
      let shortestSlice: string[] | null = null;
      let shortestEndIndex = -1;
      let shortestStartIndex = -1;

      for (let i = startIndex; i < words.length; i++) {
        const matchedWords = new Set<string>();
        let slice: string[] = [];
        let endIndex = i;

        for (let j = i; j < words.length; j++) {
          const word = words[j].trim();
          if (word !== "" && matchWordsSet.has(word)) {
            matchedWords.add(word);
          }

          slice.push(words[j]);

          // If all words from matchWordsSet are found, check if this is the shortest slice
          if (matchedWords.size === matchWordsSet.size) {
            if (shortestSlice === null || slice.length < shortestSlice.length) {
              shortestSlice = [...slice]; // Copy the slice
              shortestEndIndex = j;
              shortestStartIndex = i;
            }
            break; // Continue to find shorter matches starting at different points
          }
        }
      }

      if (shortestSlice) {
        return {
          slice: shortestSlice,
          endIndex: shortestEndIndex,
          startIndex: shortestStartIndex,
        };
      }

      return null; // No valid match found
    }

    function replaceWithButton(
      text: string,
      matchedTerms: any
    ): React.ReactNode {
      const filteredMatchedTerms = filterMatchedTerms(
        matchedTerms,
        userInputText.replace(/[^a-zA-Z0-9\s\-]/g, "")
      );
      // const filteredMatchedTerms = matchedTerms
      const sortedTerms = Object.entries(filteredMatchedTerms);

      const elements: React.ReactNode[] = [];
      let updatedElements: React.ReactNode[] = [];
      const words = text.toLowerCase().split(/(\s+)/); // Split text including spaces, preserving them
      const unmatchedTerms: Set<string> = new Set(
        sortedTerms.map(([term]) => term)
      );
      const usedIndices = new Set<number>(); // Track indices already processed

      let i = 0;
      while (i < words.length) {
        if (words[i].trim() === "") {
          elements.push(<span key={i}>{words[i]}</span>);
          i += 1;
          continue;
        }

        let matchFound = false;

        for (const [matchKey, data] of sortedTerms) {
          const matchWordsSet = new Set(
            matchKey.split(" ").map((w) => w.trim())
          );

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

          if (subsetWordsMatch(sliceToMatch, matchWordsSet)) {
            const matchedText = words.slice(i, tempIndex).join("");
            // we need to add validated to each term
            elements.push(
              <TermDataDialog
                key={i}
                term_text={matchedText}
                data={data as Term[]}
                onCheck={(isChecked: boolean) =>
                  handleTermValidation(matchKey, isChecked)
                }
              />
            );

            unmatchedTerms.delete(matchKey);
            for (let j = i; j < tempIndex; j++) {
              usedIndices.add(j); // Mark indices as used
            }
            i = tempIndex;
            matchFound = true;
            break;
          }
        }

        if (!matchFound) {
          elements.push(<span key={i}>{words[i]}</span>);
          usedIndices.add(i); // Mark index as used for non-matches too
          i += 1;
        }
      }
      updatedElements = elements;
      // SECOND PASS: Minimal common match for remaining unmatched terms
      for (const [matchKey, data] of sortedTerms) {
        if (unmatchedTerms.has(matchKey)) {
          const matchWordsSet = new Set(
            matchKey.split(" ").map((w) => w.trim())
          );

          for (let i = 0; i < words.length; i++) {
            if (usedIndices.has(i)) continue; // Skip indices already used

            const minimalMatch = findMinimalCommonSlice(
              words,
              i,
              matchWordsSet
            );

            if (minimalMatch) {
              const matchedText = minimalMatch.slice.join("");
              // we need to add validated to each term

              // Create the new element
              const newElement = (
                <TermDataDialog
                  key={minimalMatch.startIndex} // Use startIndex as the key for uniqueness
                  term_text={matchedText}
                  data={data as Term[]}
                  onCheck={(isChecked: boolean) =>
                    handleTermValidation(matchKey, isChecked)
                  }
                />
              );
              // Slice the elements array to keep items before startIndex
              const beforeSlice = elements.slice(0, minimalMatch.startIndex);

              // Slice the elements array to keep items after endIndex
              const afterSlice = elements.slice(minimalMatch.endIndex + 1);
              // Concatenate everything to build the final array
              updatedElements = [...beforeSlice, newElement, ...afterSlice];

              for (let j = i; j <= minimalMatch.endIndex; j++) {
                usedIndices.add(j); // Mark indices as used for the matched slice
              }

              i = minimalMatch.endIndex + 1;
              break;
            }
          }
        }
      }
      return <div>{updatedElements}</div>;
    }

    async function fetchQueryToSql(
      query: string,
      api_key: string
    ): Promise<any> {
      const url = new URL(
        "https://valhalla.deusto.es/idea4rc/api/query_to_sql"
      );
      url.searchParams.append("query", query);
      url.searchParams.append("api_key", api_key);

      try {
        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        return data;
      } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
      }
    }

    const onProcessTextClicked = async () => {
      setIsLoading(true);
      setTrigger(true);
      const original_text = userInputText.replace(/[^a-zA-Z0-9\s\-]/g, "");
      try {
        const response = await fetch("/api/py/match_terms", {
          // Use Next.js API route
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text_to_match: original_text,
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
        setMatchTerms(filterMatchedTerms(matchedJson, original_text)); // Set matchTerms as an object of terms to lists

        console.log("Response from /api/match_terms:", matchedJson);
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
      }
    };

    async function queryDB(query: string, api_key: string): Promise<any> {
      const url = new URL(
        "https://valhalla.deusto.es/idea4rc/api/perform_query"
      );
      url.searchParams.append("query", query);
      url.searchParams.append("api_key", api_key);

      try {
        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        return data;
      } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
      }
    }

    function emulateApiRequest(
      query: string,
      api_key: string
    ): Promise<{ data: string }> {
      return new Promise((resolve) => {
        console.log(
          `Emulating API request with query: "${query}" and api_key: "${api_key}"`
        );

        setTimeout(() => {
          const randomString = Math.random().toString(36).substring(2, 15);
          resolve({ data: randomString });
        }, 2000); // 2-second delay
      });
    }

    const handleCopy = () => {
      const textToCopy = patientIDs.join(", ");
      navigator.clipboard.writeText(textToCopy).then(() => {
        alert("Patient IDs copied to clipboard");
      });
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
              isSQLText={isSQLAnswered}
              sqlText={sqlText}
              onCloseClick={() => {
                setIsSQLAnswered(false);
                setSqlText("");
              }}
              onClick={() => {
                let sqlText: string = "";
                if (
                  React.isValidElement(richInputText) &&
                  richInputText.props &&
                  richInputText.props.children
                ) {
                  for (const word_data of richInputText.props.children.values()) {
                    if ("children" in word_data.props) {
                      sqlText += word_data.props.children;
                    }
                    if ("data" in word_data.props) {
                      sqlText += word_data.props.data[0].variable_name + "=";
                      for (const term_data of word_data.props.data.values()) {
                        if (term_data.validated)
                          sqlText += term_data.code + ",";
                      }
                      sqlText = sqlText.slice(0, -1); // remove last comma
                    }
                  }
                }
                console.log(sqlText);

                // now let's ask for data
                fetchQueryToSql(sqlText, process.env.NEXT_PUBLIC_API_KEY || "")
                  .then((response) => {
                    console.log("Response:", response);
                    setSqlText(response);
                    setIsSQLAnswered(true);

                    queryDB(response, process.env.NEXT_PUBLIC_API_KEY || "")
                      .then((db_response) => {
                        console.log("DB result:", db_response);
                        let patient_ids = [];
                        if (db_response.result !== undefined) {
                          for (const row of db_response.result) {
                            patient_ids.push(row[0]); // 0 is the patient id
                          }
                        }
                        setPatientIDs(patient_ids);
                        setShowPatientDialog(true);
                      })
                      .catch((error) => console.error("Error:", error));
                  })
                  .catch((error) => console.error("Error:", error));
              }}
            />
          </div>
        ) : (
          <Button onClick={onProcessTextClicked} className="w-min m-auto">
            <FileType2 className="mr-2 h-4 w-4" /> Process text
          </Button>
        )}

        <AlertDialog
          open={showPatientDialog}
          onOpenChange={setShowPatientDialog}
        >
          <AlertDialogTrigger asChild>
            <Button className="hidden">Show Patient IDs</Button>
          </AlertDialogTrigger>
          <AlertDialogContent style={{ maxHeight: "80vh", overflowY: "auto" }}>
            <AlertDialogHeader>
              <AlertDialogTitle>Patient IDs</AlertDialogTitle>
              <AlertDialogDescription>
                {patientIDs.length > 0 ? (
                  <div>
                    <ul>
                      {patientIDs.map((id, index) => (
                        <li key={index}>{id}</li>
                      ))}
                    </ul>
                    <Button onClick={handleCopy} className="mt-4">
                      <Copy className="mr-2 h-4 w-4" /> Copy Patient IDs
                    </Button>
                  </div>
                ) : (
                  <p>No patient IDs found.</p>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
