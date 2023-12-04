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
        image: "/comprchess.png",
        title: "COMPR[CH]ESS",
        description:
            "Lossless chess compression algorithm that adaptively and efficiently encodes chess games at given rating range.",
        github: "https://github.com/tylerrlin/compr-ch-ess",
        deployed: "/projects/comprchess",
        skills: ["Python", "Tensorflow", "Pandas"],
    },
];

export type { ProjectDataProps };
export default ProjectData;
