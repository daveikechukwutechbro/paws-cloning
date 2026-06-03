import { IconProps } from "../utils/types";

const PawsLogo: React.FC<IconProps> = ({ size = 24, className = "" }) => {
    return (
        <img
            src="https://i.imgur.com/MJZKj03.png"
            alt="PAWS"
            className={className}
            style={{ width: size, height: size }}
        />
    );
};

export default PawsLogo;
