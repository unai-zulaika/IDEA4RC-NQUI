"use client";

import React, { useRef } from "react";

import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Brain, FileType2, Loader2 } from "lucide-react";
import { match } from "assert";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    const [ws, setWs] = React.useState<WebSocket | null>(null);
    const [richInputText, setRichInputText] = React.useState<React.ReactNode>();
    const [userInputText, setUserInputText] = React.useState<string>("");
    const [matchTerms, setMatchTerms] = React.useState<JSON>();
    const [isMessageReady, setIsMessageReady] = React.useState<boolean>(false);
    const [isInputSent, setIsInputSent] = React.useState<boolean>(false);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    // React.useEffect(() => {
    //   const socket = new WebSocket("ws://127.0.0.1:8000/ws");

    //   socket.onopen = () => {
    //     console.log("WebSocket connection established");
    //   };

    //   socket.onclose = () => {
    //     console.log("WebSocket connection closed");
    //   };

    //   socket.onerror = (error) => {
    //     console.error("WebSocket error:", error);
    //   };

    //   socket.onmessage = (event) => {
    //     try {
    //       const jsonObject = JSON.parse(event.data);
    //       setMatchTerms(jsonObject);
    //       console.log("WebSocket message received:", jsonObject);
    //     } catch (error) {
    //       console.error("Error parsing JSON:", error);
    //     }
    //   };

    //   setWs(socket);

    //   return () => {
    //     socket.close();
    //   };
    // }, []);

    React.useEffect(() => {
      if (matchTerms) {
        setIsLoading(false);
        setIsInputSent(true);
        const newInputText = replaceWithButton(userInputText, matchTerms);
        setRichInputText(newInputText);
      }
    }, [matchTerms]);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = event.target.value;
      setUserInputText(value);

      // if (props.onChange) {
      //   props.onChange(event);
      // }

      // if (ws && ws.readyState === WebSocket.OPEN) {
      //   ws.send(value);
      // }
    };

    // TODO: update
    // Function to replace dictionary keys in the long string with HTML buttons

    function replaceWithButton(
      text: string,
      matched_terms: any
    ): React.ReactNode {
      const elements: React.ReactNode[] = [];
      const words = text.split(/(\s+)/); // Split the text into words including spaces

      words.forEach((word, index) => {
        // Check if the word matches any of the keys in matched_terms
        if (matched_terms.hasOwnProperty(word.trim()) && word.trim() !== "") {
          //console.log(matched_terms[word][0].variable_name);
          // Create a button for each key
          const button = (
            <Popover key={index}>
              <PopoverTrigger asChild>
                <Button variant="outline">{word}</Button>
              </PopoverTrigger>

              <PopoverContent className="w-80">
                {matched_terms[word][0].variable_name}
              </PopoverContent>
            </Popover>
          );
          elements.push(button);
        } else {
          // If the word doesn't match, just add the text
          elements.push(<span key={index}>{word}</span>);
        }
      });

      return <p>{elements}</p>; // Wrap the entire array of elements in a paragraph
    }

    const onProcessTextClicked = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("http://127.0.0.1:8000/api/match_terms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text_to_match: userInputText }),
          //params: { text_to_match: userInputText },
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const matchedJson = await response.json();
        setMatchTerms(matchedJson);
        console.log("Response from /api/match_terms:", matchedJson);
        // Handle the response data as needed
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
      }
    };

    return (
      <div className="grid w-1/2 items-center gap-4  pb-20">
        {isInputSent ? (
          <div>{richInputText}</div>
        ) : (
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
        )}

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
            <Button disabled className="w-min m-auto">
              <Brain className="mr-2 h-4 w-4" /> Send to AI
            </Button>
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
