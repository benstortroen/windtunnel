// Navigation footer
// Put links to other pages here

import Link from 'next/link';
import ThemeSwitcher from './ThemeSwitcher';
import { TbArrowsRight } from "react-icons/tb";
import { TbChartArrows } from "react-icons/tb";
import { MdContactEmergency } from "react-icons/md";
import { FaExternalLinkAlt } from "react-icons/fa";


export default function Footer(){
    

    return (
        <footer className="border-t bg-footer border-footer-border text-footer-text text-sm py-8 mt-auto ">
            <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center gap-4 justify-between">
                {/* Department info text */}
                <div className="">
                    <span className="text-sm"> 430 Akerman Hall, 110 Union St SE, Minneapolis, MN 55455 </span>
                    <a className="flex gap-2 items-center" href={"https://cse.umn.edu/aem"}> Department of Aerospace Engineering and Mechanics
                    <FaExternalLinkAlt size={10}/>
                    </a>
                </div>

                {/* Navigation and Theme Switcher*/}
                <div className="flex flex-col items-center gap-2 justify-between">
                    <nav className="flex flex-wrap justify-center gap-2 ">
                        <Link href="/dashboard/open-return" className="flex items-center gap-2 hover:text-footer-text/60 transition-colors">
                            <TbArrowsRight /> Open Return
                        </Link>

                        <span className="">|</span>

                        <Link href="/dashboard/closed-return" className="flex items-center gap-2 hover:text-footer-text/60 transition-colors">
                            <TbChartArrows /> Closed Return
                        </Link>

                        <span className="text-sm">|</span>

                        <Link href="/contact" className="flex items-center gap-2 hover:text-footer-text/60">
                            <MdContactEmergency/> Contact
                        </Link>
                    </nav>
                    <ThemeSwitcher/>
                </div>


            </div>
        </footer>
    )
}