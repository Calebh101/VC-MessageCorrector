/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import { Logger } from "@utils/Logger";
import definePlugin, { OptionType } from "@utils/types";

const enabled: boolean = true;
const debug: boolean = false;
const logger = new Logger("MessageCorrector");

const settings = definePluginSettings({
    allowReordering: {
        description: "Let this plugin reorder messages based on when the message reached Discord's servers. This is kinda the entire point of the plugin.",
        type: OptionType.BOOLEAN,
        default: true,
    },
    showTimestamps: {
        description: "Show UTC ISO 8601 timestamps on messages. This is mainly used for debugging.",
        type: OptionType.BOOLEAN,
        default: false,
    },
});

export default definePlugin({
    name: "MessageCorrector",
    description: "Corrects the order of messages in the chat, based on when the message reached Discord's servers.",
    authors: [Devs.Calebh101],
    settings: settings,

    start() {
        if (enabled) logger.log("Started in " + (debug ? "debug" : "standard") + " mode");
    },

    stop() {
        if (enabled && debug) logger.log("Stopped");
    },

    patches: [
        {
            find: ",showNewMessagesBar:!",
            replacement: {
                match: /(\i)=\(0,(\w+)\.(\i)\)\(\{messages:(\w+)/,
                replace: "$1=(0,$2.$3)({messages:$self.reorder($4)",
            },
            predicate: () => enabled,
        },
    ],

    renderMessageAccessory: props => {
        if (!settings.store.showTimestamps) return null;
        if (!props.message?.timestamp) return null;

        // eslint-disable-next-line prefer-destructuring
        const state: string = props.message.state;
        var color: string;

        switch (state) {
            case "SENT":
                color = "green";
                break;

            case "SENDING":
            case "EDITING":
            case "DELETING":
                color = "goldenrod";
                break;

            case "FAILED":
                color = "red";
                break;

            default:
                color = "red";
                break;
        }

        return (
            <span
                className="vencord-appended-timestamp"
                style={{
                    fontSize: 14,
                    userSelect: "text",
                    color: color,
                }}
            >
                {props.message.timestamp.toISOString()}
            </span >
        );
    },

    reorder(messages: any) {
        try {
            if (debug) logger.log("Reordering messages...", typeof messages, messages);

            if (settings.store.allowReordering) {
                // Sort everything by their timestamp.
                // The timestamp is when the message reached Discord's servers.

                messages._array = [...messages._array].sort((a, b) => {
                    const tA = new Date(a.timestamp).getTime();
                    const tB = new Date(b.timestamp).getTime();
                    return tA - tB;
                });
            }

            return messages;
        } catch (e) {
            logger.warn("Unable to reorder messages", e);
        }
    }
});
