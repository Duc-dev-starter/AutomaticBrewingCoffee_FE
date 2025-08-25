import { Download } from "lucide-react";
import { Button } from "../ui/button";

type ExportButtonProps = {
    loading: boolean;
    onExport?: () => void;
};

const ExportButton: React.FC<ExportButtonProps> = ({ loading, onExport }) => {
    return (
        <Button
            onClick={onExport}
            disabled={loading}
            variant="outline"
            effect="shineHover"
            className="h-10 px-4 flex items-center"
        >
            <Download className="mr-2 h-5 w-5" />
            {loading ? "Đang xuất dữ liệu..." : "Xuất dữ liệu"}
        </Button>
    );
};

export default ExportButton;
