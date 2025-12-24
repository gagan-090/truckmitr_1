import { ThemeColors } from "@truckmitr/res/colors";
import { useTheme } from "@react-navigation/native";

export const useColor = (): ThemeColors => {
    const { colors } = useTheme();

    return colors as ThemeColors;
};