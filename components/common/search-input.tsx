import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SearchInputProps {
    searchValue: string;
    setSearchValue: (value: string) => void;
    loading: boolean;
    placeHolderText: string;
}

export const SearchInput = ({ searchValue, setSearchValue, loading, placeHolderText }: SearchInputProps) => {
    return (
        <div className="relative w-full sm:w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder={placeHolderText}
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                className="pl-8"
                disabled={loading}
            />
        </div>
    );
};