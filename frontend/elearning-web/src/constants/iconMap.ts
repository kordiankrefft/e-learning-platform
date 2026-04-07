import {
  FaLaptop,
  FaUserClock,
  FaMobileAlt,
  FaGlobeEurope,
} from "react-icons/fa";
import type { ElementType } from "react";

export const iconMap: Record<string, ElementType> = {
  userClock: FaUserClock,
  laptop: FaLaptop,
  mobile: FaMobileAlt,
  globe: FaGlobeEurope,
};
