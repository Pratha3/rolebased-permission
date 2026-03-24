import React from "react";
import { Input } from "../ui/input";


interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ComponentType<{ className?: string }>;
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
    ({ icon: Icon, className = "", type = "text", ...props }, ref) => {

        const getAutoComplete = () => {
            if (props.autoComplete) return props.autoComplete;
            if (type === "email") return "email";
            if (props.name === "firstName") return "given-name";
            if (props.name === "lastName") return "family-name";
            return undefined;
        };

        return (
            <div className="relative">
                {Icon && <Icon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />}
                <Input
                    {...props}
                    ref={ref}
                    type={type}
                    autoComplete={getAutoComplete()}
                    className={`${Icon ? "pl-9" : ""} ${className}`}
                />
            </div>
        );
    }
);

InputField.displayName = "InputField";
