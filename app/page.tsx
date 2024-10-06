import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center">
        <Image
          className="dark:invert"
          src="https://www.idea4rc.eu/wp-content/uploads/2023/03/LogoIDEA4RC-300x200.jpg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <Textarea placeholder="Write in words your cohort criteria. For instance: Retrieve all patient id for those patient diagnosed with a angiomyxoma or carcinoma" />
        {/* <InputWithButton /> */}

        <div>
          <div className="space-y-2">
            <h4 className="text-xl font-medium leading-none">Examples</h4>
            <Separator className="my-4" />
            <p className="text-sm text-muted-foreground">
              Retrieve all patient id for those patient diagnosed with a
              angiomyxoma or carcinoma
            </p>
            <Separator className="my-4" />
            <p className="text-sm text-muted-foreground">
              Retrieve all patient id for those patient diagnosed with a
              angiomyxoma or carcinoma
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
