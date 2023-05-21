import {UserStateType} from "~/types";

export const useUser = () => useState<UserStateType | null>('User', () => null)