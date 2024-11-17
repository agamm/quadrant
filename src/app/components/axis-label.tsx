"use client";

import { useRef } from "react";
import { Input } from "@/components/ui/input";

interface AxisLabelProps {
	id: string;
	text: string;
	isEditing: boolean;
	onEdit: (e: React.MouseEvent | React.KeyboardEvent, id: string) => void;
	onChange: (e: React.ChangeEvent<HTMLInputElement>, id: string) => void;
	onFinishEditing: () => void;
	className?: string;
}

export function AxisLabel({
	id,
	text,
	isEditing,
	onEdit,
	onChange,
	onFinishEditing,
	className,
}: AxisLabelProps) {
	const inputRef = useRef<HTMLInputElement>(null);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			onEdit(e, id);
		}
	};

	return (
		<div
			role="button"
			tabIndex={0}
			className={`text-gray-300 text-base font-semibold ${className}`}
			onClick={(e) => onEdit(e, id)}
			onKeyDown={handleKeyDown}
		>
			{isEditing ? (
				<Input
					ref={inputRef}
					type="text"
					value={text}
					onChange={(e) => onChange(e, id)}
					onBlur={onFinishEditing}
					className="bg-gray-700 text-white px-2 py-1 rounded"
					autoFocus
				/>
			) : (
				text
			)}
		</div>
	);
}
