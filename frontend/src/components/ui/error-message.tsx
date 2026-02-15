import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorMessageProps {
    title?: string;
    message: string;
    retry?: () => void;
}

export function ErrorMessage({
    title = "Error",
    message,
    retry
}: ErrorMessageProps) {
    return (
        <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
                <span>{message}</span>
                {retry && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={retry}
                        className="ml-4"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Retry
                    </Button>
                )}
            </AlertDescription>
        </Alert>
    );
}
