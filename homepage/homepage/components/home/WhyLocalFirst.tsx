import { SectionHeader } from "gcmp-design-system/src/app/components/molecules/SectionHeader";
import { GappedGrid } from "gcmp-design-system/src/app/components/molecules/GappedGrid";
import {
    FileLock2Icon,
    GaugeIcon,
    KeyRoundIcon,
    MonitorSmartphoneIcon,
    MousePointerSquareDashedIcon,
    UploadCloudIcon,
    UserIcon,
    UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { ComingSoonBadge } from "gcmp-design-system/src/app/components/atoms/ComingSoonBadge";
import { LabelledFeatureIcon } from "gcmp-design-system/src/app/components/molecules/LabelledFeatureIcon";
import { Prose } from "gcmp-design-system/src/app/components/molecules/Prose";
import { H2 } from "gcmp-design-system/src/app/components/atoms/Headings";

export function WhyLocalFirst() {
    const features = [
        {
            title: "Instant updates",
            icon: GaugeIcon,
            description: (
                <>
                    <p>
                        Since you&apos;re working with local state,
                        your UI updates instantly. No spinners and API calls.
                    </p>
                </>
            ),
        },
        {
            title: "Real-time sync",
            icon: MonitorSmartphoneIcon,
            description: (
                <>
                    <p>
                      Every device with the same account will always have everything in sync.
                    </p>
                </>
            ),
        },
        {
            title: "Multiplayer",
            icon: MousePointerSquareDashedIcon,
            description: (
                <>
                    <p>
                        Share state with other users, and get automatic real-time
                        multiplayer.
                    </p>
                </>
            ),
        },
    ];
    return (
        <div className="flex flex-col gap-4 md:gap-6">
            <H2>Why local-first?</H2>

            <Prose size="lg">
                <p>
                    Local-first apps primarily store data locally, so your users can work offline.
                     When they&apos;re back online, their local changes are synced to the server.
                </p>
              <p>It turns the data flow around, giving you mutable local state, instantly synced.</p>
            </Prose>

            <GappedGrid>
                {features.map(({ title, icon: Icon, description }) => (
                    <LabelledFeatureIcon
                        className="col-span-2"
                        key={title}
                        label={title}
                        icon={Icon}
                        explanation={description}
                    />
                ))}
            </GappedGrid>
        </div>
    );
}
