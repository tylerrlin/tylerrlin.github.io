// Site content lives here so details can change without touching layout.

export const profile = {
    name: "Tyler Lin",
    role: "Software engineer",
};

export const email = "tylerrlin@gmail.com";

export type SocialLink = {
    label: string;
    href: string;
    icon: "linkedin" | "github";
};

export const socials: SocialLink[] = [
    {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/tylerrlin/",
        icon: "linkedin",
    },
    { label: "GitHub", href: "https://github.com/tylerrlin", icon: "github" },
];
