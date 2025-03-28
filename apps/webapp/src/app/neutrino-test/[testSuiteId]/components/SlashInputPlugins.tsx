import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    COMMAND_PRIORITY_HIGH,
    INSERT_LINE_BREAK_COMMAND,
    INSERT_PARAGRAPH_COMMAND,
} from "lexical";

export default function SingleLinePlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        const removeLineBreak = editor.registerCommand(
            INSERT_LINE_BREAK_COMMAND,
            () => {
                return true;
            },
            COMMAND_PRIORITY_HIGH
        );

        const removeParagraph = editor.registerCommand(
            INSERT_PARAGRAPH_COMMAND,
            () => {
                return true;
            },
            COMMAND_PRIORITY_HIGH
        );

        return () => {
            removeLineBreak();
            removeParagraph();
        };
    }, [editor]);

    return null;
}
