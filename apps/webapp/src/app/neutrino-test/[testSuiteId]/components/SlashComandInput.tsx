"use client";

import React from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import {
    BeautifulMentionNode,
    BeautifulMentionsPlugin,
    createBeautifulMentionNode,
    $convertToMentionNodes,
    PlaceholderNode,
    BeautifulMentionsMenuProps,
    BeautifulMentionsMenuItemProps,
    BeautifulMentionsItem,
} from "lexical-beautiful-mentions";
import { $createParagraphNode, $getRoot } from "lexical";
import SingleLinePlugin from "./SlashInputPlugins";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

function cn(...classes: Array<string | undefined | boolean | null>) {
    return classes.filter(Boolean).join(" ");
}

function CustomMentionComponent(props: { className?: string; value: string; trigger: string; data?: unknown }) {
    const { className, value, trigger } = props;
    return (
        <span className={className} style={{ background: "#FFDDAA" }}>
            {trigger}
            {value}
        </span>
    );
}

const [CustomBeautifulMentionNode, CustomReplacementNode] = createBeautifulMentionNode(CustomMentionComponent);

const Menu = ({ loading, ...other }: BeautifulMentionsMenuProps) => {
    if (loading) {
        return (
            <div className="bg-popover text-popover-foreground top-[2px] m-0 min-w-[8rem] overflow-hidden rounded-md border p-2.5 text-sm shadow-md">
                Loading...
            </div>
        );
    }
    return (
        <ul
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            className="bg-popover text-popover-foreground absolute top-full left-0 z-50 m-0 min-w-[8rem] overflow-hidden rounded-md border p-1 whitespace-nowrap shadow-md"
            {...other}
        />
    );
};

const MenuItem = React.forwardRef<HTMLLIElement, BeautifulMentionsMenuItemProps>((props, ref) => {
    const { key: reactKey, selected, item, itemValue, displayValue, ...rest } = props;
    let label: React.ReactNode = "";

    if (typeof item === "string") {
        label = item;
    } else if (item && typeof item === "object") {
        const data = item.data;
        label = (
            <>
                <strong>{data["config_key"]}</strong>: {data["config_value"]}
            </>
        );
    }

    return (
        <li
            ref={ref}
            key={reactKey}
            className={cn(
                "relative flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none hover:bg-gray-100 transition-colors",
                selected && "bg-accent text-accent-foreground"
            )}
            {...rest}
        >
            {label}
        </li>
    );
});
MenuItem.displayName = "MenuItem";

const mentionsStyle = "px-1 mx-2/3 mx-px align-baseline inline-block rounded break-words cursor-pointer leading-5";
const mentionsStyleFocused = "ring-2 ring-offset-1";

const theme = {
    beautifulMentions: {
        "/": `${mentionsStyle} dark:bg-gray-100 bg-gray-200 text-gray-600 dark:text-gray-200`,
        "/Focused": `${mentionsStyleFocused} dark:ring-gray-100 ring-gray-200 text-gray-600 ring-offset-background`,
    },
};

function getInitialEditorState(initialValue: string, triggers: string[]) {
    return () => {
        const root = $getRoot();
        if (root.getFirstChild() === null) {
            const mentionNodes = $convertToMentionNodes(initialValue, triggers);
            const paragraph = $createParagraphNode();
            paragraph.append(...mentionNodes);
            root.append(paragraph);
        }
    };
}

export interface SlashCommandInputProps {
    onChange?: (newText: string) => void;
    initialValue?: string;
    placeholder?: string;
    useCustomNode?: boolean;
    slashCommands?: Array<string | { key: string; value: string; createdAt?: string }>;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    clearTrigger?: any;
}

function ClearEditorPlugin({ clearTrigger }: { clearTrigger: any }) {
    const [editor] = useLexicalComposerContext();
    React.useEffect(() => {
        editor.update(() => {
            const root = $getRoot();
            root.clear();
            root.append($createParagraphNode());
        });
    }, [clearTrigger, editor]);
    return null;
}

export default function SlashCommandInput({
    onChange,
    initialValue = "",
    placeholder = "Type here...",
    useCustomNode = false,
    slashCommands = [],
    onKeyDown: parentOnKeyDown,
    clearTrigger,
}: SlashCommandInputProps) {
    const processedCommands = slashCommands.map((item) => {
        if (typeof item === "object" && "key" in item && typeof item.key === "string") {
            const typedItem = item as { key: string;[k: string]: any };
            const data: { value: string;[k: string]: any } = {
                value: `[config]${typedItem.key}`,
            };
            for (const itemKey in typedItem) {
                data[`config_${itemKey}`] = typedItem[itemKey];
            }
            return data;
        }
        return item;
    });

    const mentionItems: Record<string, BeautifulMentionsItem[]> = {};
    mentionItems["/"] = processedCommands;
    const mentionNodes = useCustomNode ? [CustomBeautifulMentionNode, CustomReplacementNode] : [BeautifulMentionNode];
    const editorConfig = {
        namespace: "SlashCommandExample",
        theme,
        onError(error: Error) {
            throw error;
        },
        nodes: [...mentionNodes, PlaceholderNode],
        editorState: getInitialEditorState(initialValue, Object.keys(mentionItems)),
    };

    const handleChange = (editorState: any, editor: any) => {
        editor.update(() => {
            const textContent = $getRoot().getTextContent();
            onChange?.(textContent);
        });
    };

    return (
        <LexicalComposer initialConfig={editorConfig}>
            <div className="border-none rounded-md w-full relative py-1 align-center">
                <RichTextPlugin
                    contentEditable={
                        <ContentEditable
                            className="block w-full rounded-md px-3 py-1 text-sm focus:outline-none"
                            onKeyDown={parentOnKeyDown}
                        />
                    }
                    placeholder={
                        <div className="pointer-events-none absolute px-3 top-[8px] inline-block select-none overflow-hidden text-ellipsis text-gray-400 text-sm">
                            {placeholder}
                        </div>
                    }
                    ErrorBoundary={LexicalErrorBoundary}
                />
                <OnChangePlugin onChange={handleChange} />
                <HistoryPlugin />
                <SingleLinePlugin />
                <BeautifulMentionsPlugin items={mentionItems} menuComponent={Menu} menuItemComponent={MenuItem} />
                {clearTrigger !== undefined && <ClearEditorPlugin clearTrigger={clearTrigger} />}
            </div>
        </LexicalComposer>
    );
}
