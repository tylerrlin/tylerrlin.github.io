import React from "react";

import Header from "@/components/Header/Header";
import Skills from "@/components/Skills/Skills";
import Projects from "@/components/Projects/Projects";
import About from "@/components/About/About";
import Contact from "@/components/Contact/Contact";

import NavBar from "@/components/NavBar";

const Home = () => {
    return (
        <div>
            <Header />
            <Skills />
            <Projects />
            <About />
            <Contact />
            <NavBar />
        </div>
    );
};

export default Home;
