"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckIcon, CopyIcon, PencilIcon, XIcon } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  type HTMLAttributes,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { type BundledLanguage, codeToHtml, type ShikiTransformer } from "shiki";

type CodeBlockProps = HTMLAttributes<HTMLDivElement> & {
  code: string;
  language: BundledLanguage;
  showLineNumbers?: boolean;
  onEdit?: (newCode: string) => void;
};

type CodeBlockContextType = {
  code: string;
};

const CodeBlockContext = createContext<CodeBlockContextType>({
  code: "",
});

const lineNumberTransformer: ShikiTransformer = {
  name: "line-numbers",
  line(node, line) {
    node.children.unshift({
      type: "element",
      tagName: "span",
      properties: {
        className: [
          "inline-block",
          "min-w-10",
          "mr-4",
          "text-right",
          "select-none",
          "text-muted-foreground",
        ],
      },
      children: [{ type: "text", value: String(line) }],
    });
  },
};

export async function highlightCode(
  code: string,
  language: BundledLanguage,
  showLineNumbers = false
) {
  const transformers: ShikiTransformer[] = showLineNumbers
    ? [lineNumberTransformer]
    : [];

  return await Promise.all([
    codeToHtml(code, {
      lang: language,
      theme: "one-light",
      transformers,
    }),
    codeToHtml(code, {
      lang: language,
      theme: "one-dark-pro",
      transformers,
    }),
  ]);
}

export const CodeBlock = ({
  code,
  language,
  showLineNumbers = false,
  className,
  children,
  onEdit,
  ...props
}: CodeBlockProps) => {
  const [html, setHtml] = useState<string>("");
  const [darkHtml, setDarkHtml] = useState<string>("");
  const mounted = useRef(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editableCode, setEditableCode] = useState(code);

  useEffect(() => {
    setEditableCode(code);
  }, [code]);

  useEffect(() => {
    if (isEditing) return;

    highlightCode(code, language, showLineNumbers).then(([light, dark]) => {
      if (!mounted.current) {
        setHtml(light);
        setDarkHtml(dark);
        mounted.current = true;
      }
    });

    return () => {
      mounted.current = false;
    };
  }, [code, language, showLineNumbers, isEditing]);

  const handleSave = () => {
    if (onEdit) {
      onEdit(editableCode);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditableCode(code);
    setIsEditing(false);
  };

  return (
    <CodeBlockContext.Provider value={{ code }}>
      <div
        className={cn(
          // REMOVED: overflow-hidden (it can sometimes hide dropdowns/popovers if you add them later)
          // ADDED: h-fit to ensure container grows
          "group relative w-full rounded-md border bg-background text-foreground h-fit",
          className
        )}
        {...props}
      >
        <div className="relative">
          {isEditing ? (
            <textarea
              value={editableCode}
              onChange={(e) => setEditableCode(e.target.value)}
              spellCheck={false}
              className="w-full min-h-[100px] p-4 font-mono text-sm bg-background text-foreground resize-y focus:outline-none whitespace-pre-wrap"
              style={{ lineHeight: "1.5" }}
            />
          ) : (
            <>
              {/* FIX APPLIED HERE:
                 1. [&>pre]:whitespace-pre-wrap  -> Forces text to wrap to the next line
                 2. [&>pre]:break-all            -> Forces long strings (like UUIDs/Hashes) to break mid-word
                 3. [&>pre]:overflow-x-hidden    -> Prevents horizontal scrollbar from appearing
              */}
              <div
                className="[&>pre]:m-0 [&>pre]:bg-background! [&>pre]:p-4 [&>pre]:text-foreground! [&>pre]:text-sm [&>pre]:whitespace-pre-wrap [&>pre]:break-all [&>pre]:overflow-x-hidden [&_code]:font-mono [&_code]:text-sm"
                dangerouslySetInnerHTML={{ __html: html }}
              />
              <div
                className="hidden dark:block [&>pre]:m-0 [&>pre]:bg-background! [&>pre]:p-4 [&>pre]:text-foreground! [&>pre]:text-sm [&>pre]:whitespace-pre-wrap [&>pre]:break-all [&>pre]:overflow-x-hidden [&_code]:font-mono [&_code]:text-sm"
                dangerouslySetInnerHTML={{ __html: darkHtml }}
              />
            </>
          )}

          <div className="absolute top-2 right-2 flex items-center gap-2 bg-background/50 backdrop-blur-sm p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
            {isEditing ? (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-green-500 hover:text-green-600 hover:bg-green-100"
                  onClick={handleSave}
                >
                  <CheckIcon size={14} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-100"
                  onClick={handleCancel}
                >
                  <XIcon size={14} />
                </Button>
              </>
            ) : (
              <>
                {children}
                {onEdit && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="shrink-0 h-6 w-6"
                    onClick={() => setIsEditing(true)}
                  >
                    <PencilIcon size={14} />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </CodeBlockContext.Provider>
  );
};

export type CodeBlockCopyButtonProps = ComponentProps<typeof Button> & {
  onCopy?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
};

export const CodeBlockCopyButton = ({
  onCopy,
  onError,
  timeout = 2000,
  children,
  className,
  ...props
}: CodeBlockCopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const { code } = useContext(CodeBlockContext);

  const copyToClipboard = async () => {
    if (typeof window === "undefined" || !navigator?.clipboard?.writeText) {
      onError?.(new Error("Clipboard API not available"));
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      onCopy?.();
      setTimeout(() => setIsCopied(false), timeout);
    } catch (error) {
      onError?.(error as Error);
    }
  };

  const Icon = isCopied ? CheckIcon : CopyIcon;

  return (
    <Button
      className={cn("shrink-0 h-6 w-6", className)}
      onClick={copyToClipboard}
      size="icon"
      variant="ghost"
      {...props}
    >
      {children ?? <Icon size={14} />}
    </Button>
  );
};