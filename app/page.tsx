import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

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

        <div className="flex gap-4 flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="https://nextjs.org/icons/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Send
          </a>
        </div>
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
            <Separator className="my-4" />
          </div>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to idea4rc.eu →
        </a>
      </footer>
    </div>
  );
}
