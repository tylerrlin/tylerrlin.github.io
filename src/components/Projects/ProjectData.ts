interface ProjectDataProps {
    image: string;
    title: string;
    description: string;
    github: string;
    deployed: string;
    skills: string[];
}

const ProjectData: ProjectDataProps[] = [
    {
        image: "/project1.png",
        title: "Personal Portfolio",
        description:
            "Personal portfolio built with NextJS 13. Custom animations utilizing Framer Motion and responsive app optimized for mobile/desktop. Focus on clean design and user experience.",
        github: "https://github.com/tylerrlin/tylerrlin.github.io",
        deployed: "https://tylerrlin.github.io/",
        skills: ["NextJS 13", "React", "TypeScript", "TailwindCSS"],
    },
];

export type { ProjectDataProps };
export default ProjectData;
