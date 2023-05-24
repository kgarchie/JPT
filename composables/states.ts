import {UserStateType} from "~/types";
import MarkdownIt from "markdown-it";

export const useUser = () => useState<UserStateType | null>('User', () => null)