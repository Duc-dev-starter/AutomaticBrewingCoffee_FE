import { Download, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";

type ExportButtonProps = {
    loading: boolean;
};

const ExportButton: React.FC<ExportButtonProps> = ({ loading }) => {
    return (
        <Button
            disabled={loading}
            variant="outline"
            effect="shineHover"
            className="h-10 px-4 flex items-center border border-gray-600hover:bg-gray-800 transition"
        >
            <Download className={`mr-2 h-5 w-5`} />
            Xuất dữ liệu
        </Button>
    );
};

export default ExportButton;
