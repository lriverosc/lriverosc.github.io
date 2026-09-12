import { SiGithub, SiLinkedin } from "react-icons/si";
import { config } from "@/data/config";
export default function SocialMediaButtons() {
  return <div className="z-10 flex gap-4"><a href={config.social.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub de Luis Riveros" className="p-2"><SiGithub size={22} /></a><a href={config.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn de Luis Riveros" className="p-2"><SiLinkedin size={22} /></a></div>;
}
