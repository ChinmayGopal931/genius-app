import { ModeToggle } from "../mode-toggle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGithub,
  faXTwitter,
  faDiscord,
} from "@fortawesome/free-brands-svg-icons";
import { useTheme } from "@/hooks/useTheme";

export function Footer() {
  const { theme } = useTheme();

  return (
    <div className="pt-10 flex-col">
      <div className="flex flex-row border-bottom-header mb-12 items-center justify-center w-full">
        <img
          src={"/assets/genius.png"}
          alt="Genius Finance Logo"
          className="w-100 h-20"
        />
      </div>

      <div className="flex flex-col py-12">
        <div className="flex justify-center gap-12">
          <a
            href="https://github.com/yourusername"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faGithub} size="lg" />
          </a>
          <a
            href="https://twitter.com/yourusername"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faXTwitter} size="lg" />
          </a>
          <a
            href="https://linkedin.com/in/yourusername"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faDiscord} size="lg" />
          </a>
          <div className="ml-[-14]">
            <ModeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
