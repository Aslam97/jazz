import { CodeExampleTabs, ResponsiveIframe } from "@/components/forMdx";
import {
    Prose,
    SmallProse,
} from "gcmp-design-system/src/app/components/molecules/Prose";
import { HeroHeader } from "gcmp-design-system/src/app/components/molecules/HeroHeader";
import { SectionHeader } from "gcmp-design-system/src/app/components/molecules/SectionHeader";
import { HairlineBleedGrid } from "gcmp-design-system/src/app/components/molecules/HairlineGrid";
import { GappedGrid } from "gcmp-design-system/src/app/components/molecules/GappedGrid";
import { LabelledFeatureIcon } from "gcmp-design-system/src/app/components/molecules/LabelledFeatureIcon";
import { GridCard } from "gcmp-design-system/src/app/components/atoms/GridCard";
import { CodeRef } from "gcmp-design-system/src/app/components/atoms/CodeRef";
import { ComingSoonBadge } from "gcmp-design-system/src/app/components/atoms/ComingSoonBadge";
import { UL } from "gcmp-design-system/src/app/components/molecules/List";
import { LI } from "gcmp-design-system/src/app/components/atoms/ListItem";
import { P } from "gcmp-design-system/src/app/components/atoms/Paragraph";
import { TextLink } from "gcmp-design-system/src/app/components/atoms/TextLink";

import {
    UploadCloudIcon,
    MonitorSmartphoneIcon,
    GaugeIcon,
    UsersIcon,
    FileLock2Icon,
    HardDriveDownloadIcon,
    KeyRoundIcon,
    MousePointerSquareDashedIcon,
} from "lucide-react";

import {
    Main_tsx,
    Schema_ts,
    App_tsx,
    ChatScreen_tsx,
    Ui_tsx,
} from "@/codeSamples/examples/chat/src";

import Intro from "./intro.mdx";
import CoValuesIntro from "./coValuesIntro.mdx";
import CoMapDescription from "./coValueDescriptions/coMapDescription.mdx";
import CoListDescription from "./coValueDescriptions/coListDescription.mdx";
import CoPlainTextDescription from "./coValueDescriptions/coPlainTextDescription.mdx";
import CoStreamDescription from "./coValueDescriptions/coStreamDescription.mdx";
import BinaryCoStreamDescription from "./coValueDescriptions/binaryCoStreamDescription.mdx";
import ImageDefinitionDescription from "./coValueDescriptions/imageDefinitionDescription.mdx";
import GroupDescription from "./coValueDescriptions/groupDescription.mdx";
import AccountDescription from "./coValueDescriptions/accountDescription.mdx";
import SupportedEnvironments from "./supportedEnvironments.mdx";
import AutoSubDescription from "./toolkit/autoSub.mdx";
import CursorsAndCaretsDescription from "./toolkit/cursorsAndCarets.mdx";
import AuthProvidersDescription from "./toolkit/authProviders.mdx";
import TwoWaySyncDescription from "./toolkit/twoWaySync.mdx";
import FileUploadDownloadDescription from "./toolkit/fileUploadDownload.mdx";
import VideoPresenceCallsDescription from "./toolkit/videoPresenceCalls.mdx";
import MeshIntro from "./meshIntro.mdx";
import { H3 } from "gcmp-design-system/src/app/components/atoms/Headings";

export default function Home() {
    return (
        <div className="space-y-16">
            <HeroHeader
                title="Instant sync."
                slogan="A new way to build apps with distributed state."
            />

            <HairlineBleedGrid>
                <LabelledFeatureIcon
                    label="Cross-device sync"
                    icon={MonitorSmartphoneIcon}
                />
                <LabelledFeatureIcon
                    label="Real-time multiplayer"
                    icon={MousePointerSquareDashedIcon}
                />
                <LabelledFeatureIcon
                    label="Team/social features"
                    icon={UsersIcon}
                />
                <LabelledFeatureIcon
                    label="Built-in permissions"
                    icon={FileLock2Icon}
                />
                <LabelledFeatureIcon
                    label="Cloud sync & storage"
                    icon={UploadCloudIcon}
                />
                <LabelledFeatureIcon
                    label="On-device storage"
                    icon={HardDriveDownloadIcon}
                />
                <LabelledFeatureIcon
                    label="Instant UI updates"
                    icon={GaugeIcon}
                />
                <LabelledFeatureIcon
                    label="E2EE & signatures"
                    icon={KeyRoundIcon}
                />

                <div className="col-start-1 row-start-1 row-span-2 col-span-2 px-4 md:px-6 pb-4 text-base">
                    <Prose>
                        <Intro />
                    </Prose>
                </div>
            </HairlineBleedGrid>

            <div>
                <SectionHeader
                    title="First impressions..."
                    slogan="A chat app in 174 lines of code."
                />

                <div className="flex flex-col md:grid md:grid-cols-2 md:divide-x border rounded-sm overflow-hidden shadow-sm dark:border-stone-900 dark:divide-stone-900">
                    <CodeExampleTabs
                        tabs={[
                            {
                                name: "main.tsx",
                                content: <Main_tsx />,
                            },
                            {
                                name: "app.tsx",
                                content: <App_tsx />,
                            },
                            {
                                name: "schema.ts",
                                content: <Schema_ts />,
                            },
                            {
                                name: "chatScreen.tsx",
                                content: <ChatScreen_tsx />,
                            },
                            {
                                name: "ui.tsx",
                                content: <Ui_tsx />,
                            },
                        ]}
                    />
                    <div className="border-b order-first md:order-last flex flex-col md:border-b-0">
                        <div className="flex border-b overflow-x-auto overflow-y-hidden bg-white dark:border-stone-900 dark:bg-stone-900">
                            <p className="flex items-center -mb-px transition-colors px-3 pb-1.5 pt-2 block text-xs border-b-2 border-blue-700 text-stone-700 dark:bg-stone-925 dark:text-blue-500 dark:border-blue-500">
                                result
                            </p>
                        </div>
                        <ResponsiveIframe
                            src="https://chat.jazz.tools"
                            localSrc="http://localhost:5173"
                        />
                    </div>
                </div>
            </div>

            <div>
                <SectionHeader
                    title="Collaborative Values"
                    slogan="Your new building blocks."
                />

                <Prose>
                    <CoValuesIntro />
                </Prose>
            </div>

            <GappedGrid
                title="Bread-and-butter datastructures"
                className="grid-cols-2 lg:grid-cols-4"
            >
                <GridCard>
                    <H3>
                        <CodeRef>CoMap</CodeRef>
                    </H3>
                    <SmallProse>
                        <CoMapDescription />
                    </SmallProse>
                </GridCard>

                <GridCard>
                    <H3>
                        <CodeRef>CoList</CodeRef>
                    </H3>
                    <SmallProse>
                        <CoListDescription />
                    </SmallProse>
                </GridCard>

                <GridCard>
                    <H3>
                        <CodeRef>CoPlainText</CodeRef> &{" "}
                        <CodeRef>CoRichText</CodeRef> <ComingSoonBadge />
                    </H3>
                    <SmallProse>
                        <CoPlainTextDescription />
                    </SmallProse>
                </GridCard>

                <GridCard>
                    <H3>
                        <CodeRef>CoStream</CodeRef>
                    </H3>
                    <SmallProse>
                        <CoStreamDescription />
                    </SmallProse>
                </GridCard>
            </GappedGrid>

            <GappedGrid
                title="First-class files & binary data"
                className="grid-cols-2 lg:grid-cols-4"
            >
                <GridCard>
                    <H3>
                        <CodeRef>BinaryCoStream</CodeRef>
                    </H3>
                    <SmallProse>
                        <BinaryCoStreamDescription />
                    </SmallProse>
                </GridCard>

                <GridCard>
                    <H3>
                        <CodeRef>ImageDefinition</CodeRef>
                    </H3>
                    <SmallProse>
                        <ImageDefinitionDescription />
                    </SmallProse>
                </GridCard>
            </GappedGrid>

            <GappedGrid
                title="Secure permissions, authorship & teams"
                className="grid-cols-2 lg:grid-cols-4"
            >
                <GridCard>
                    <H3>
                        <CodeRef>Group</CodeRef>
                    </H3>
                    <SmallProse>
                        <GroupDescription />
                    </SmallProse>
                </GridCard>
                <GridCard>
                    <H3>
                        <CodeRef>Account</CodeRef>
                    </H3>
                    <SmallProse>
                        <AccountDescription />
                    </SmallProse>
                </GridCard>
            </GappedGrid>

            <div>
                <SectionHeader
                    title="The Jazz Toolkit"
                    slogan="A high-level toolkit for building apps around CoValues."
                />

                <Prose>Supported environments:</Prose>
                <SmallProse>
                    <SupportedEnvironments />
                </SmallProse>
            </div>

            <GappedGrid>
                <GridCard>
                    <SectionHeader
                        title="Auto-sub"
                        slogan="Let your UI drive data-syncing."
                    />
                    <SmallProse>
                        <AutoSubDescription />
                    </SmallProse>
                </GridCard>

                <GridCard>
                    <SectionHeader
                        title="Cursors & carets"
                        slogan="Ready-made spatial presence."
                    />
                    <SmallProse>
                        <CursorsAndCaretsDescription />
                    </SmallProse>
                </GridCard>

                <GridCard>
                    <SectionHeader
                        title="Auth Providers"
                        slogan="Plug and play different kinds of auth."
                    />
                    <SmallProse>
                        <AuthProvidersDescription />
                    </SmallProse>
                </GridCard>

                <GridCard>
                    <SectionHeader
                        title="Two-way sync to your DB"
                        slogan="Add Jazz to an existing app."
                    />
                    <SmallProse>
                        <TwoWaySyncDescription />
                    </SmallProse>
                </GridCard>

                <GridCard>
                    <SectionHeader
                        title="File upload & download"
                        slogan={
                            <>
                                Just use{" "}
                                <CodeRef>{`<input type='file'/>`}</CodeRef>.
                            </>
                        }
                    />
                    <SmallProse>
                        <FileUploadDownloadDescription />
                    </SmallProse>
                </GridCard>

                <GridCard>
                    <SectionHeader
                        title="Video presence & calls"
                        slogan="Stream and record audio & video."
                    />
                    <SmallProse>
                        <VideoPresenceCallsDescription />
                    </SmallProse>
                </GridCard>
            </GappedGrid>

            <div>
                <SectionHeader
                    title="Jazz Mesh"
                    slogan="Serverless sync & storage for Jazz apps"
                />

                <Prose>
                    <MeshIntro />
                </Prose>

                <P>
                    {"->"}{" "}
                    <TextLink href="/mesh" target="_blank">
                        Learn more about Jazz Mesh
                    </TextLink>
                </P>
            </div>

            <div>
                <H3>Get Started</H3>
                <UL>
                    <LI>
                        <TextLink href="/docs" target="_blank">
                            Read the docs
                        </TextLink>
                    </LI>
                    <LI>
                        <TextLink
                            href="https://discord.gg/utDMjHYg42"
                            target="_blank"
                        >
                            Join our Discord
                        </TextLink>
                    </LI>
                </UL>
            </div>
        </div>
    );
}
