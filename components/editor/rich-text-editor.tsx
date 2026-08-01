"use client";

import * as React from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Image as TiptapImage } from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extension-placeholder";
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function ToolbarButton({
  active,
  disabled,
  label,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        "inline-flex size-9 max-md:size-11 shrink-0 items-center justify-center rounded-lg transition-colors",
        "[&_svg]:size-4 disabled:opacity-40",
        active
          ? "bg-accent-soft text-accent"
          : "text-muted hover:bg-surface-2 hover:text-text"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span aria-hidden className="mx-0.5 h-5 w-px shrink-0 bg-border" />;
}

function LinkControl({ editor }: { editor: Editor }) {
  const [open, setOpen] = React.useState(false);
  const [url, setUrl] = React.useState("");

  // À l'ouverture, on préremplit avec le lien de la sélection courante.
  const [wasOpen, setWasOpen] = React.useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) setUrl(editor.getAttributes("link").href ?? "");
  }

  function apply() {
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url.trim() })
        .run();
    }
    setOpen(false);
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Insérer un lien"
            title="Insérer un lien"
            className={cn(
              "inline-flex size-9 max-md:size-11 shrink-0 items-center justify-center rounded-lg transition-colors [&_svg]:size-4",
              editor.isActive("link")
                ? "bg-accent-soft text-accent"
                : "text-muted hover:bg-surface-2 hover:text-text"
            )}
          >
            <Link2 />
          </button>
        </PopoverTrigger>
        <PopoverContent className="space-y-2">
          <p className="text-[13px] font-medium">Adresse du lien</p>
          <Input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                apply();
              }
            }}
            placeholder="https://exemple.com"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button size="sm" onClick={apply}>
              Appliquer
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <ToolbarButton
        label="Retirer le lien"
        disabled={!editor.isActive("link")}
        onClick={() => editor.chain().focus().unsetLink().run()}
      >
        <Link2Off />
      </ToolbarButton>
    </>
  );
}

function ImageControl({ editor }: { editor: Editor }) {
  const [open, setOpen] = React.useState(false);
  const [url, setUrl] = React.useState("");

  function apply() {
    if (!url.trim()) return;
    editor.chain().focus().setImage({ src: url.trim() }).run();
    setUrl("");
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Insérer une image"
          title="Insérer une image"
          className="inline-flex size-9 max-md:size-11 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-text [&_svg]:size-4"
        >
          <ImagePlus />
        </button>
      </PopoverTrigger>
      <PopoverContent className="space-y-2">
        <p className="text-[13px] font-medium">Image</p>
        <Input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              apply();
            }
          }}
          placeholder="/media/camci/photo.jpg"
          autoFocus
        />
        <p className="text-xs leading-relaxed text-muted">
          Collez l&apos;adresse d&apos;un média de la bibliothèque ou une URL
          externe.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button size="sm" onClick={apply}>
            Insérer
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function RichTextEditor({
  content,
  onChange,
  className,
}: {
  content: string;
  onChange: (html: string) => void;
  className?: string;
}) {
  const editor = useEditor({
    // Requis en App Router : le rendu immédiat casserait l'hydratation.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
        },
      }),
      TiptapImage.configure({ HTMLAttributes: { loading: "lazy" } }),
      Placeholder.configure({
        placeholder: "Rédigez votre article…",
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "tiptap",
        "aria-label": "Contenu de l'article",
      },
    },
    onUpdate: ({ editor: instance }) => onChange(instance.getHTML()),
  });

  if (!editor) {
    return (
      <div className={cn("rounded-xl border border-border bg-surface", className)}>
        <div className="h-12 border-b border-border" />
        <div className="min-h-[320px] p-4" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        // Pas d'`overflow-hidden` ici : cela ferait du conteneur le bloc de
        // référence du `sticky` de la barre d'outils, qui serait décalée.
        "rounded-xl border border-border bg-surface",
        className
      )}
    >
      {/* Barre d'outils : scroll horizontal maîtrisé sur mobile. */}
      <div className="sticky top-14 z-10 flex items-center gap-0.5 overflow-x-auto scrollbar-none rounded-t-xl border-b border-border bg-surface px-1.5 py-1">
        <ToolbarButton
          label="Annuler"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo2 />
        </ToolbarButton>
        <ToolbarButton
          label="Rétablir"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo2 />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          label="Gras"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold />
        </ToolbarButton>
        <ToolbarButton
          label="Italique"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic />
        </ToolbarButton>
        <ToolbarButton
          label="Souligné"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          label="Titre de niveau 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 />
        </ToolbarButton>
        <ToolbarButton
          label="Titre de niveau 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3 />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          label="Liste à puces"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List />
        </ToolbarButton>
        <ToolbarButton
          label="Liste numérotée"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered />
        </ToolbarButton>
        <ToolbarButton
          label="Citation"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote />
        </ToolbarButton>
        <ToolbarButton
          label="Bloc de code"
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code />
        </ToolbarButton>

        <Divider />

        <LinkControl editor={editor} />
        <ImageControl editor={editor} />
      </div>

      <EditorContent editor={editor} className="px-4 py-4 sm:px-5" />
    </div>
  );
}
