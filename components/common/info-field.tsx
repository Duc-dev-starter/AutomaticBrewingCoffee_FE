export const InfoField = ({
    label,
    value,
    icon,
    className,
}: {
    label: string
    value: React.ReactNode
    icon: React.ReactNode
    className?: string
}) => (
    <div className={`space-y-1 ${className || ""}`}>
        <div className="flex items-center space-x-2 text-gray-600 text-sm">
            {icon}
            <span>{label}</span>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-800">
            {value || <span className="text-gray-400 italic">Chưa có</span>}
        </div>
    </div>
)
