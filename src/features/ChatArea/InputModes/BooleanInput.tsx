import React from 'react';
import Button from '../../../components/Button';
import { Check, X } from 'lucide-react';

export interface BooleanInputProps {
    /** 用户选择后的回调 */
    onSubmit: (value: boolean) => void;
    /** 是否禁用 */
    disabled?: boolean;
}

const BooleanInput: React.FC<BooleanInputProps> = ({
    onSubmit,
    disabled = false
}) => {
    return (
        <div className="flex gap-4 justify-center w-full max-w-md mx-auto">
            <Button
                variant="success"
                size="md"
                disabled={disabled}
                onClick={() => onSubmit(true)}
                className="flex-1 gap-2 shadow-sm"
            >
                <Check size={18} />
                <span>是 / 有异议</span>
            </Button>

            <Button
                variant="danger"
                size="md"
                disabled={disabled}
                onClick={() => onSubmit(false)}
                className="flex-1 gap-2 shadow-sm"
            >
                <X size={18} />
                <span>否 / 无异议</span>
            </Button>
        </div>
    );
};

export default BooleanInput;
