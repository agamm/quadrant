"use client";

import { useRef } from "react";
import { Input } from "@/components/ui/input";

interface AxisLabelProps {
	id: string;
	text: string;
	isEditing: boolean;
	onEdit: (e: EditEvent, id: string) => void;
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

	return (
		<button
			type="button"
			className={`text-gray-300 text-base font-semibold ${className} bg-transparent border-none w-full text-left`}
			onClick={(e) => onEdit(e, id)}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onEdit(e, id);
				}
			}}
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
		</button>
	);
}
