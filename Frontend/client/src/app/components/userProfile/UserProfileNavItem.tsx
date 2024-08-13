import { IconType } from "react-icons";


interface UserProfileNavItemProps {
    selected?: boolean;
    icon: IconType;
    label: string;
    custom?: string;
    onClick?: () => void;
};


const UserProfileNavItem: React.FC<UserProfileNavItemProps> = ({ selected, icon: Icon, label, custom, onClick }) => {
    return (
        <div
            className={`flex items-center justify-center text-center gap-2 p-2  border-b-2 hover:text-slate-800 transition cursor-pointer ${selected ? 'border-b-slate-800 text-slate-800' : 'border-transparent text-slate-500'}`}
            onClick={onClick}
        >
            <Icon size={20} className={`${custom ? custom : ''}`} />
            <div className={`font-medium text-sm text-center break-normal ${custom ? custom : ''}`}>{label}</div>
        </div>
    )
}

export default UserProfileNavItem