import { IconProps } from "../utils/types";

const PawsLogo: React.FC<IconProps> = ({ className = "" }) => {
    return (
        <img
            src="https://i.imgur.com/MJZKj03.png"
            alt="PAWS"
            className={className}
        />
    );
};

export default PawsLogo;
